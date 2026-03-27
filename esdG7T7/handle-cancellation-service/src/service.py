"""
Handle Cancellation — orchestration logic.

Flow:
  1. GET  reservation from reservation-service
  2. If now - reserved_at > 10 min → POST strike to strike-service
  3. PATCH reservation → CANCELLED  (reservation-service)
  4. If now <= listing expiry_time   → PATCH listing → AVAILABLE (listing-service)
     Else                            → publish AMQP vendor expiry-alert
  5. Publish AMQP cancellation notification (claimant + vendor)
"""

import json
import logging
import os
from datetime import datetime, timezone, timedelta

import pika
import requests

logger = logging.getLogger(__name__)

RESERVATION_SERVICE_URL = os.getenv("RESERVATION_SERVICE_URL", "http://reservation-service:8000")
LISTING_SERVICE_URL     = os.getenv("LISTING_SERVICE_URL",     "http://listing-service:8000")
STRIKE_SERVICE_URL      = os.getenv("STRIKE_SERVICE_URL",      "http://strike-service:8000")
RABBITMQ_URL            = os.getenv("RABBITMQ_URL",            "amqp://admin:admin123@rabbitmq:5672")
EXCHANGE                = "food_rescue"
GRACE_PERIOD_MINUTES    = 10


def _publish(channel, routing_key: str, payload: dict):
    channel.basic_publish(
        exchange=EXCHANGE,
        routing_key=routing_key,
        body=json.dumps(payload),
        properties=pika.BasicProperties(delivery_mode=2),
    )
    logger.info("Published %s → %s", routing_key, payload)


def handle_cancellation_claimant(reservation_id: int, claimant_id: int) -> tuple[dict, int]:
    # ------------------------------------------------------------------
    # 1. Fetch reservation
    # ------------------------------------------------------------------
    resp = requests.get(f"{RESERVATION_SERVICE_URL}/reservations/{reservation_id}", timeout=10)
    if resp.status_code == 404:
        return {"error": "Reservation not found"}, 404
    resp.raise_for_status()
    reservation = resp.json()

    if str(reservation["claimant_id"]) != str(claimant_id):
        return {"error": "Claimant mismatch"}, 403

    if reservation["status"] != "RESERVED":
        return {"error": f"Cannot cancel a reservation with status {reservation['status']}"}, 409

    listing_id  = reservation["listing_id"]
    reserved_at = datetime.fromisoformat(reservation["created_at"])
    now         = datetime.now(timezone.utc)

    # ------------------------------------------------------------------
    # 2. Strike check — late cancellation?
    # ------------------------------------------------------------------
    late_cancel   = (now - reserved_at) > timedelta(minutes=GRACE_PERIOD_MINUTES)
    strike_count  = None
    suspended     = False

    if late_cancel:
        strike_resp = requests.post(
            f"{STRIKE_SERVICE_URL}/strikes/apply",
            json={"claimant_id": claimant_id},
            timeout=10,
        )
        strike_resp.raise_for_status()
        # Fetch updated count and eligibility after applying strike
        count_resp = requests.get(f"{STRIKE_SERVICE_URL}/strikes/{claimant_id}", timeout=10)
        count_resp.raise_for_status()
        strike_count = count_resp.json().get("count", 0)
        elig_resp = requests.get(f"{STRIKE_SERVICE_URL}/strikes/{claimant_id}/eligibility", timeout=10)
        elig_resp.raise_for_status()
        suspended = not elig_resp.json().get("eligible", True)
        logger.info("Strike applied — claimant %s now has %d strike(s)", claimant_id, strike_count)

    # ------------------------------------------------------------------
    # 3. Cancel the reservation
    # ------------------------------------------------------------------
    cancel_resp = requests.patch(
        f"{RESERVATION_SERVICE_URL}/reservations/{reservation_id}/cancel",
        params={"claimant_id": claimant_id},
        timeout=10,
    )
    cancel_resp.raise_for_status()

    # ------------------------------------------------------------------
    # 4. Listing — relist or notify vendor of no-relist
    # ------------------------------------------------------------------
    listing_resp = requests.get(f"{LISTING_SERVICE_URL}/listings/{listing_id}", timeout=10)
    listing_resp.raise_for_status()
    listing = listing_resp.json()

    expiry_time   = datetime.fromisoformat(listing["expiry_time"])
    listing_valid = now <= expiry_time
    food_name     = listing.get("food_name", "the listing")
    vendor_id     = listing.get("vendor_id")

    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)

    if listing_valid:
        # Relist — put qty back to AVAILABLE
        relist_resp = requests.patch(
            f"{LISTING_SERVICE_URL}/listings/{listing_id}/release",
            json={"qty": reservation.get("reservation_qty", 1)},
            timeout=10,
        )
        relist_resp.raise_for_status()
        logger.info("Listing %s returned to AVAILABLE", listing_id)
    else:
        # Listing already expired — alert vendor it won't be relisted
        _publish(channel, "notification.vendor.listing_expired_no_relist", {
            "recipient_id":       vendor_id,
            "recipient_type":     "VENDOR",
            "notification_type":  "LISTING_EXPIRED",
            "message": (
                f"Your listing '{food_name}' has expired and will not be relisted "
                f"as the claimant cancelled after expiry."
            ),
        })

    # ------------------------------------------------------------------
    # 5. Notify claimant + vendor of cancellation
    # ------------------------------------------------------------------
    penalty_note = ""
    if late_cancel:
        penalty_note = f" A strike has been applied (total: {strike_count})."
        if suspended:
            penalty_note += " Your account has been suspended."

    _publish(channel, "claimant.reservation.cancelled", {
        "recipient_id":      claimant_id,
        "recipient_type":    "CLAIMANT",
        "notification_type": "RESERVATION_CANCELLED",
        "message": (
            f"Your reservation for '{food_name}' has been cancelled.{penalty_note}"
        ),
    })

    _publish(channel, "vendor.reservation.cancelled", {
        "recipient_id":      vendor_id,
        "recipient_type":    "VENDOR",
        "notification_type": "RESERVATION_CANCELLED",
        "message": (
            f"A claimant has cancelled their reservation for '{food_name}'."
            + (" The listing has been relisted." if listing_valid else " The listing has expired.")
        ),
    })

    connection.close()

    return {
        "reservation_id":  reservation_id,
        "claimant_id":     claimant_id,
        "listing_id":      listing_id,
        "status":          "CANCELLED",
        "late_cancel":     late_cancel,
        "strike_applied":  late_cancel,
        "strike_count":    strike_count,
        "suspended":       suspended,
        "listing_relisted": listing_valid,
    }, 200


