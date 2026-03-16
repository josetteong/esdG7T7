from .models import notifications, Notification
from .schemas import CreateNotificationRequest
import uuid
from datetime import datetime

def create_notification(request: CreateNotificationRequest) -> Notification:
    notification = Notification(
        id=str(uuid.uuid4()),
        recipient_id=request.recipient_id,
        message=request.message
    )
    notifications[notification.id] = notification
    return notification

def get_notification(notification_id: str) -> Notification | None:
    return notifications.get(notification_id)

def get_notifications() -> list[Notification]:
    return list(notifications.values())