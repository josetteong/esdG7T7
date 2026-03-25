from shared.db import get_db
from shared.orm_models import Reservation as ReservationModel
from .schemas import CreateReservationRequest
from datetime import datetime, timezone

def _to_dict(r: ReservationModel) -> dict:
    return {
        "id": str(r.reservation_id),
        "listing_id": str(r.listing_id),
        "claimant_id": str(r.claimant_id),
        "reservation_qty": r.reservation_qty,
        "pickup_time": r.pickup_time,
        "status": r.reservation_status,
        "created_at": r.reserved_at,
    }


def create_reservation(request: CreateReservationRequest) -> dict:
    with get_db() as session:
        r = ReservationModel(
            listing_id=int(request.listing_id),
            claimant_id=int(request.claimant_id),
            reservation_qty=request.reservation_qty,
            pickup_time=request.pickup_time,
            reservation_status="RESERVED",
        )
        session.add(r)
        session.flush()
        return _to_dict(r)


def get_reservation(reservation_id: str) -> dict | None:
    with get_db() as session:
        r = session.get(ReservationModel, int(reservation_id))
        return _to_dict(r) if r else None


def get_reservations() -> list[dict]:
    with get_db() as session:
        rows = session.query(ReservationModel).all()
        return [_to_dict(r) for r in rows]


def complete_reservation(reservation_id: str, claimant_id: str) -> dict | None:
    with get_db() as session:
        r = session.get(ReservationModel, int(reservation_id))
        if not r or r.reservation_status != "RESERVED" or str(r.claimant_id) != claimant_id:
            return None
        r.reservation_status = "COMPLETED"
        r.completed_at = datetime.now(timezone.utc)
        return _to_dict(r)


def cancel_reservation(reservation_id: str, claimant_id: str) -> dict | None:
    with get_db() as session:
        r = session.get(ReservationModel, int(reservation_id))
        if not r or r.reservation_status != "RESERVED" or str(r.claimant_id) != claimant_id:
            return None
        r.reservation_status = "CANCELLED"
        r.cancelled_at = datetime.now(timezone.utc)
        r.cancellation_type = "NON_GRACE"
        return _to_dict(r)


def missed_pickup(reservation_id: str) -> dict | None:
    with get_db() as session:
        r = session.get(ReservationModel, int(reservation_id))
        if not r:
            return None
        r.reservation_status = "MISSED_PICKUP"
        return _to_dict(r)


def expire_reservations_for_listing(listing_id: str) -> list[dict]:
    """Called by the AMQP consumer when a listing.expired.internal event arrives.
    Marks all RESERVED reservations as EXPIRED and returns them (consumer will notify claimants)."""
    with get_db() as session:
        rows = session.query(ReservationModel).filter(
            ReservationModel.listing_id == int(listing_id),
            ReservationModel.reservation_status == "RESERVED",
        ).all()
        for r in rows:
            r.reservation_status = "EXPIRED"
            r.cancelled_at = datetime.now(timezone.utc)
            r.cancellation_type = "EXPIRED"
        return [_to_dict(r) for r in rows]
