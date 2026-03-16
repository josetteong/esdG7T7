from .models import reservations, Reservation
from .schemas import CreateReservationRequest
from shared.enums import ReservationStatus
import uuid
from datetime import datetime

def create_reservation(request: CreateReservationRequest) -> Reservation:
    # Mock checks
    reservation = Reservation(
        id=str(uuid.uuid4()),
        listing_id=request.listing_id,
        claimant_id=request.claimant_id,
        reservation_qty=request.reservation_qty,
        pickup_time=request.pickup_time
    )
    reservations[reservation.id] = reservation
    return reservation

def get_reservation(reservation_id: str) -> Reservation | None:
    return reservations.get(reservation_id)

def get_reservations() -> list[Reservation]:
    return list(reservations.values())

def complete_reservation(reservation_id: str, claimant_id: str) -> Reservation | None:
    reservation = get_reservation(reservation_id)
    if not reservation or reservation.status != ReservationStatus.RESERVED or reservation.claimant_id != claimant_id:
        return None
    reservation.status = ReservationStatus.COMPLETED
    return reservation

def cancel_reservation(reservation_id: str, claimant_id: str) -> Reservation | None:
    reservation = get_reservation(reservation_id)
    if not reservation or reservation.status != ReservationStatus.RESERVED or reservation.claimant_id != claimant_id:
        return None
    reservation.status = ReservationStatus.CANCELLED
    return reservation

def missed_pickup(reservation_id: str) -> Reservation | None:
    reservation = get_reservation(reservation_id)
    if not reservation:
        return None
    reservation.status = ReservationStatus.MISSED_PICKUP
    return reservation