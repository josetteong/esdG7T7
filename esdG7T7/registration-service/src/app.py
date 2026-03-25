import logging
from flask import Flask, jsonify, request
from .service import create_registration, get_registration
from .bot import start_bot

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = Flask(__name__)


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/registrations", methods=["POST"])
def register():
    """Create a registration entry and return a Telegram link to send to the user."""
    body = request.get_json()
    user_id = body.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    result = create_registration(user_id)
    return jsonify(result), 201


@app.route("/registrations/<user_id>", methods=["GET"])
def get_reg(user_id):
    """Get registration info including chatId — called by OutSystems before notifying."""
    result = get_registration(user_id)
    if not result:
        return jsonify({"error": "not found"}), 404
    return jsonify(result)


if __name__ == "__main__":
    start_bot()
    app.run(host="0.0.0.0", port=5000)
