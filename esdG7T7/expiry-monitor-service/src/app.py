import json
import logging
import os
import yaml
from datetime import datetime, timezone, timedelta

import pika
import requests
from flask import Flask, jsonify
from flasgger import Swagger
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
Swagger(app, template=yaml.safe_load(open("/app/src/swagger.yaml")))
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

LISTING_SERVICE_URL = os.getenv("LISTING_SERVICE_URL", "http://listing-service:8000")
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://admin:admin123@rabbitmq:5672")
CRON_INTERVAL_MINUTES = int(os.getenv("CRON_INTERVAL_MINUTES", "1"))
EXCHANGE = "food_rescue"

EXPIRABLE_STATUSES = {"AVAILABLE", "FULLY_RESERVED"}


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

##################################################################################################################################
"""
For each AVAILABLE or FULLY_RESERVED listing:
  If now > expiry_time:
    ├─ PATCH /listings/{id}/expire             → listing-service
    └─ Publish listing.expired.internal        → reservation-service consumer
                                                  (cascades to cancel all reservations
                                                   and notify claimants/vendor)
"""
##################################################################################################################################
def check_and_expire_listings():
    logger.info("Running expiry check...")
    try:

        #Get the listing from listing svc 
        response = requests.get(f"{LISTING_SERVICE_URL}/listings", timeout=10)
        response.raise_for_status()
        listings = response.json()
    except requests.RequestException as e:
        logger.error("Failed to fetch listings: %s", e)
        return {"error": str(e), "expired": []}

    now = datetime.now(timezone.utc)
    expired_ids = []
    failed_ids = []

    for listing in listings:
        if listing.get("status") not in EXPIRABLE_STATUSES:
            continue

        expiry_time_str = listing.get("expiry_time")
        if not expiry_time_str:
            continue
        
        #Check expiry
        expiry_time = datetime.fromisoformat(expiry_time_str)
        if expiry_time.tzinfo is None:
            expiry_time = expiry_time.replace(tzinfo=timezone.utc)

        if now > expiry_time:
            listing_id = listing["id"]
            try:
                patch_resp = requests.patch(
                    f"{LISTING_SERVICE_URL}/listings/{listing_id}/expire", timeout=10
                )
                patch_resp.raise_for_status()
                logger.info("Expired listing %s (%s)", listing_id, listing.get("food_name"))
                expired_ids.append(listing_id)
                #publish internal message when expired for consumption for reservation svc 
                _publish("listing.expired.internal", {
                    "listing_id": listing_id,
                    "vendor_id": listing.get("vendor_id"),
                    "food_name": listing.get("food_name"),
                    "expired_at": now.isoformat(),
                })

            except requests.RequestException as e:
                logger.error("Failed to expire listing %s: %s", listing_id, e)
                failed_ids.append(listing_id)

    logger.info("Expiry check done. Expired: %d, Failed: %d", len(expired_ids), len(failed_ids))
    return {"expired": expired_ids, "failed": failed_ids}


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/trigger", methods=["POST"])
def trigger():
    result = check_and_expire_listings()
    return jsonify(result)


if __name__ == "__main__":
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        check_and_expire_listings,
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
