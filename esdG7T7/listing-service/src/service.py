from sqlalchemy import func
from shared.db import get_db
from shared.orm_models import Listing as ListingModel, Reservation as ReservationModel
from .schemas import CreateListingRequest, ReserveRequest, ReleaseRequest, MarkCollectedRequest
from datetime import datetime, timezone


def _reserved_qty(session, listing_id: int) -> int:
    return session.query(
        func.coalesce(func.sum(ReservationModel.reservation_qty), 0)
    ).filter(
        ReservationModel.listing_id == listing_id,
        ReservationModel.reservation_status == "RESERVED",
    ).scalar()


def _to_dict(listing: ListingModel, reserved_qty: int) -> dict:
    return {
        "id": str(listing.listing_id),
        "vendor_id": str(listing.vendor_id),
        "food_name": listing.food_name,
        "total_quantity": listing.total_quantity,
        "reserved_qty": reserved_qty,
        "remaining_qty": listing.total_quantity - reserved_qty,
        "expiry_time": listing.expiry_time,
        "status": listing.listing_status,
        "created_at": listing.created_at,
    }


def create_listing(request: CreateListingRequest) -> dict:
    with get_db() as session:
        listing = ListingModel(
            vendor_id=int(request.vendor_id),
            food_name=request.food_name,
            total_quantity=request.total_quantity,
            expiry_time=request.expiry_time,
            listing_status="AVAILABLE",
        )
        session.add(listing)
        session.flush()
        return _to_dict(listing, 0)


def get_listing(listing_id: str) -> dict | None:
    with get_db() as session:
        listing = session.get(ListingModel, int(listing_id))
        if not listing:
            return None
        return _to_dict(listing, _reserved_qty(session, int(listing_id)))


def get_listings() -> list[dict]:
    with get_db() as session:
        listings = session.query(ListingModel).order_by(ListingModel.created_at.desc()).all()
        return [_to_dict(l, _reserved_qty(session, l.listing_id)) for l in listings]


def reserve_listing(listing_id: str, request: ReserveRequest) -> dict | None:
    with get_db() as session:
        listing = session.get(ListingModel, int(listing_id))
        if not listing or listing.listing_status != "AVAILABLE":
            return None

        reserved = _reserved_qty(session, int(listing_id))
        remaining = listing.total_quantity - reserved
        if request.reservation_qty > remaining:
            return None

        expiry = listing.expiry_time
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expiry:
            listing.listing_status = "EXPIRED"
            return None

        new_remaining = remaining - request.reservation_qty
        listing.listing_status = "FULLY_RESERVED" if new_remaining == 0 else "AVAILABLE"
        return _to_dict(listing, reserved + request.reservation_qty)


def release_listing(listing_id: str, request: ReleaseRequest) -> dict | None:
    with get_db() as session:
        listing = session.get(ListingModel, int(listing_id))
        if not listing:
            return None
        if listing.listing_status == "FULLY_RESERVED":
            listing.listing_status = "AVAILABLE"
        return _to_dict(listing, _reserved_qty(session, int(listing_id)))


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
        return _to_dict(listing, _reserved_qty(session, int(listing_id)))
