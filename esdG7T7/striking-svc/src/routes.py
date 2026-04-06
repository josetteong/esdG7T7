from fastapi import APIRouter
from .schemas import ApplyStrikeRequest, StrikeCountResponse
from .service import insert_strike, count_strikes

router = APIRouter()


@router.post("/striking/apply")
def apply_strike_endpoint(request: ApplyStrikeRequest):
    insert_strike(request.claimant_id)
    return {"message": "Strike recorded"}


@router.get("/striking/{claimant_id}/count", response_model=StrikeCountResponse)
def count_strikes_endpoint(claimant_id: str):
    count = count_strikes(int(claimant_id))
    return StrikeCountResponse(claimant_id=claimant_id, count=count)
