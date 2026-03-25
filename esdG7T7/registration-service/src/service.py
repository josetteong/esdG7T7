import os
import random
import string
from datetime import datetime, timezone

from shared.db import get_db
from shared.orm_models import TelegramRegistration

BOT_USERNAME = os.getenv("TELEGRAM_BOT_USERNAME", "SFRB_Notif_BOt")


def _make_token(length=8):
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))


def _to_dict(r: TelegramRegistration) -> dict:
    return {
        "user_id": r.user_id,
        "chat_id": r.chat_id,
        "is_registered": r.is_registered,
        "telegram_link": f"https://t.me/{BOT_USERNAME}?start={r.token}" if r.token else None,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "registered_at": r.registered_at.isoformat() if r.registered_at else None,
    }


def create_registration(user_id: str) -> dict:
    """Create or refresh a registration entry and return a Telegram link."""
    with get_db() as session:
        reg = session.get(TelegramRegistration, user_id)
        if reg and reg.is_registered:
            return _to_dict(reg)   # already registered, return existing

        token = _make_token()
        if reg:
            reg.token = token      # refresh token if not yet registered
        else:
            reg = TelegramRegistration(user_id=user_id, token=token, is_registered=False)
            session.add(reg)
        session.flush()
        return _to_dict(reg)


def verify_token(token: str, chat_id: int) -> bool:
    """Called by the Telegram bot when user sends /start TOKEN. Stores chatId."""
    with get_db() as session:
        reg = session.query(TelegramRegistration).filter(
            TelegramRegistration.token == token,
            TelegramRegistration.is_registered == False,
        ).first()
        if not reg:
            return False
        reg.chat_id = chat_id
        reg.is_registered = True
        reg.registered_at = datetime.now(timezone.utc)
        return True


def get_registration(user_id: str) -> dict | None:
    """Fetch registration info — used by OutSystems to get chatId before notifying."""
    with get_db() as session:
        reg = session.get(TelegramRegistration, user_id)
        return _to_dict(reg) if reg else None
