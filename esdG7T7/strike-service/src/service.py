from .models import strikes
from .schemas import EligibilityResponse, StrikeResponse

def get_eligibility(claimant_id: str) -> EligibilityResponse:
    count = strikes.get(claimant_id, 0)
    eligible = count < 3
    reason = None if eligible else "Too many strikes"
    return EligibilityResponse(eligible=eligible, reason=reason)

def apply_strike(claimant_id: str):
    strikes[claimant_id] = strikes.get(claimant_id, 0) + 1

def get_strikes(claimant_id: str) -> StrikeResponse:
    count = strikes.get(claimant_id, 0)
    return StrikeResponse(claimant_id=claimant_id, count=count)