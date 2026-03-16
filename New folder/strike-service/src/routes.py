from fastapi import APIRouter
from .schemas import EligibilityResponse, ApplyStrikeRequest, StrikeResponse
from .service import get_eligibility, apply_strike, get_strikes

router = APIRouter()

@router.get("/strikes/{claimant_id}/eligibility", response_model=EligibilityResponse)
def get_eligibility_endpoint(claimant_id: str):
    return get_eligibility(claimant_id)

@router.post("/strikes/apply")
def apply_strike_endpoint(request: ApplyStrikeRequest):
    apply_strike(request.claimant_id)
    return {"message": "Strike applied"}

@router.get("/strikes/{claimant_id}", response_model=StrikeResponse)
def get_strikes_endpoint(claimant_id: str):
    return get_strikes(claimant_id)