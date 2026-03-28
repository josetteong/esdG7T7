import requests

def get_eligibility(claimant_id):
    res = requests.get(f"http://strike-service:8000/strikes/{claimant_id}/eligibility")
    if res.status_code != 200:
        raise Exception("Strike service error")

    return res.json().get("eligible", False)

