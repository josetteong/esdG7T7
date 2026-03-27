from fastapi import FastAPI, HTTPException
from datetime import datetime
from services.strike_client import get_eligibility
from services.listing_client import reserve_listing, get_listings
from services.reserve_client import create_reservation
from services.notification_client import publish_notification

app = FastAPI()

@app.post("/composite/reserve")
def reserve(data: dict):
    claimant_id = data["claimant_id"]
    listing_id = data["id"]
    quantity = data["quantity"]
    pickup_time = datetime.fromisoformat(data["pickup_time"])

    # Check strike eligibility, raise if NOT eligible (ie. suspended)
    if not get_eligibility(claimant_id):
        raise HTTPException(status_code=403, detail="Customer suspended")

    # Atomic reserve with Listing Service
    listing = reserve_listing(listing_id, quantity, pickup_time)
    if not listing:
        raise HTTPException(status_code=400, detail="Reservation failed (invalid or expired)")

    # Create reservation record
    if not create_reservation({
    "claimant_id": claimant_id,
    "listing_id": listing_id,
    "reservation_qty": quantity,       
    "pickup_time": data["pickup_time"]}):
        raise HTTPException(status_code=500, detail="Reservation DB failed")

    # Re-retrieve updated listings 
    updated_listings = get_listings()

    # Publish notification via AMQP
    publish_notification(
        routing_key="reservation.created",
        payload={
            "recipientId": claimant_id,
            "message": "Reservation successful"
        }
    )
    return {"status": "success", "updated_listings": updated_listings}