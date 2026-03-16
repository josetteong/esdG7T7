from pydantic import BaseModel
from datetime import datetime

class Notification(BaseModel):
    id: str
    recipient_id: str
    message: str
    sent_at: datetime = datetime.now()

notifications: dict[str, Notification] = {}