-- ============================================================
--  SFRP — Shared Food Rescue Platform
--  PostgreSQL / Supabase
-- ============================================================

-- ─── ENUM TYPES ──────────────────────────────────────────────

CREATE TYPE vendor_status        AS ENUM ('ACTIVE','INACTIVE','SUSPENDED');
CREATE TYPE listing_status       AS ENUM ('AVAILABLE','FULLY_RESERVED','COLLECTED','EXPIRED','CANCELLED');
CREATE TYPE claimant_type        AS ENUM ('NGO','INDIVIDUAL');
CREATE TYPE eligibility_status   AS ENUM ('ACTIVE','SUSPENDED','BANNED');
CREATE TYPE reservation_status   AS ENUM ('RESERVED','COMPLETED','CANCELLED','MISSED_PICKUP','EXPIRED');
CREATE TYPE cancellation_type    AS ENUM ('GRACE','NON_GRACE','VENDOR','FAILEDCOLLECTION','EXPIRED');
CREATE TYPE recipient_type       AS ENUM ('VENDOR','CLAIMANT');
CREATE TYPE notification_type    AS ENUM (
    'RESERVATION_CREATED',
    'RESERVATION_CANCELLED',
    'RESERVATION_RELEASED',
    'RESERVATION_COMPLETED',
    'PICKUP_REMINDER',
    'LISTING_EXPIRED',
    'STRIKE_ISSUED'
);
CREATE TYPE delivery_status      AS ENUM ('PENDING','SENT','FAILED');

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
--  VENDOR
-- ============================================================

CREATE TABLE vendors (
    vendor_id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vendor_name                     VARCHAR(255) NOT NULL,
    business_registration_number    VARCHAR(100),
    contact_person                  VARCHAR(255),
    contact_email                   VARCHAR(255),
    contact_phone                   VARCHAR(50),
    address                         TEXT,
    vendor_status                   vendor_status NOT NULL DEFAULT 'ACTIVE',

    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
--  LISTING DB
-- ============================================================

CREATE TABLE listings (
    listing_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vendor_id       BIGINT NOT NULL REFERENCES vendors(vendor_id),
    food_name       VARCHAR(255) NOT NULL,
    description     TEXT,
    total_quantity  INT NOT NULL CHECK (total_quantity > 0),
    -- reserved_qty and remaining_qty are derived from reservations, not stored
    expiry_time     TIMESTAMPTZ NOT NULL,
    listing_status  listing_status NOT NULL DEFAULT 'AVAILABLE',

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
--  CLAIMANT DB
-- ============================================================

CREATE TABLE claimants (
    claimant_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    claimant_name       VARCHAR(255) NOT NULL,
    claimant_type       claimant_type NOT NULL,
    email               VARCHAR(255),
    phone_number        VARCHAR(50),

    strike_count        INT NOT NULL DEFAULT 0 CHECK (strike_count >= 0),
    suspended_until     TIMESTAMPTZ,
    eligibility_status  eligibility_status NOT NULL DEFAULT 'ACTIVE',

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_claimants_updated_at
    BEFORE UPDATE ON claimants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE strikes (
    strike_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    claimant_id  BIGINT NOT NULL REFERENCES claimants(claimant_id),
    reason       VARCHAR(255),
    issued_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
--  RESERVATION DB
-- ============================================================

CREATE TABLE reservations (
    reservation_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    listing_id          BIGINT NOT NULL REFERENCES listings(listing_id),
    claimant_id         BIGINT NOT NULL REFERENCES claimants(claimant_id),
    reservation_status  reservation_status NOT NULL DEFAULT 'RESERVED',

    reservation_qty     INT NOT NULL CHECK (reservation_qty > 0),
    pickup_time         TIMESTAMPTZ NOT NULL,

    reserved_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    cancellation_type   cancellation_type
);

-- ============================================================
--  NOTIFICATION DB
-- ============================================================

CREATE TABLE notifications (
    notification_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipient_id       BIGINT NOT NULL,
    recipient_type     recipient_type NOT NULL,
    notification_type  notification_type NOT NULL,
    message            TEXT NOT NULL,
    delivery_status    delivery_status NOT NULL DEFAULT 'PENDING',

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at            TIMESTAMPTZ
);
