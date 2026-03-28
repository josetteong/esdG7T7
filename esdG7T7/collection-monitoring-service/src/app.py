"""
Collection Monitoring Service — cron-based missed pickup detector.

Flow (runs on schedule):
  1. GET  /reservations         — find RESERVED reservations past pickup_time
  2. PATCH /reservations/{id}/missed-pickup — mark as MISSED_PICKUP
  3. PATCH /listings/{id}/release           — restore qty back to listing
  4. Publish claimant.missed_collection     — strike-service and notification-service subscribe
"""

import json
import logging
import os
from datetime import datetime, timezone

import pika
import requests
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, jsonify
from flasgger import Swagger

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)
Swagger(app, template_file=os.path.join(os.path.dirname(__file__), "swagger.yaml"))

RESERVATION_SERVICE_URL = os.getenv("RESERVATION_SERVICE_URL", "http://reservation-service:8000")
LISTING_SERVICE_URL     = os.getenv("LISTING_SERVICE_URL",     "http://listing-service:8000")
RABBITMQ_URL            = os.getenv("RABBITMQ_URL",            "amqp://admin:admin123@rabbitmq:5672")
CRON_INTERVAL_MINUTES   = int(os.getenv("CRON_INTERVAL_MINUTES", "1"))
EXCHANGE                = "food_rescue"


def _publish(routing_key: str, payload: dict):
    try:
        params = pika.URLParameters(RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
        channel.basic_publish(
            exchange=EXCHANGE,
            routing_key=routing_key,
            body=json.dumps(payload),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        connection.close()
        logger.info("Published to [%s]: %s", routing_key, payload)
    except Exception as e:
        logger.error("Failed to publish to RabbitMQ: %s", e)


def check_missed_collections():
    logger.info("Running missed collection check...")
    try:
        resp = requests.get(f"{RESERVATION_SERVICE_URL}/reservations", timeout=10)
        resp.raise_for_status()
        reservations = resp.json()
    except requests.RequestException as e:
        logger.error("Failed to fetch reservations: %s", e)
        return

    now = datetime.now(timezone.utc)
    processed, failed = 0, 0

    for reservation in reservations:
        if reservation.get("status") != "RESERVED":
            continue

        pickup_time_str = reservation.get("pickup_time")
        if not pickup_time_str:
            continue

        pickup_time = datetime.fromisoformat(pickup_time_str)
        if pickup_time.tzinfo is None:
            pickup_time = pickup_time.replace(tzinfo=timezone.utc)

        if now <= pickup_time:
            continue

        reservation_id = reservation["id"]
        listing_id     = reservation["listing_id"]
        claimant_id    = reservation["claimant_id"]
        qty            = reservation["reservation_qty"]

        try:
            # 1. Mark reservation as MISSED_PICKUP
            requests.patch(
                f"{RESERVATION_SERVICE_URL}/reservations/{reservation_id}/missed-pickup",
                timeout=10,
            ).raise_for_status()

            # 2. Fetch listing for food_name
            listing_resp = requests.get(
                f"{LISTING_SERVICE_URL}/listings/{listing_id}", timeout=10
            )
            listing_resp.raise_for_status()
            listing   = listing_resp.json()
            food_name = listing.get("food_name", "the listing")

            # 3. Release qty back to listing
            requests.patch(
                f"{LISTING_SERVICE_URL}/listings/{listing_id}/release",
                json={"qty": qty},
                timeout=10,
            ).raise_for_status()

            # 4. Publish missed_collection event
            _publish("claimant.missed_collection", {
                "recipient_id":      claimant_id,
                "recipient_type":    "CLAIMANT",
                "notification_type": "MISSED_PICKUP",
                "claimant_id":       claimant_id,
                "reservation_id":    reservation_id,
                "listing_id":        listing_id,
                "food_name":         food_name,
                "missed_at":         now.isoformat(),
                "message": (
                    f"You missed your collection for '{food_name}' "
                    f"(Listing ID: {listing_id}, Reservation ID: {reservation_id}). "
                    f"A strike has been recorded against your account."
                ),
            })


            logger.info(
                "Processed missed collection — reservation %s, claimant %s",
                reservation_id, claimant_id,
            )
            processed += 1

        except Exception as e:
            logger.error("Failed to process reservation %s: %s", reservation_id, e)
            failed += 1

    logger.info("Missed collection check done. Processed: %d, Failed: %d", processed, failed)


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/trigger", methods=["POST"])
def trigger():
    check_missed_collections()
    return jsonify({"status": "triggered"})


if __name__ == "__main__":
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        check_missed_collections,
        "interval",
        minutes=CRON_INTERVAL_MINUTES,
        next_run_time=datetime.now(),
    )
    scheduler.start()
    logger.info("Scheduler started — running every %d minute(s)", CRON_INTERVAL_MINUTES)

    try:
        app.run(host="0.0.0.0", port=5000)
    finally:
        scheduler.shutdown()
