from shared.db import get_db
from shared.orm_models import Claimant, Strike
from .schemas import EligibilityResponse, StrikeResponse


def get_eligibility(claimant_id: str) -> EligibilityResponse:
    with get_db() as session:
        claimant = session.get(Claimant, int(claimant_id))
        if not claimant:
            return EligibilityResponse(eligible=True, reason=None)
        eligible = claimant.eligibility_status == "ACTIVE"
        reason = None if eligible else f"Status: {claimant.eligibility_status} ({claimant.strike_count} strikes)"
        return EligibilityResponse(eligible=eligible, reason=reason)


def apply_strike(claimant_id: str):
    with get_db() as session:
        claimant = session.get(Claimant, int(claimant_id))
        if not claimant:
            return
        session.add(Strike(claimant_id=int(claimant_id), reason="Missed pickup"))
        claimant.strike_count += 1
        if claimant.strike_count >= 5:
            claimant.eligibility_status = "SUSPENDED"


def get_strikes(claimant_id: str) -> StrikeResponse:
    with get_db() as session:
        claimant = session.get(Claimant, int(claimant_id))
        count = claimant.strike_count if claimant else 0
        return StrikeResponse(claimant_id=claimant_id, count=count)

