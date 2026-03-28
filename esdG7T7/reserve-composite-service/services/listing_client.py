import requests

BASE_URL = "http://listing-service:8000"

def get_listing(listing_id):
    res = requests.get(f"{BASE_URL}/listings/{listing_id}")
    return res.json()

def get_listings():
    res = requests.get(f"{BASE_URL}/listings")
    return res.json()

def reserve_listing(listing_id, reservation_qty, pickup_time, claimant_id):
    res = requests.patch(
        f"{BASE_URL}/listings/{listing_id}/reserve",
        json={"reservation_qty": reservation_qty, "pickup_time": pickup_time.isoformat(), "claimant_id": claimant_id}
    )
    if res.status_code != 200:
        raise Exception("Reserve failed")
    return res.json()