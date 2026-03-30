"""
AMQP subscriber for the reservation-service.

Listens for "listing.expired.internal" events published by the expiry-monitor-service.
For each expired listing:
  1. Cancels all active (RESERVED) reservations in the DB.
  2. Calls OutSystems Notify API per affected claimant - OutSystems sends Telegram directly (no local bridge).
"""

import json
import logging
import os
import threading
import time

import pika

from .service import expire_reservations_for_listing

logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://admin:admin123@rabbitmq:5672")
EXCHANGE = "food_rescue"
ROUTING_KEY = "listing.expired.internal"


def _on_listing_expired(channel, method, properties, body):
    data = json.loads(body)
    listing_id = data["listing_id"]
    vendor_id  = data.get("vendor_id")
    food_name  = data.get("food_name", "a listing")
    logger.info("Received listing.expired.internal for listing %s (%s)", listing_id, food_name)

    # 1. Cancel all active reservations in DB
    cancelled = expire_reservations_for_listing(listing_id)
    logger.info("Cancelled %d reservation(s) for listing %s", len(cancelled), listing_id)

    # 2. Publish listing.expired per claimant - notification-service triggers OutSystems (no bridge)
    for reservation in cancelled:
        channel.basic_publish(
            exchange=EXCHANGE,
            routing_key="listing.expired",
            body=json.dumps({
                "recipient_id": reservation["claimant_id"],
                "recipient_type": "CLAIMANT",
                "notification_type": "LISTING_EXPIRED",
                "message": (
                    f"Your reservation for '{food_name}' (Listing ID: {listing_id}) has been cancelled "
                    f"because the listing has expired."
                ),
            }),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        logger.info("Published listing.expired for claimant %s", reservation["claimant_id"])

    # 3. Publish listing.expired to vendor
    if vendor_id:
        channel.basic_publish(
            exchange=EXCHANGE,
            routing_key="listing.expired",
            body=json.dumps({
                "recipient_id": vendor_id,
                "recipient_type": "VENDOR",
                "notification_type": "LISTING_EXPIRED",
                "message": (
                    f"Your listing '{food_name}' (Listing ID: {listing_id}) has expired. "
                    f"{len(cancelled)} reservation(s) have been cancelled."
                ),
            }),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        logger.info("Published listing.expired for vendor %s", vendor_id)

    channel.basic_ack(delivery_tag=method.delivery_tag)


def _connect_and_consume():
    while True:
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)

            # Named durable queue - persists across restarts, visible in management UI
            channel.queue_declare(queue="listing.expired.internal", durable=True)
            channel.queue_bind(exchange=EXCHANGE, queue="listing.expired.internal", routing_key=ROUTING_KEY)

            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue="listing.expired.internal", on_message_callback=_on_listing_expired)

            logger.info(
                "AMQP consumer ready - subscribed to [%s] on exchange '%s'",
                ROUTING_KEY, EXCHANGE,
            )
            channel.start_consuming()

        except Exception as e:
            logger.error("AMQP consumer error: %s - retrying in 5s", e)
            time.sleep(5)


def start_consumer():
    """Start the AMQP subscriber in a daemon thread (called on FastAPI startup)."""
    thread = threading.Thread(target=_connect_and_consume, daemon=True)
    thread.start()
