import logging
import yaml
from flask import Flask, jsonify, request
from flasgger import Swagger
from .service import handle_cancellation_claimant, handle_cancellation_vendor

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = Flask(__name__)
Swagger(app, template=yaml.safe_load(open("/app/src/swagger.yaml")))


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/claimant/cancel", methods=["PATCH"])
def cancel():
    body = request.get_json()
    reservation_id = body.get("reservation_id")
    claimant_id = body.get("claimant_id")

    if not reservation_id or not claimant_id:
        return jsonify({"error": "reservation_id and claimant_id required"}), 400

    result, status_code = handle_cancellation_claimant(reservation_id, claimant_id)
    return jsonify(result), status_code


@app.route("/vendor/cancel", methods=["PATCH"])
def vendor_cancel():
    body = request.get_json()
    listing_id = body.get("listing_id")
    vendor_id = body.get("vendor_id")

    if not listing_id or not vendor_id:
        return jsonify({"error": "listing_id and vendor_id required"}), 400

    result, status_code = handle_cancellation_vendor(listing_id, vendor_id)
    return jsonify(result), status_code


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
