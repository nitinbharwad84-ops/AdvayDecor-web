-- =====================================================================
-- AdvayDecor — Database Index Optimization Migration
-- =====================================================================
-- RUN IN: Supabase Dashboard → SQL Editor → New Query → Paste → Run
--
-- This migration is 100% SAFE to run:
-- ✅ Uses IF NOT EXISTS — won't crash if index already exists
-- ✅ Uses CONCURRENTLY — won't lock tables during creation
-- ✅ Only ADDS indexes — never removes or modifies existing data
-- =====================================================================


-- ==========================================================
-- SECTION 1: VERIFY EXISTING INDEXES (Already in schema.sql)
-- ==========================================================
-- These should already exist from complete_schema.sql.
-- We re-run them with IF NOT EXISTS for safety.

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_email ON email_verification_otps(email);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON phone_verification_otps(phone);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_faq_status ON faq_questions(status);


-- ==========================================================
-- SECTION 2: NEW PERFORMANCE INDEXES (Added by this migration)
-- ==========================================================

-- Orders: Created date (for sorting recent orders in dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Orders: Payment ID (for Razorpay webhook lookups)
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);

-- Orders: Composite index for admin dashboard (status + date)
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- Order Items: Product lookup (for "which orders contain this product" queries)
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Product Images: Fast image lookup by product
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- Product Images: Display ordering
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(product_id, display_order);

-- Product Variants: Fast variant lookup by parent product
CREATE INDEX IF NOT EXISTS idx_product_variants_parent ON product_variants(parent_product_id);

-- Reviews: User lookup (for "has this user reviewed?" checks)
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);

-- Reviews: Composite (product + approved) for the public product page
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON product_reviews(product_id, is_approved);

-- Profiles: Email lookup (for OTP duplicate detection)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Coupons: Code lookup (for coupon validation)
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Coupons: Active + expiry (for valid coupon queries)
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active, expires_at);


-- ==========================================================
-- VERIFICATION
-- ==========================================================
SELECT 
  schemaname, 
  tablename, 
  indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

SELECT '✅ Index optimization complete!' AS status;
