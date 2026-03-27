import requests

def publish_notification(routing_key: str, payload: dict):
    requests.post(
        "http://bridge:3000/publish",
        json={
            "routingKey": routing_key,
            "payload": payload
        }
    )