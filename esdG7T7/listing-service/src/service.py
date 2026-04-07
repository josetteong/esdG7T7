from shared.db import get_db
from shared.orm_models import Listing as ListingModel
from .schemas import CreateListingRequest, ReserveRequest, ReleaseRequest, MarkCollectedRequest
from datetime import datetime, timezone


def _to_dict(listing: ListingModel) -> dict:
    return {
        "id": str(listing.listing_id),
        "vendor_id": str(listing.vendor_id),
        "food_name": listing.food_name,
        "total_quantity": listing.total_quantity,
        "remaining_qty": listing.remaining_qty,
        "expiry_time": listing.expiry_time,
        "collect_window_mins": listing.collect_window_mins,
        "status": listing.listing_status,
        "created_at": listing.created_at,
    }

##################################################################################
"""
Create and Add New Listing"
"""
##################################################################################
def create_listing(request: CreateListingRequest) -> dict:
    with get_db() as session:
        listing = ListingModel(
            vendor_id=int(request.vendor_id),
            food_name=request.food_name,
            total_quantity=request.total_quantity,
            remaining_qty=request.total_quantity,
            expiry_time=request.expiry_time,
            collect_window_mins=request.collect_window_mins,
            listing_status="AVAILABLE",
        )
        session.add(listing)
        session.flush()
        return _to_dict(listing)

##################################################################################
"""
Gets Listing based on listing_id
"""
##################################################################################
def get_listing(listing_id: str) -> dict | None:
    with get_db() as session:
        listing = session.get(ListingModel, int(listing_id))
        if not listing:
            return None
        return _to_dict(listing)
##################################################################################
"""
Gets all Listingd
"""
##################################################################################
def get_listings() -> list[dict]:
    with get_db() as session:
        listings = session.query(ListingModel).order_by(ListingModel.created_at.desc()).all()
        return [_to_dict(l) for l in listings]
##################################################################################
"""
Reserving the Listing and Listing Statuses
"""
##################################################################################
def reserve_listing(listing_id: str, request: ReserveRequest) -> dict | None:
    with get_db() as session:

        listing = session.get(ListingModel, int(listing_id))
        #Guard Rails checking if the listing can be made
        if not listing or listing.listing_status != "AVAILABLE":
            return None

        if request.reservation_qty > listing.remaining_qty:
            return None

        expiry = listing.expiry_time
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        # If expiry time has passed, set status to expires 
        if datetime.now(timezone.utc) > expiry:
            listing.listing_status = "EXPIRED"
            return None

        # Get new qty after reservation and update the DB but if the remaining qty is 0, then set as FULLY_RESERVED 
        new_remaining = listing.remaining_qty - request.reservation_qty
        listing.remaining_qty = new_remaining
        listing.listing_status = "FULLY_RESERVED" if new_remaining == 0 else "AVAILABLE"
        return _to_dict(listing)

##################################################################################
"""
For Relasing QTY back for Rollbacks 
"""
##################################################################################

def release_listing(listing_id: str, request: ReleaseRequest) -> dict | None:
    with get_db() as session:
        listing = session.get(ListingModel, int(listing_id))
        if not listing:
            return None
        # Add back the QTY, but incase the added amount is more than total, then use the minimum one
        listing.remaining_qty = min(listing.remaining_qty + request.qty, listing.total_quantity)
        # revert the status back from fully_reserved to available 
        if listing.listing_status == "FULLY_RESERVED":
            listing.listing_status = "AVAILABLE"
        return _to_dict(listing)

##################################################################################
"""
For  Updating of different listing statuses 
"""
##################################################################################
def mark_collected(listing_id: str, request: MarkCollectedRequest) -> dict | None:
    return _update_status(listing_id, "COLLECTED")


def expire_listing(listing_id: str) -> dict | None:
    return _update_status(listing_id, "EXPIRED")


def cancel_listing(listing_id: str) -> dict | None:
    return _update_status(listing_id, "CANCELLED")


def _update_status(listing_id: str, status: str) -> dict | None:
    with get_db() as session:
        listing = session.get(ListingModel, int(listing_id))
        if not listing:
            return None
        listing.listing_status = status
        return _to_dict(listing)
