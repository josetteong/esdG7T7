from pydantic import BaseModel
from datetime import datetime
from shared.enums import ListingStatus

class Listing(BaseModel):
    id: int
    vendor_id: int
    food_name: str
    total_quantity: int
    reserved_qty: int = 0
    remaining_qty: int
    expiry_time: datetime
    status: ListingStatus = ListingStatus.AVAILABLE
    created_at: datetime = datetime.now()

listings: dict[str, Listing] = {}