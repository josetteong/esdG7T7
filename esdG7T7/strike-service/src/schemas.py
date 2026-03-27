from pydantic import BaseModel

class EligibilityResponse(BaseModel):
    eligible: bool
    reason: str | None = None

class ApplyStrikeRequest(BaseModel):
    claimant_id: int

class StrikeResponse(BaseModel):
    claimant_id: str
    count: int