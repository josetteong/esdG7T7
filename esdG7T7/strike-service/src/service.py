import os
import requests

CLAIMANT_SERVICE_URL = os.getenv("CLAIMANT_SERVICE_URL", "http://claimant-service:5000")
STRIKING_SVC_URL     = os.getenv("STRIKING_SVC_URL",     "http://striking-svc:8000")
SUSPENSION_THRESHOLD = 5

##################################################################################
"""
Calls the Striking SVC to apply a strike
"""
##################################################################################
def apply_strike(claimant_id: str) -> None:

    # Calls Striking SVC to apply a strike 
    requests.post(
        f"{STRIKING_SVC_URL}/striking/apply",
        json={"claimant_id": int(claimant_id)},
        timeout=10,
    ).raise_for_status()

    # Calls Claiamnt service to update their strike count
    requests.patch(
        f"{CLAIMANT_SERVICE_URL}/claimants/{claimant_id}/apply-strike",
        timeout=10,
    ).raise_for_status()

# Get the number of strikes by calling Claimant svc
def get_strikes(claimant_id: str) -> dict:
    resp = requests.get(f"{STRIKING_SVC_URL}/striking/{claimant_id}/count", timeout=10)
    resp.raise_for_status()
    return resp.json()

# Gets eligibility, > 5 means account suspended 
def get_eligibility(claimant_id: str) -> dict:
    resp = requests.get(f"{STRIKING_SVC_URL}/striking/{claimant_id}/count", timeout=10)
    resp.raise_for_status()
    count = resp.json().get("count", 0)
    eligible = count < SUSPENSION_THRESHOLD
    reason = None if eligible else f"{count} strikes — account suspended"
    return {"eligible": eligible, "reason": reason}
