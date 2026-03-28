import logging
import os
from flask import Flask, jsonify, request
from flasgger import Swagger
from .service import handle_collection

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = Flask(__name__)
Swagger(app, template_file=os.path.join(os.path.dirname(__file__), "swagger.yaml"))


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/collect", methods=["POST"])
def collect():
    body = request.get_json()
    reservation_id = body.get("reservation_id")
    claimant_id = body.get("claimant_id")

    if not reservation_id or not claimant_id:
        return jsonify({"error": "reservation_id and claimant_id required"}), 400

    result, status_code = handle_collection(str(reservation_id), str(claimant_id))
    return jsonify(result), status_code


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
