from fastapi import APIRouter, HTTPException
from .schemas import CreateReservationRequest, ReservationResponse
from .service import create_reservation, get_reservation, get_reservations, complete_reservation, cancel_reservation, missed_pickup, cancel_reservations_by_listing

router = APIRouter()

@router.post("/reservations", response_model=ReservationResponse)
def create_reservation_endpoint(request: CreateReservationRequest):
    reservation = create_reservation(request)
    return reservation

@router.get("/reservations/{reservation_id}", response_model=ReservationResponse)
def get_reservation_endpoint(reservation_id: str):
    reservation = get_reservation(reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation

@router.get("/reservations", response_model=list[ReservationResponse])
def get_reservations_endpoint():
    return get_reservations()

@router.patch("/reservations/{reservation_id}/complete", response_model=ReservationResponse)
def complete_reservation_endpoint(reservation_id: str, claimant_id: str):
    reservation = complete_reservation(reservation_id, claimant_id)
    if not reservation:
        raise HTTPException(status_code=400, detail="Cannot complete")
    return reservation

@router.patch("/reservations/{reservation_id}/cancel", response_model=ReservationResponse)
def cancel_reservation_endpoint(reservation_id: str, claimant_id: str):
    reservation = cancel_reservation(reservation_id, claimant_id)
    if not reservation:
        raise HTTPException(status_code=400, detail="Cannot cancel")
    return reservation

@router.patch("/reservations/{reservation_id}/missed-pickup", response_model=ReservationResponse)
def missed_pickup_endpoint(reservation_id: str):
    reservation = missed_pickup(reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation

@router.patch("/reservations/cancel-by-listing/{listing_id}")
def cancel_by_listing_endpoint(listing_id: str):
    cancelled = cancel_reservations_by_listing(listing_id)
    return {"cancelled": cancelled}