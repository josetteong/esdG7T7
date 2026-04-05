import logging
import os
import yaml
import requests
from flask import Flask, jsonify, request
from flasgger import Swagger
from .service import create_registration, get_registration
from .bot import start_bot

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = Flask(__name__)
Swagger(app, template=yaml.safe_load(open("/app/src/swagger.yaml")))

CLAIMANT_SERVICE_URL = os.getenv("CLAIMANT_SERVICE_URL", "http://claimant-service:5000")
VENDOR_SERVICE_URL = os.getenv("VENDOR_SERVICE_URL", "http://vendor-service:5000")


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/registrations/claimant", methods=["POST"])
def register_claimant():
    """Create a claimant account then return a Telegram onboarding link."""
    body = request.get_json()
    if not body:
        return jsonify({"error": "request body required"}), 400

    claimant_name = body.get("claimant_name")
    email = body.get("email")
    password = body.get("password")

    if not claimant_name or not password:
        return jsonify({"error": "claimant_name and password are required"}), 400

    resp = requests.post(
        f"{CLAIMANT_SERVICE_URL}/claimants",
        json={"claimant_name": claimant_name, "email": email, "password": password},
        timeout=10,
    )
    if not resp.ok:
        return jsonify({"error": "failed to create claimant", "detail": resp.json()}), resp.status_code

    claimant_id = str(resp.json()["claimant_id"])
    result = create_registration(claimant_id, recipient_type="CLAIMANT")
    return jsonify({**resp.json(), "telegram": result}), 201


@app.route("/registrations/vendor", methods=["POST"])
def register_vendor():
    """Create a vendor account then return a Telegram onboarding link."""
    body = request.get_json()
    if not body:
        return jsonify({"error": "request body required"}), 400

    vendor_name = body.get("vendor_name")
    contact_email = body.get("contact_email")
    password = body.get("password")

    if not vendor_name or not password:
        return jsonify({"error": "vendor_name and password are required"}), 400

    resp = requests.post(
        f"{VENDOR_SERVICE_URL}/vendors",
        json={"vendor_name": vendor_name, "contact_email": contact_email, "password": password},
        timeout=10,
    )
    if not resp.ok:
        return jsonify({"error": "failed to create vendor", "detail": resp.json()}), resp.status_code

    vendor_id = str(resp.json()["vendor_id"])
    result = create_registration(vendor_id, recipient_type="VENDOR")
    return jsonify({**resp.json(), "telegram": result}), 201


@app.route("/registrations/<user_id>/<recipient_type>", methods=["GET"])
def get_reg(user_id, recipient_type):
    """Get registration info including chatId — called by OutSystems before notifying."""
    result = get_registration(user_id, recipient_type.upper())
    if not result:
        return jsonify({"error": "not found"}), 404
    return jsonify(result), 200


if __name__ == "__main__":
    start_bot()
    app.run(host="0.0.0.0", port=5000)
