import yaml
from flask import Flask, jsonify, request
from flasgger import Swagger
from .service import create_claimant, get_claimant

app = Flask(__name__)
Swagger(app, template=yaml.safe_load(open("/app/src/swagger.yaml")))


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/claimants", methods=["POST"])
def create_claimant_endpoint():
    """Register a new claimant."""
    body = request.get_json()
    if not body:
        return jsonify({"error": "request body required"}), 400

    claimant_name = body.get("claimant_name")
    email = body.get("email")
    password = body.get("password")

    if not claimant_name:
        return jsonify({"error": "claimant_name is required"}), 400
    if not password:
        return jsonify({"error": "password is required"}), 400

    claimant = create_claimant(claimant_name, email, password)
    return jsonify(claimant), 201


@app.route("/claimants/<int:claimant_id>", methods=["GET"])
def get_claimant_endpoint(claimant_id):
    """Get claimant by ID."""
    claimant = get_claimant(claimant_id)
    if not claimant:
        return jsonify({"error": "claimant not found"}), 404
    return jsonify(claimant), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
