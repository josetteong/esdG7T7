from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func
from shared.db import get_db
from shared.orm_models import Claimant


def _to_dict(claimant: Claimant) -> dict:
    return {
        "claimant_id": claimant.claimant_id,
        "claimant_name": claimant.claimant_name,
        "email": claimant.email,
        "eligibility_status": claimant.eligibility_status,
        "strike_count": claimant.strike_count,
        "created_at": claimant.created_at.isoformat() if claimant.created_at else None,
    }


def create_claimant(claimant_name: str, email: str, password: str) -> dict:
    with get_db() as session:
        claimant = Claimant(
            claimant_name=claimant_name,
            email=email,
            password_hash=generate_password_hash(password),
            eligibility_status="ACTIVE",
        )
        session.add(claimant)
        session.flush()
        return _to_dict(claimant)


def get_claimant(claimant_id: int) -> dict | None:
    with get_db() as session:
        claimant = session.get(Claimant, claimant_id)
        return _to_dict(claimant) if claimant else None


def login_claimant(email: str, password: str) -> dict | None:
    with get_db() as session:
        claimant = session.query(Claimant).filter(
            func.lower(Claimant.email) == email.lower().strip()
        ).first()
        if not claimant or not claimant.password_hash:
            return None
        if not check_password_hash(claimant.password_hash, password):
            return None
        return _to_dict(claimant)
