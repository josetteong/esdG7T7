from pydantic import BaseModel
from datetime import datetime


class CreateNotificationRequest(BaseModel):
    recipient_id: str
    recipient_type: str = "CLAIMANT"       # VENDOR | CLAIMANT
    notification_type: str = "RESERVATION_CREATED"
    message: str


class NotificationResponse(BaseModel):
    id: str
    recipient_id: str
    recipient_type: str
    notification_type: str
    message: str
    delivery_status: str
    created_at: datetime | None = None
    sent_at: datetime | None = None
