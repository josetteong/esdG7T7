import yaml
from flask import Flask, jsonify, request
from flasgger import Swagger
from .service import create_vendor, get_vendor

app = Flask(__name__)
Swagger(app, template=yaml.safe_load(open("/app/src/swagger.yaml")))


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/vendors", methods=["POST"])
def create_vendor_endpoint():
    """Create a new vendor."""
    body = request.get_json()
    if not body:
        return jsonify({"error": "request body required"}), 400

    vendor_name = body.get("vendor_name")
    contact_email = body.get("contact_email")
    password = body.get("password")

    if not vendor_name:
        return jsonify({"error": "vendor_name is required"}), 400
    if not password:
        return jsonify({"error": "password is required"}), 400

    vendor = create_vendor(vendor_name, contact_email, password)
    return jsonify(vendor), 201


@app.route("/vendors/<int:vendor_id>", methods=["GET"])
def get_vendor_endpoint(vendor_id):
    """Get vendor by ID — check if vendor has been created."""
    vendor = get_vendor(vendor_id)
    if not vendor:
        return jsonify({"error": "vendor not found"}), 404
    return jsonify(vendor), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
