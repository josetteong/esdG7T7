from fastapi import APIRouter, HTTPException
from .schemas import CreateNotificationRequest, NotificationResponse
from .service import create_notification, get_notification, get_notifications

router = APIRouter()

@router.post("/notifications", response_model=NotificationResponse, status_code=201)
def create_notification_endpoint(request: CreateNotificationRequest):
    return create_notification(request)

@router.get("/notifications/{notification_id}", response_model=NotificationResponse)
def get_notification_endpoint(notification_id: str):
    notification = get_notification(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.get("/notifications", response_model=list[NotificationResponse])
def get_notifications_endpoint():
    return get_notifications()