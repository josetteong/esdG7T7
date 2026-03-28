"""
AMQP consumer for the strike-service.

Subscribes to claimant.missed_collection events.
For each event:
  1. Applies a strike to the claimant.
  2. If the claimant is now suspended, publishes claimant.penalty_assigned
     so the notification-service can send a suspension notice.
"""

import json
import logging
import os
import threading
import time

import pika

from .service import apply_strike, get_eligibility

logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://admin:admin123@rabbitmq:5672")
EXCHANGE     = "food_rescue"
QUEUE        = "claimant.missed_collection.strike"
ROUTING_KEY  = "claimant.missed_collection"


def _on_missed_collection(channel, method, properties, body):
    data          = json.loads(body)
    claimant_id   = str(data["claimant_id"])
    reservation_id = data.get("reservation_id")
    listing_id    = data.get("listing_id")
    food_name     = data.get("food_name", "a listing")

    logger.info("Received missed_collection for claimant %s", claimant_id)

    apply_strike(claimant_id)

    eligibility = get_eligibility(claimant_id)
    if not eligibility.eligible:
        channel.basic_publish(
            exchange=EXCHANGE,
            routing_key="claimant.penalty_assigned",
            body=json.dumps({
                "recipient_id":      claimant_id,
                "recipient_type":    "CLAIMANT",
                "notification_type": "STRIKE_ISSUED",
                "message": (
                    f"Your account has been suspended due to repeated missed collections. "
                    f"Latest missed: '{food_name}' (Listing ID: {listing_id}, "
                    f"Reservation ID: {reservation_id})."
                ),
            }),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        logger.info("Claimant %s suspended — published penalty_assigned", claimant_id)

    channel.basic_ack(delivery_tag=method.delivery_tag)


def _connect_and_consume():
    while True:
        try:
            params     = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(params)
            channel    = connection.channel()

            channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
            channel.queue_declare(queue=QUEUE, durable=True)
            channel.queue_bind(exchange=EXCHANGE, queue=QUEUE, routing_key=ROUTING_KEY)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=QUEUE, on_message_callback=_on_missed_collection)

            logger.info("Strike consumer ready — subscribed to [%s]", ROUTING_KEY)
            channel.start_consuming()

        except Exception as e:
            logger.error("AMQP consumer error: %s — retrying in 5s", e)
            time.sleep(5)


def start_consumer():
    thread = threading.Thread(target=_connect_and_consume, daemon=True)
    thread.start()
