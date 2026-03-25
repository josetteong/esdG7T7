"""
AMQP subscriber for the reservation-service.

Listens for "listing.expired.internal" events published by the expiry-monitor-service.
For each expired listing:
  1. Cancels all active (RESERVED) reservations in the DB.
  2. Calls OutSystems Notify API per affected claimant → OutSystems → bridge → RabbitMQ → Telegram.
"""

import json
import logging
import os
import threading
import time

import pika
import requests

from .service import expire_reservations_for_listing

logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://admin:admin123@rabbitmq:5672")
OUTSYSTEMS_NOTIFY_URL = os.getenv(
    "OUTSYSTEMS_NOTIFY_URL",
    "https://personal-42atob5v.outsystemscloud.com/Notification/rest/NotificationAPI/notify",
)
EXCHANGE = "food_rescue"
ROUTING_KEY = "listing.expired.internal"


def _notify_claimant(claimant_id: str, food_name: str):
    """Call OutSystems Notify API → OutSystems PostPublish → bridge → RabbitMQ → Telegram."""
    try:
        resp = requests.post(
            OUTSYSTEMS_NOTIFY_URL,
            json={
                "RecipientId": claimant_id,
                "Type": "listing.expired",
                "Message": (
                    f"Your reservation for {food_name} has been cancelled "
                    f"because the listing has expired."
                ),
            },
            timeout=10,
        )
        resp.raise_for_status()
        logger.info("OutSystems Notify sent for claimant %s", claimant_id)
    except requests.RequestException as e:
        logger.error("Failed to call OutSystems Notify for claimant %s: %s", claimant_id, e)


def _on_listing_expired(channel, method, properties, body):
    data = json.loads(body)
    listing_id = data["listing_id"]
    food_name = data.get("food_name", "a listing")
    logger.info("Received listing.expired.internal for listing %s (%s)", listing_id, food_name)

    # 1. Cancel all active reservations in DB
    cancelled = expire_reservations_for_listing(listing_id)
    logger.info("Cancelled %d reservation(s) for listing %s", len(cancelled), listing_id)

    # 2. Notify each affected claimant via OutSystems
    for reservation in cancelled:
        _notify_claimant(reservation["claimant_id"], food_name)

    channel.basic_ack(delivery_tag=method.delivery_tag)


def _connect_and_consume():
    while True:
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)

            # Named durable queue — persists across restarts, visible in management UI
            channel.queue_declare(queue="listing.expired.internal", durable=True)
            channel.queue_bind(exchange=EXCHANGE, queue="listing.expired.internal", routing_key=ROUTING_KEY)

            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue="listing.expired.internal", on_message_callback=_on_listing_expired)

            logger.info(
                "AMQP consumer ready — subscribed to [%s] on exchange '%s'",
                ROUTING_KEY, EXCHANGE,
            )
            channel.start_consuming()

        except Exception as e:
            logger.error("AMQP consumer error: %s — retrying in 5s", e)
            time.sleep(5)


def start_consumer():
    """Start the AMQP subscriber in a daemon thread (called on FastAPI startup)."""
    thread = threading.Thread(target=_connect_and_consume, daemon=True)
    thread.start()
