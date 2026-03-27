from pydantic import BaseModel
from datetime import datetime

class Notification(BaseModel):
    id: str
    user_id: int
    message: str
    sent_at: datetime = datetime.now()

notifications: dict[str, Notification] = {}