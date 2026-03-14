from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from datetime import timedelta

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:root@localhost/SFRP"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


#Model 
class Reservation(db.Model):
    __tablename__ = "reservations"

    reservation_id = db.Column(
        db.BigInteger,
        primary_key=True,
        autoincrement=True
    )

    listing_id = db.Column(
        db.BigInteger,
        nullable=False,
        index=True
    )

    claimant_id = db.Column(
        db.BigInteger,
        nullable=False,
        index=True
    )

    reservation_status = db.Column(
        db.Enum(
            'RESERVED',
            'CANCELLED',
            'COMPLETED',
            'RELEASED',
            name='reservation_status_enum'
        ),
        nullable=False,
        default='RESERVED'
    )

    reserved_quantity = db.Column(
        db.Integer,
        nullable=False
    )

    pickup_time = db.Column(
        db.DateTime,
        nullable=False
    )

    pickup_window_start = db.Column(
        db.DateTime,
        nullable=False
    )

    pickup_window_end = db.Column(
        db.DateTime,
        nullable=False,
        index=True
    )

    reserved_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    completed_at = db.Column(
        db.DateTime,
        nullable=True
    )

    cancelled_at = db.Column(
        db.DateTime,
        nullable=True
    )

    cancellation_type = db.Column(
        db.Enum(
            'GRACE',
            'NON_GRACE',
            'VENDOR',
            'FAILEDCOLLECTION',
            'EXPIRED',
            name='cancellation_type_enum'
        ),
        nullable=True
    )

    def to_dict(self):
        return {
            "reservationId": self.reservation_id,
            "listingId": self.listing_id,
            "claimantId": self.claimant_id,
            "reservationStatus": self.reservation_status,
            "reservedQuantity": self.reserved_quantity,
            "pickupTime": self.pickup_time.isoformat() if self.pickup_time else None,
            "pickupWindowStart": self.pickup_window_start.isoformat() if self.pickup_window_start else None,
            "pickupWindowEnd": self.pickup_window_end.isoformat() if self.pickup_window_end else None,
            "reservedAt": self.reserved_at.isoformat() if self.reserved_at else None,
            "completedAt": self.completed_at.isoformat() if self.completed_at else None,
            "cancelledAt": self.cancelled_at.isoformat() if self.cancelled_at else None,
            "cancellationType": self.cancellation_type
        }


# In-memory storage for skeleton/demo purposes only
# Replace with real DB logic later
reservations = {}


def now_iso() -> str:
    return datetime.now().isoformat()


def generate_id() -> str:
    return f"rsv_{uuid.uuid4().hex[:8]}"

def parse_date_time(date_str: str, time_str: str):
    try:
        return datetime.fromisoformat(f"{date_str}T{time_str}")
    except Exception:
        return None


@app.route("/reservations", methods=["POST"])
def create_reservation():
    """
    Create a reservation after Listing Service has already confirmed reserve success.
        {
        "listingId": 1,
        "claimantId": "n-2001",
        "reservedQty": 1,
        "pickupDate": "2026-03-14",
        "pickupTime": "21:00:00"
        }

    """
    try: 
        data = request.get_json(silent=True) or {}


        required_fields = [
            "listingId",
            "claimantId",
            "reservedQty",
            "pickupDate",
            "pickupTime",
        ]

        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({
                "error": "Missing required fields",
                "missingFields": missing
            }), 400

        pickup_datetime = parse_date_time(
            data['pickupDate'],
            data['pickupTime']
        )
        print(pickup_datetime)

        if pickup_datetime is None:
            return jsonify({"error": "Invalid pickupTime format"}),400

        pickup_window_start = pickup_datetime - timedelta(minutes=30)
        pickup_window_end = pickup_datetime + timedelta(minutes=30)

        reservation = Reservation(
            listing_id=data["listingId"],
            claimant_id=data["claimantId"],
            reserved_quantity=data['reservedQty'],
            reservation_status="RESERVED",
            pickup_time=pickup_datetime,
            pickup_window_start=pickup_window_start,
            pickup_window_end=pickup_window_end
        )
        
        # Save to DB
        db.session.add(reservation)
        db.session.commit()

        return jsonify({
            "reservationId": reservation.reservation_id,
            "listingId": reservation.listing_id,
            "claimantId": reservation.claimant_id,
            "reserved_qty": reservation.reserved_quantity,
            "pickup_window_start": reservation.pickup_window_start.isoformat(),
            "pickup_window_end": reservation.pickup_window_end.isoformat(),
            "reservation_status": reservation.reservation_status

        }),201 
    except Exception as e:
        db.session.rollback()

        return jsonify({
            "error": "Failed to create reservation",
            "message": str(e)
        }),500

@app.route("/reservations/<reservation_id>", methods=['GET'])
def get_reservation(reservation_id):
    reservation = Reservation.query.get(reservation_id)

    if not reservation:
        return jsonify({"error": "Reservation Not Foud"}),404
    
    return jsonify(reservation.to_dict()),200

@app.route("/reservations",methods=['GET'])
def get_reservation_by_claimant():
    claimantId = request.args.get("claimantId")

    if not claimantId:
        return jsonify({"error": "claimantId query parameter required"}), 400

    reservations = Reservation.query.filter_by(
        claimant_id=claimantId
    ).all()

    if not reservations:
        return jsonify({"message": "No reservations found"}), 404

    return jsonify([r.to_dict() for r in reservations]), 200


@app.route("/reservations",methods=['GET'])
def get_reservation_by_listing():

    listing_id = request.args.get("listingId")

    if not listing_id: 
        return ({"message": "listingId query parameter required"}),400 
    
    return jsonify([l.to_dict() for l in listing_id]),200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)