def handle_cancellation_vendor(listing_id: int, vendor_id: int) -> tuple[dict, int]:
    # ------------------------------------------------------------------
    # 1. Fetch listing and verify ownership
    # ------------------------------------------------------------------
    listing_resp = requests.get(f"{LISTING_SERVICE_URL}/listings/{listing_id}", timeout=10)
    if listing_resp.status_code == 404:
        return {"error": "Listing not found"}, 404
    listing_resp.raise_for_status()
    listing = listing_resp.json()

    if str(listing.get("vendor_id")) != str(vendor_id):
        return {"error": "Vendor mismatch"}, 403

    if listing["status"] not in ("AVAILABLE", "FULLY_RESERVED"):
        return {"error": f"Cannot cancel a listing with status {listing['status']}"}, 409

    food_name = listing.get("food_name", "the listing")

    # ------------------------------------------------------------------
    # 2. Cancel the listing
    # ------------------------------------------------------------------
    cancel_listing_resp = requests.patch(
        f"{LISTING_SERVICE_URL}/listings/{listing_id}/cancel",
        timeout=10,
    )
    cancel_listing_resp.raise_for_status()
    logger.info("Listing %s cancelled by vendor %s", listing_id, vendor_id)

    # ------------------------------------------------------------------
    # 3. Cancel all active reservations for this listing
    # ------------------------------------------------------------------
    reservations_resp = requests.patch(
        f"{RESERVATION_SERVICE_URL}/reservations/cancel-by-listing/{listing_id}",
        timeout=10,
    )
    reservations_resp.raise_for_status()
    cancelled_reservations = reservations_resp.json().get("cancelled", [])
    logger.info("Cancelled %d reservation(s) for listing %s", len(cancelled_reservations), listing_id)

    # ------------------------------------------------------------------
    # 4. Publish cancellation notification to each affected claimant
    # ------------------------------------------------------------------
    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)

    for reservation in cancelled_reservations:
        _publish(channel, "claimant.reservation.cancelled", {
            "recipient_id":      reservation["claimant_id"],
            "recipient_type":    "CLAIMANT",
            "notification_type": "RESERVATION_CANCELLED",
            "message": (
                f"Your reservation for '{food_name}' has been cancelled "
                f"because the vendor has cancelled the listing."
            ),
        })

    connection.close()

    return {
        "listing_id":              listing_id,
        "vendor_id":               vendor_id,
        "status":                  "CANCELLED",
        "reservations_cancelled":  len(cancelled_reservations),
    }, 200
