import os
import logging
from datetime import datetime, timezone

import requests
from flask import Flask, jsonify
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

LISTING_SERVICE_URL = os.getenv("LISTING_SERVICE_URL", "http://listing-service:8000")
CRON_INTERVAL_MINUTES = int(os.getenv("CRON_INTERVAL_MINUTES", "1"))

EXPIRABLE_STATUSES = {"AVAILABLE", "FULLY_RESERVED"}


def check_and_expire_listings():
    logger.info("Running expiry check...")
    try:
        response = requests.get(f"{LISTING_SERVICE_URL}/listings", timeout=10)
        response.raise_for_status()
        listings = response.json()
    except requests.RequestException as e:
        logger.error("Failed to fetch listings: %s", e)
        return {"error": str(e), "expired": []}

    now = datetime.now(timezone.utc)
    expired_ids = []
    failed_ids = []

    for listing in listings:
        if listing.get("status") not in EXPIRABLE_STATUSES:
            continue

        expiry_time_str = listing.get("expiry_time")
        if not expiry_time_str:
            continue

        expiry_time = datetime.fromisoformat(expiry_time_str)
        if expiry_time.tzinfo is None:
            expiry_time = expiry_time.replace(tzinfo=timezone.utc)

        if now > expiry_time:
            listing_id = listing["id"]
            try:
                patch_resp = requests.patch(
                    f"{LISTING_SERVICE_URL}/listings/{listing_id}/expire", timeout=10
                )
                patch_resp.raise_for_status()
                logger.info("Expired listing %s (%s)", listing_id, listing.get("food_name"))
                expired_ids.append(listing_id)
            except requests.RequestException as e:
                logger.error("Failed to expire listing %s: %s", listing_id, e)
                failed_ids.append(listing_id)

    logger.info("Expiry check done. Expired: %d, Failed: %d", len(expired_ids), len(failed_ids))
    return {"expired": expired_ids, "failed": failed_ids}


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/trigger", methods=["POST"])
def trigger():
    """Manually trigger the expiry check (also called by cron)."""
    result = check_and_expire_listings()
    return jsonify(result)


if __name__ == "__main__":
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        check_and_expire_listings,
        "interval",
        minutes=CRON_INTERVAL_MINUTES,
        next_run_time=datetime.now(),  # run immediately on startup too
    )
    scheduler.start()
    logger.info("Scheduler started — running every %d minute(s)", CRON_INTERVAL_MINUTES)

    try:
        app.run(host="0.0.0.0", port=5000)
    finally:
        scheduler.shutdown()
