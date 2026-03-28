from fastapi import FastAPI, HTTPException
from datetime import datetime
from services.strike_client import get_eligibility
from services.listing_client import reserve_listing, get_listings
from services.reserve_client import create_reservation
from services.notification_client import publish_notification

app = FastAPI(title="Reserve Composite Service")

@app.post("/reserve")
def reserve(data: dict):
    claimant_id = data["claimant_id"]
    listing_id = data["listing_id"]
    quantity = data["reservation_qty"]
    pickup_time = datetime.fromisoformat(data["pickup_time"])

    # Check strike eligibility, raise if NOT eligible (ie. suspended)
    if not get_eligibility(claimant_id):
        raise HTTPException(status_code=403, detail="Customer suspended")

    # Atomic reserve with Listing Service
    listing = reserve_listing(listing_id, quantity, pickup_time, claimant_id)
    if not listing:
        raise HTTPException(status_code=400, detail="Reservation failed (invalid or expired)")

    # Create reservation record
    reservation = create_reservation({
    "claimant_id": claimant_id,
    "listing_id": listing_id,
    "reservation_qty": quantity,
    "pickup_time": data["pickup_time"]})
    if not reservation:
        raise HTTPException(status_code=500, detail="Reservation DB failed")

    # Re-retrieve updated listings
    updated_listings = get_listings()

    # Publish notification via AMQP
    publish_notification(
        user_id=claimant_id,
        recipient_type="CLAIMANT",
        notif_type="claimant.reservation.created",
        message=f"Your reservation (ID: {reservation['id']}) for '{listing['food_name']}' has been confirmed!"
    )
    return {"status": "success", "updated_listings": updated_listings}