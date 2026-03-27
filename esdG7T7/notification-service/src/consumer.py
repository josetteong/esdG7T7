"""
AMQP subscriber for the notification-service.

Subscribes to notification routing keys on the food_rescue exchange.
For each message:
  1. Logs the notification to DB (via create_notification)
  2. create_notification calls OutSystems Notify API
  3. OutSystems fetches chatId from Supabase → Telegram API → customer
"""

import json
import logging
import os
import threading
import time

import pika

from .schemas import CreateNotificationRequest
from .service import create_notification

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://admin:admin123@rabbitmq:5672")
EXCHANGE = "food_rescue"

# All routing keys this service handles
ROUTING_KEYS = [
    "claimant.listing.expired",
    "vendor.listing.expired",
    "claimant.reservation.created",
    "claimant.reservation.cancelled",
    "vendor.reservation.cancelled",
    "claimant.penalty_assigned",
]


def _on_message(channel, method, properties, body):
    data = json.loads(body)
    routing_key = method.routing_key
    logger.info("Received [%s]: %s", routing_key, data)

    request = CreateNotificationRequest(
        user_id=str(data["recipient_id"]),
        recipient_type=data.get("recipient_type", "CLAIMANT"),
        notification_type=data.get("notification_type", routing_key.upper().replace(".", "_")),
        message=data["message"],
    )

    result = create_notification(request)
    logger.info(
        "Notification %s → status: %s | error: %s",
        result.get("id"), result.get("delivery_status"), result.get("error", "none")
    )

    channel.basic_ack(delivery_tag=method.delivery_tag)


def _connect_and_consume():
    while True:
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)

            # One durable queue per routing key
            for key in ROUTING_KEYS:
                channel.queue_declare(queue=key, durable=True)
                channel.queue_bind(exchange=EXCHANGE, queue=key, routing_key=key)

            channel.basic_qos(prefetch_count=1)

            for key in ROUTING_KEYS:
                channel.basic_consume(queue=key, on_message_callback=_on_message)

            logger.info("Notification consumer ready — subscribed to %s", ROUTING_KEYS)
            channel.start_consuming()

        except Exception as e:
            logger.error("AMQP consumer error [%s]: %r — retrying in 5s", type(e).__name__, e)
            time.sleep(5)


def start_consumer():
    thread = threading.Thread(target=_connect_and_consume, daemon=True)
    thread.start()
