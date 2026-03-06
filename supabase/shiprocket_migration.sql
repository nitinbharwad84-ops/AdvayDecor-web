-- =====================================================================
-- AdvayDecor — SHIPROCKET INTEGRATION MIGRATION
-- =====================================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- This adds all columns needed for Shiprocket integration.
-- It is safe to run multiple times (IF NOT EXISTS / DO $$ blocks).
-- =====================================================================


-- =====================================================================
-- SECTION 1: PRODUCT TABLE — Shipping dimensions & weight
-- =====================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS weight DECIMAL(10,3) DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS length DECIMAL(10,2) DEFAULT 20,
  ADD COLUMN IF NOT EXISTS width DECIMAL(10,2) DEFAULT 20,
  ADD COLUMN IF NOT EXISTS height DECIMAL(10,2) DEFAULT 10,
  ADD COLUMN IF NOT EXISTS hsn_code TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_info TEXT DEFAULT '';


-- =====================================================================
-- SECTION 2: PRODUCT VARIANTS TABLE — Active/Inactive toggle + optional weight override
-- =====================================================================

ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS weight DECIMAL(10,3);


-- =====================================================================
-- SECTION 3: ORDERS TABLE — Shiprocket tracking fields
-- =====================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT,
  ADD COLUMN IF NOT EXISTS shiprocket_shipment_id TEXT,
  ADD COLUMN IF NOT EXISTS tracking_id TEXT,
  ADD COLUMN IF NOT EXISTS courier_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_label_url TEXT,
  ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT '';


-- =====================================================================
-- SECTION 4: INDEXES for new columns
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_order ON orders(shiprocket_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON product_variants(is_active);


-- =====================================================================
-- SECTION 5: SEED Shiprocket config into site_config
-- =====================================================================

INSERT INTO public.site_config (key, value, description) VALUES
  ('shiprocket_enabled', 'false', 'Enable Shiprocket shipping integration'),
  ('shipping_mode', 'fixed', 'Shipping fee mode: fixed or variable'),
  ('shiprocket_pickup_location_id', '', 'Shiprocket pickup location ID'),
  ('courier_priority', 'recommended', 'Courier selection: cheapest, fastest, recommended'),
  ('shiprocket_pincode_check', 'true', 'Enable pincode serviceability check'),
  ('shiprocket_live_tracking', 'true', 'Enable live tracking on order details'),
  ('shiprocket_auto_ship', 'false', 'Auto-create shipment on order confirmation'),
  ('shipping_fallback_fee', '50', 'Fallback shipping fee if API fails')
ON CONFLICT (key) DO NOTHING;


-- =====================================================================
-- DONE
-- =====================================================================
NOTIFY pgrst, 'reload schema';

SELECT '✅ Shiprocket migration applied successfully!' AS status;
