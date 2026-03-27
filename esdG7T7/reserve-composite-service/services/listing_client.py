import requests

BASE_URL = "http://listing-service"

def get_listing(listing_id):
    res = requests.get(f"{BASE_URL}/listings/{listing_id}")
    return res.json()

def get_listings():
    res = requests.get(f"{BASE_URL}/listings")
    return res.json()

def reserve_listing(listing_id, reservation_qty, pickup_time):
    res = requests.post(
        f"{BASE_URL}/listings/{listing_id}/reserve",
        json={"reservation_qty": reservation_qty, "pickup_time": pickup_time.isoformat()}
    )
    if res.status_code != 200:
        raise Exception("Reserve failed")
    return res.json()