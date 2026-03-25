-- ============================================================
--  SFRP Seed Data
--  Run this in the Supabase SQL Editor
-- ============================================================

-- ── Vendors ──────────────────────────────────────────────────

INSERT INTO vendors (vendor_name, contact_person, contact_email, contact_phone, vendor_status) VALUES
  ('FoodMart SG',          'Alice Tan',  'alice@foodmart.sg',        '91234567', 'ACTIVE'),
  ('Bread & Butter Bakery','Bob Lim',    'bob@bnb.sg',               '98765432', 'ACTIVE'),
  ('Green Grocer',         'Carol Ng',   'carol@greengrocer.sg',     '87654321', 'ACTIVE');

-- ── Claimants ────────────────────────────────────────────────

INSERT INTO claimants (claimant_name, claimant_type, email, phone_number, strike_count, eligibility_status) VALUES
  ('Helping Hands NGO',    'NGO',        'ops@helpinghands.sg',      '63331234', 0, 'ACTIVE'),
  ('Food from the Heart',  'NGO',        'info@foodfromtheheart.sg', '63339876', 0, 'ACTIVE'),
  ('John Doe',             'INDIVIDUAL', 'john@gmail.com',           '91112222', 0, 'ACTIVE'),
  ('Jane Smith',           'INDIVIDUAL', 'jane@gmail.com',           '92223333', 0, 'ACTIVE');

-- ── Listings ─────────────────────────────────────────────────
-- Uses vendor_ids generated above — adjust if your IDs differ

INSERT INTO listings (vendor_id, food_name, description, total_quantity, expiry_time, listing_status)
SELECT
  v.vendor_id,
  l.food_name,
  l.description,
  l.total_quantity,
  NOW() + l.expires_in,
  'AVAILABLE'
FROM (VALUES
  ('FoodMart SG',           'White Rice (10kg)',      'Surplus white rice, unopened bags',  20, INTERVAL '6 hours'),
  ('Bread & Butter Bakery', 'Assorted Bread Loaves',  'Day-old bread, still fresh',         15, INTERVAL '3 hours'),
  ('Green Grocer',          'Mixed Vegetables Box',   'Carrots, broccoli, cabbage',         10, INTERVAL '8 hours')
) AS l(vendor_name, food_name, description, total_quantity, expires_in)
JOIN vendors v ON v.vendor_name = l.vendor_name;
