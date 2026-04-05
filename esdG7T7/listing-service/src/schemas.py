from pydantic import BaseModel
from datetime import datetime
from shared.enums import ListingStatus

class CreateListingRequest(BaseModel):
    vendor_id: int
    food_name: str
    total_quantity: int
    expiry_time: datetime
    collect_window_mins: int = 60

class ListingResponse(BaseModel):
    id: str
    vendor_id: str
    food_name: str
    total_quantity: int
    remaining_qty: int
    expiry_time: datetime
    collect_window_mins: int
    status: ListingStatus
    created_at: datetime

class ReserveRequest(BaseModel):
    reservation_qty: int
    claimant_id: int
    pickup_time: datetime

class ReleaseRequest(BaseModel):
    qty: int

class MarkCollectedRequest(BaseModel):
    claimant_id: int