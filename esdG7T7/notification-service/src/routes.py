from fastapi import APIRouter, HTTPException
from .schemas import NotificationResponse
from .service import get_notification, get_notifications

router = APIRouter()

@router.get("/notifications/{notification_id}", response_model=NotificationResponse)
def get_notification_endpoint(notification_id: str):
    notification = get_notification(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.get("/notifications", response_model=list[NotificationResponse])
def get_notifications_endpoint():
    return get_notifications()