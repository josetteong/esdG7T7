from werkzeug.security import generate_password_hash
from shared.db import get_db
from shared.orm_models import Vendor


def _to_dict(vendor: Vendor) -> dict:
    return {
        "vendor_id": vendor.vendor_id,
        "vendor_name": vendor.vendor_name,
        "contact_email": vendor.contact_email,
        "vendor_status": vendor.vendor_status,
        "created_at": vendor.created_at.isoformat() if vendor.created_at else None,
    }


def create_vendor(vendor_name: str, contact_email: str, password: str) -> dict:
    with get_db() as session:
        vendor = Vendor(
            vendor_name=vendor_name,
            contact_email=contact_email,
            password_hash=generate_password_hash(password),
            vendor_status="ACTIVE",
        )
        session.add(vendor)
        session.flush()
        return _to_dict(vendor)


def get_vendor(vendor_id: int) -> dict | None:
    with get_db() as session:
        vendor = session.get(Vendor, vendor_id)
        return _to_dict(vendor) if vendor else None
