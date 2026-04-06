from shared.db import get_db
from shared.orm_models import Strike


def insert_strike(claimant_id: int) -> None:
    with get_db() as session:
        session.add(Strike(claimant_id=claimant_id, reason="Missed pickup"))


def count_strikes(claimant_id: int) -> int:
    with get_db() as session:
        return session.query(Strike).filter(Strike.claimant_id == claimant_id).count()
