from pydantic import BaseModel


class ApplyStrikeRequest(BaseModel):
    claimant_id: int


class StrikeCountResponse(BaseModel):
    claimant_id: str
    count: int
