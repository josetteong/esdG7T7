-- ============================================================
--  SFRP Seed Data (aligned with schema.sql)
-- ============================================================

-- Vendors
INSERT INTO vendors (vendor_name, contact_email, vendor_status) VALUES
  ('FoodMart SG',           'alice@foodmart.sg',        'ACTIVE'),
  ('Bread & Butter Bakery', 'bob@bnb.sg',               'ACTIVE'),
  ('Green Grocer',          'carol@greengrocer.sg',     'ACTIVE');

-- Claimants
INSERT INTO claimants (claimant_name, email, strike_count, eligibility_status) VALUES
  ('Helping Hands NGO',    'ops@helpinghands.sg',       0, 'ACTIVE'),
  ('Food from the Heart',  'info@foodfromtheheart.sg',  0, 'ACTIVE'),
  ('John Doe',             'john@gmail.com',            0, 'ACTIVE'),
  ('Jane Smith',           'jane@gmail.com',            0, 'ACTIVE');

-- Listings (remaining_qty = total_quantity)
INSERT INTO listings (vendor_id, food_name, description, total_quantity, remaining_qty, expiry_time, listing_status)
SELECT
  v.vendor_id,
  l.food_name,
  l.description,
  l.total_quantity,
  l.total_quantity,
  NOW() + l.expires_in,
  'AVAILABLE'
FROM (VALUES
  ('FoodMart SG',           'White Rice (10kg)',      'Surplus white rice, unopened bags',  20, INTERVAL '6 hours'),
  ('Bread & Butter Bakery', 'Assorted Bread Loaves',  'Day-old bread, still fresh',         15, INTERVAL '3 hours'),
  ('Green Grocer',          'Mixed Vegetables Box',   'Carrots, broccoli, cabbage',         10, INTERVAL '8 hours')
) AS l(vendor_name, food_name, description, total_quantity, expires_in)
JOIN vendors v ON v.vendor_name = l.vendor_name;