from pydantic import BaseModel
from datetime import datetime
from shared.enums import ReservationStatus

class Reservation(BaseModel):
    id: str
    listing_id: int
    claimant_id: int
    reservation_qty: int
    pickup_time: datetime
    status: ReservationStatus = ReservationStatus.RESERVED
    created_at: datetime = datetime.now()

reservations: dict[str, Reservation] = {}