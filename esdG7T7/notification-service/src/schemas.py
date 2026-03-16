from pydantic import BaseModel
from datetime import datetime

class CreateNotificationRequest(BaseModel):
    recipient_id: str
    message: str

class NotificationResponse(BaseModel):
    id: str
    recipient_id: str
    message: str
    sent_at: datetime