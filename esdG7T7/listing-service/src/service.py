from .models import listings, Listing
from .schemas import CreateListingRequest, ReserveRequest, ReleaseRequest, MarkCollectedRequest
from shared.enums import ListingStatus
from datetime import datetime
import uuid

def create_listing(request: CreateListingRequest) -> Listing:
    listing = Listing(
        id=str(uuid.uuid4()),
        vendor_id=request.vendor_id,
        food_name=request.food_name,
        total_quantity=request.total_quantity,
        remaining_qty=request.total_quantity,
        expiry_time=request.expiry_time
    )
    listings[listing.id] = listing
    return listing

def get_listing(listing_id: str) -> Listing | None:
    return listings.get(listing_id)

def get_listings() -> list[Listing]:
    return list(listings.values())

def reserve_listing(listing_id: str, request: ReserveRequest) -> Listing | None:
    listing = get_listing(listing_id)
    if not listing:
        return None
    if listing.status != ListingStatus.AVAILABLE:
        return None
    if request.reservation_qty > listing.remaining_qty:
        return None
    if datetime.now() > listing.expiry_time:
        listing.status = ListingStatus.EXPIRED
        return None
    if request.pickup_time > listing.expiry_time:
        return None
    # Mock strike check, assume eligible
    listing.reserved_qty += request.reservation_qty
    listing.remaining_qty -= request.reservation_qty
    if listing.remaining_qty == 0:
        listing.status = ListingStatus.FULLY_RESERVED
    return listing

def release_listing(listing_id: str, request: ReleaseRequest) -> Listing | None:
    listing = get_listing(listing_id)
    if not listing:
        return None
    listing.reserved_qty -= request.qty
    listing.remaining_qty += request.qty
    if listing.remaining_qty > 0 and listing.status == ListingStatus.FULLY_RESERVED:
        listing.status = ListingStatus.AVAILABLE
    return listing

def mark_collected(listing_id: str, request: MarkCollectedRequest) -> Listing | None:
    listing = get_listing(listing_id)
    if not listing:
        return None
    listing.status = ListingStatus.COLLECTED
    return listing

def expire_listing(listing_id: str) -> Listing | None:
    listing = get_listing(listing_id)
    if not listing:
        return None
    listing.status = ListingStatus.EXPIRED
    return listing

def cancel_listing(listing_id: str) -> Listing | None:
    listing = get_listing(listing_id)
    if not listing:
        return None
    listing.status = ListingStatus.CANCELLED
    return listing