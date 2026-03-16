from pydantic import BaseModel
from datetime import datetime
from shared.enums import ReservationStatus

class CreateReservationRequest(BaseModel):
    listing_id: str
    claimant_id: str
    reservation_qty: int
    pickup_time: datetime

class ReservationResponse(BaseModel):
    id: str
    listing_id: str
    claimant_id: str
    reservation_qty: int
    pickup_time: datetime
    status: ReservationStatus
    created_at: datetime