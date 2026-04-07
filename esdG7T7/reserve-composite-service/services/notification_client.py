import json
import os

import pika

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://admin:admin123@rabbitmq:5672")
EXCHANGE = "food_rescue"


def publish_notification(user_id: str, recipient_type: str, notif_type: str, message: str):
    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
    channel.basic_publish(
        exchange=EXCHANGE,
        routing_key=notif_type,
        body=json.dumps({
            "recipient_id": str(user_id),
            "recipient_type": recipient_type,
            "notification_type": notif_type,
            "message": message,
        }),
        properties=pika.BasicProperties(delivery_mode=2),
    )
    connection.close()
