import logging
import yaml
from flask import Flask, jsonify, request
from flasgger import Swagger
from .service import create_registration, get_registration
from .bot import start_bot

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = Flask(__name__)
Swagger(app, template=yaml.safe_load(open("/app/src/swagger.yaml")))


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/registrations/claimant", methods=["POST"])
def register_claimant():
    """Register a claimant — returns a Telegram onboarding link."""
    body = request.get_json()
    user_id = body.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    result = create_registration(user_id, recipient_type="CLAIMANT")
    return jsonify(result), 201


@app.route("/registrations/vendor", methods=["POST"])
def register_vendor():
    """Register a vendor — returns a Telegram onboarding link."""
    body = request.get_json()
    user_id = body.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    result = create_registration(user_id, recipient_type="VENDOR")
    return jsonify(result), 201


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
