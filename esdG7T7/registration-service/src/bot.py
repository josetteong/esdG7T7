import logging
import os
import threading
import time

import requests

from .service import verify_token

logger = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"


def _send(chat_id: int, text: str):
    try:
        requests.post(f"{TELEGRAM_API}/sendMessage", json={"chat_id": chat_id, "text": text}, timeout=10)
    except Exception as e:
        logger.error("Failed to send Telegram message: %s", e)


def _get_initial_offset() -> int:
    try:
        resp = requests.get(f"{TELEGRAM_API}/getUpdates", params={"offset": -1, "timeout": 0}, timeout=10)
        results = resp.json().get("result", [])
        if results:
            return results[-1]["update_id"] + 1
    except Exception:
        pass
    return 0


def _poll():
    offset = _get_initial_offset()
    while True:
        try:
            resp = requests.get(
                f"{TELEGRAM_API}/getUpdates",
                params={"offset": offset, "timeout": 30},
                timeout=35,
            )
            updates = resp.json().get("result", [])
            for update in updates:
                offset = update["update_id"] + 1
                message = update.get("message", {})
                text = message.get("text", "")
                chat_id = message.get("chat", {}).get("id")

                if text.startswith("/start ") and chat_id:
                    token = text.split(" ", 1)[1].strip()
                    success = verify_token(token, chat_id)
                    if success:
                        _send(chat_id, "You're registered! You will now receive Food Rescue notifications.")
                        logger.info("Registered chatId %s via token %s", chat_id, token)
                    else:
                        _send(chat_id, "Invalid or expired link. Please generate a new one.")
        except Exception as e:
            logger.error("Telegram polling error: %s — retrying in 5s", e)
            time.sleep(5)


def start_bot():
    thread = threading.Thread(target=_poll, daemon=True)
    thread.start()
    logger.info("Telegram bot polling started")
