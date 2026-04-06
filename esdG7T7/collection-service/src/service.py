import json
import logging
import os
from datetime import datetime, timezone

import pika
import requests

logger = logging.getLogger(__name__)

RESERVATION_SERVICE_URL = os.getenv("RESERVATION_SERVICE_URL", "http://reservation-service:8000")
LISTING_SERVICE_URL     = os.getenv("LISTING_SERVICE_URL",     "http://listing-service:8000")
RABBITMQ_URL            = os.getenv("RABBITMQ_URL",            "amqp://admin:admin123@rabbitmq:5672")
EXCHANGE                = "food_rescue"


def _publish(channel, routing_key: str, payload: dict):
    channel.basic_publish(
        exchange=EXCHANGE,
        routing_key=routing_key,
        body=json.dumps(payload),
        properties=pika.BasicProperties(delivery_mode=2),
    )
    logger.info("Published %s → %s", routing_key, payload)


def handle_collection(reservation_id: str, claimant_id: str) -> tuple[dict, int]:
    resp = requests.get(f"{RESERVATION_SERVICE_URL}/reservations/{reservation_id}", timeout=10)
    if resp.status_code == 404:
        return {"error": "Reservation not found"}, 404
    resp.raise_for_status()
    reservation = resp.json()

    if str(reservation["claimant_id"]) != str(claimant_id):
        return {"error": "Claimant mismatch"}, 403

    if reservation["status"] != "RESERVED":
        return {"error": f"Cannot collect a reservation with status {reservation['status']}"}, 409

    pickup_time = datetime.fromisoformat(reservation["pickup_time"])
    now = datetime.now(timezone.utc)
    if now > pickup_time:
        return {"error": "Pickup window has passed"}, 409

    listing_id = reservation["listing_id"]

    complete_resp = requests.patch(
        f"{RESERVATION_SERVICE_URL}/reservations/{reservation_id}/complete",
        params={"claimant_id": claimant_id},
        timeout=10,
    )
    if complete_resp.status_code == 400:
        return {"error": "Could not complete reservation"}, 400
    complete_resp.raise_for_status()

    listing_resp = requests.get(f"{LISTING_SERVICE_URL}/listings/{listing_id}", timeout=10)
    listing_resp.raise_for_status()
    listing = listing_resp.json()

    vendor_id = listing.get("vendor_id")
    food_name = listing.get("food_name", "the listing")

    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)

    _publish(channel, "claimant.reservation.completed", {
        "recipient_id":      claimant_id,
        "recipient_type":    "CLAIMANT",
        "notification_type": "RESERVATION_COMPLETED",
        "message":           f"You have successfully collected '{food_name}' (Listing ID: {listing_id}). Thank you!",
    })

    _publish(channel, "vendor.reservation.completed", {
        "recipient_id":      vendor_id,
        "recipient_type":    "VENDOR",
        "notification_type": "RESERVATION_COMPLETED",
        "message":           f"Your listing '{food_name}' (Listing ID: {listing_id}) has been collected by a claimant.",
    })

    connection.close()

    return {
        "reservation_id": reservation_id,
        "claimant_id":    claimant_id,
        "listing_id":     listing_id,
        "vendor_id":      vendor_id,
        "status":         "COMPLETED",
    }, 200
