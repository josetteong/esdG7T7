import requests

def create_reservation(data):
    res = requests.post(
        "http://reserve-service/reservations",
        json=data
    )
    if res.status_code != 200:
        raise Exception("Reservation DB failed")
    return res.json()  