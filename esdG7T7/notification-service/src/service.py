import os
import requests
from datetime import datetime, timezone

from shared.db import get_db
from shared.orm_models import Notification as NotificationModel
from .schemas import CreateNotificationRequest


OUTSYSTEMS_NOTIFY_URL = os.getenv(
    "OUTSYSTEMS_NOTIFY_URL",
    "https://personal-42atob5v.outsystemscloud.com/Notification/rest/Notification/Notify",
)


def _to_dict(n: NotificationModel) -> dict:
    return {
        "id": str(n.notification_id),
        "user_id": str(n.user_id),
        "recipient_type": n.recipient_type,
        "notification_type": n.notification_type,
        "message": n.message,
        "delivery_status": n.delivery_status,
        "created_at": n.created_at,
        "sent_at": n.sent_at,
    }


def create_notification(request: CreateNotificationRequest) -> dict:
    with get_db() as session:
        notification = NotificationModel(
            user_id=int(request.user_id),
            recipient_type=request.recipient_type,
            notification_type=request.notification_type,
            message=request.message,
            delivery_status="PENDING",
        )
        session.add(notification)
        session.flush()

        try:
            response = requests.post(
                OUTSYSTEMS_NOTIFY_URL,
                json={
                    "user_id": str(request.user_id),
                    "recipient_type": request.recipient_type,
                    "Type": request.notification_type,
                    "Message": request.message,
                },
                headers={"Content-Type": "application/json"},
                timeout=15,
            )
            response.raise_for_status()

            notification.delivery_status = "SENT"
            notification.sent_at = datetime.now(timezone.utc)

        except requests.RequestException as e:
            notification.delivery_status = "FAILED"
            session.flush()
            return {
                **_to_dict(notification),
                "error": f"Failed to send notification via OutSystems: {str(e)}",
            }

        session.flush()
        return _to_dict(notification)


def get_notification(notification_id: str) -> dict | None:
    with get_db() as session:
        notification = session.get(NotificationModel, int(notification_id))
        return _to_dict(notification) if notification else None


def get_notifications() -> list[dict]:
    with get_db() as session:
        rows = session.query(NotificationModel).all()
        return [_to_dict(notification) for notification in rows]