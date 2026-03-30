from datetime import datetime, timezone
from sqlalchemy import BigInteger, Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Enum
from sqlalchemy.orm import DeclarativeBase, relationship

_now = lambda: datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class Vendor(Base):
    __tablename__ = "vendors"

    vendor_id = Column(BigInteger, primary_key=True)
    vendor_name = Column(String(255), nullable=False)
    contact_email = Column(String(255))
    password_hash = Column(String(255))
    vendor_status = Column(String, nullable=False, default="ACTIVE")
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now)


class Listing(Base):
    __tablename__ = "listings"

    listing_id = Column(BigInteger, primary_key=True)
    vendor_id = Column(BigInteger, ForeignKey("vendors.vendor_id"), nullable=False)
    food_name = Column(String(255), nullable=False)
    description = Column(Text)
    total_quantity = Column(Integer, nullable=False)
    remaining_qty = Column(Integer, nullable=False)
    expiry_time = Column(DateTime(timezone=True), nullable=False)
    listing_status = Column(String, nullable=False, default="AVAILABLE")
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now)

    reservations = relationship("Reservation", back_populates="listing")


class Claimant(Base):
    __tablename__ = "claimants"

    claimant_id = Column(BigInteger, primary_key=True)
    claimant_name = Column(String(255), nullable=False)
    email = Column(String(255))
    password_hash = Column(String(255))
    strike_count = Column(Integer, nullable=False, default=0)
    suspended_until = Column(DateTime(timezone=True))
    eligibility_status = Column(String, nullable=False, default="ACTIVE")
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now)

    strikes = relationship("Strike", back_populates="claimant")


class Strike(Base):
    __tablename__ = "strikes"

    strike_id = Column(BigInteger, primary_key=True)
    claimant_id = Column(BigInteger, ForeignKey("claimants.claimant_id"), nullable=False)
    reason = Column(String(255))
    issued_at = Column(DateTime(timezone=True), default=_now)

    claimant = relationship("Claimant", back_populates="strikes")


class Reservation(Base):
    __tablename__ = "reservations"

    reservation_id = Column(BigInteger, primary_key=True)
    listing_id = Column(BigInteger, ForeignKey("listings.listing_id"), nullable=False)
    claimant_id = Column(BigInteger, ForeignKey("claimants.claimant_id"), nullable=False)
    reservation_status = Column(String, nullable=False, default="RESERVED")
    reservation_qty = Column(Integer, nullable=False)
    pickup_time = Column(DateTime(timezone=True), nullable=False)
    reserved_at = Column(DateTime(timezone=True), default=_now)
    completed_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))
    cancellation_type = Column(String)

    listing = relationship("Listing", back_populates="reservations")


class TelegramRegistration(Base):
    __tablename__ = "telegram_registrations"

    user_id = Column(String(255), primary_key=True)
    recipient_type = Column(String(50), primary_key=True)
    chat_id = Column(BigInteger)
    token = Column(String(50))
    is_registered = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=_now)
    registered_at = Column(DateTime(timezone=True))


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(BigInteger, primary_key=True, autoincrement=True)

    user_id = Column(BigInteger, nullable=False)

    recipient_type = Column(
        Enum("VENDOR", "CLAIMANT", name="recipient_type"),
        nullable=False
    )

    notification_type = Column(
        Enum(
            "RESERVATION_CREATED",
            "RESERVATION_CANCELLED",
            "RESERVATION_RELEASED",
            "RESERVATION_COMPLETED",
            "PICKUP_REMINDER",
            "LISTING_EXPIRED",
            "STRIKE_ISSUED",
            "MISSED_PICKUP",
            name="notification_type"
        ),
        nullable=False
    )

    delivery_status = Column(
        Enum("PENDING", "SENT", "FAILED", name="delivery_status"),
        nullable=False,
        server_default="PENDING"
    )

    message = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=_now
    )

    sent_at = Column(
        DateTime(timezone=True),
        nullable=True
    )
