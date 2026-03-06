-- =====================================================================
-- AdvayDecor — COMPLETE DATABASE SCHEMA (Single-File)
-- =====================================================================
-- This is the ONLY SQL file you need to run on a FRESH Supabase project.
-- It creates ALL tables, functions, triggers, indexes, RLS policies,
-- seed data, storage bucket, and the initial setup.
-- 
-- ⚠️  RUN THIS IN: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- =====================================================================


-- =====================================================================
-- SECTION 1: TABLES (17 Total)
-- =====================================================================

-- 1. PROFILES (Website Customers ONLY — NOT admins)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on phone (allows NULL but prevents duplicates)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_phone') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT unique_phone UNIQUE (phone);
  END IF;
END $$;

-- 2. ADMIN_USERS (Admin accounts — completely separate from customers)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT DEFAULT 'Admin',
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_protected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRODUCTS (Parent Items)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  category TEXT DEFAULT 'Cushion',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  has_variants BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  -- Shiprocket shipping dimensions
  weight DECIMAL(10,3) DEFAULT 0.5,
  length DECIMAL(10,2) DEFAULT 20,
  width DECIMAL(10,2) DEFAULT 20,
  height DECIMAL(10,2) DEFAULT 10,
  hsn_code TEXT DEFAULT '',
  shipping_info TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PRODUCT VARIANTS (Child Items — e.g. Size, Color)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  weight DECIMAL(10,3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- 7. SITE CONFIG (Global Settings)
CREATE TABLE IF NOT EXISTS public.site_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT
);

-- 8. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  guest_info JSONB,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Awaiting Payment', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned')),
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  shipping_address JSONB NOT NULL,
  payment_method TEXT DEFAULT 'COD' CHECK (payment_method IN ('COD', 'Razorpay')),
  payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  coupon_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  -- Shiprocket tracking
  shiprocket_order_id TEXT,
  shiprocket_shipment_id TEXT,
  tracking_id TEXT,
  courier_name TEXT,
  shipping_label_url TEXT,
  shipping_status TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  variant_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- 10. EMAIL VERIFICATION OTPs (8-digit)
CREATE TABLE IF NOT EXISTS public.email_verification_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. PHONE VERIFICATION OTPs (6-digit)
CREATE TABLE IF NOT EXISTS public.phone_verification_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. USER ADDRESSES (Saved Shipping Addresses)
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  reviewer_name TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- 14. WISHLISTS
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 15. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  reply_text TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. FAQ QUESTIONS
CREATE TABLE IF NOT EXISTS public.faq_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  question TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  answer_text TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percentage')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================================
-- SECTION 2: FUNCTIONS & RPCs
-- =====================================================================

-- 2a. is_admin() — Helper for RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2b. is_super_admin() — Check if current user is the protected super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'super_admin' AND is_protected = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2c. handle_new_user() — Auto-create profile on customer signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create a profile if the user is NOT an admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2d. handle_updated_at() — Auto-update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2e. protect_super_admin() — Prevent deletion/modification of protected super admin
CREATE OR REPLACE FUNCTION public.protect_super_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_protected = TRUE THEN
    RAISE EXCEPTION 'Cannot modify or delete the protected super admin account.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2f. decrement_stock() — Safely reduce stock for a variant
CREATE OR REPLACE FUNCTION public.decrement_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.product_variants
    SET stock_quantity = GREATEST(stock_quantity - p_quantity, 0)
    WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2g. get_dashboard_stats() — Performance-optimized admin stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_revenue', COALESCE((
      SELECT SUM(total_amount) 
      FROM public.orders 
      WHERE status NOT IN ('Cancelled', 'Returned', 'Awaiting Payment')
    ), 0),
    'total_orders', (SELECT COUNT(*) FROM public.orders),
    'pending_orders', (SELECT COUNT(*) FROM public.orders WHERE status = 'Pending'),
    'total_products', (SELECT COUNT(*) FROM public.products)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- =====================================================================
-- SECTION 3: TRIGGERS
-- =====================================================================

-- Profile management
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Timestamp tracking
DROP TRIGGER IF EXISTS on_address_updated ON public.user_addresses;
CREATE TRIGGER on_address_updated
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_product_updated ON public.products;
CREATE TRIGGER on_product_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Super Admin protection
DROP TRIGGER IF EXISTS protect_super_admin_delete ON public.admin_users;
CREATE TRIGGER protect_super_admin_delete
  BEFORE DELETE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.protect_super_admin();

DROP TRIGGER IF EXISTS protect_super_admin_update ON public.admin_users;
CREATE TRIGGER protect_super_admin_update
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  WHEN (OLD.is_protected = TRUE)
  EXECUTE FUNCTION public.protect_super_admin();


-- =====================================================================
-- SECTION 4: INDEXES (Performance & Uniqueness)
-- =====================================================================

-- Primary Search & filter indexes
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

-- Razorpay & Scaling indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_parent ON product_variants(parent_product_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);


-- =====================================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Enable RLS on ALL tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP;
END $$;

-- ── PROFILES ──
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins manage profiles" ON profiles;
CREATE POLICY "Admins manage profiles" ON profiles FOR ALL USING (public.is_admin());

-- ── ADMIN USERS ──
DROP POLICY IF EXISTS "Admins can view their own record" ON admin_users;
CREATE POLICY "Admins can view their own record" ON admin_users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admins manage all admin users" ON admin_users;
CREATE POLICY "Super admins manage all admin users" ON admin_users FOR ALL USING (public.is_super_admin());


-- ── CATEGORIES ──
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage categories" ON categories;
CREATE POLICY "Admins manage categories" ON categories FOR ALL USING (public.is_admin());

-- ── PRODUCTS ──
DROP POLICY IF EXISTS "Public read active products" ON products;
CREATE POLICY "Public read active products" ON products FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage products" ON products;
CREATE POLICY "Admins manage products" ON products FOR ALL USING (public.is_admin());

-- ── PRODUCT VARIANTS & IMAGES ──
DROP POLICY IF EXISTS "Public read variants" ON product_variants;
CREATE POLICY "Public read variants" ON product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage variants" ON product_variants;
CREATE POLICY "Admins manage variants" ON product_variants FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read images" ON product_images;
CREATE POLICY "Public read images" ON product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage images" ON product_images;
CREATE POLICY "Admins manage images" ON product_images FOR ALL USING (public.is_admin());

-- ── ORDERS & ITEMS ──
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create orders" ON orders;
CREATE POLICY "Users create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage orders" ON orders;
CREATE POLICY "Admins manage orders" ON orders FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users view own order items" ON order_items;
CREATE POLICY "Users view own order items" ON order_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage order items" ON order_items;
CREATE POLICY "Admins manage order items" ON order_items FOR ALL USING (public.is_admin());

-- ── USER ADDRESSES ──
DROP POLICY IF EXISTS "Users manage own addresses" ON user_addresses;
CREATE POLICY "Users manage own addresses" ON user_addresses FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read addresses" ON user_addresses;
CREATE POLICY "Admins read addresses" ON user_addresses FOR SELECT USING (public.is_admin());

-- ── REVIEWS & WISHLIST ──
DROP POLICY IF EXISTS "Public read approved reviews" ON product_reviews;
CREATE POLICY "Public read approved reviews" ON product_reviews FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Users manage own reviews" ON product_reviews;
CREATE POLICY "Users manage own reviews" ON product_reviews FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage reviews" ON product_reviews;
CREATE POLICY "Admins manage reviews" ON product_reviews FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlists;
CREATE POLICY "Users manage own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view wishlists" ON wishlists;
CREATE POLICY "Admins view wishlists" ON wishlists FOR SELECT USING (public.is_admin());


-- =====================================================================
-- SECTION 6: SEED DATA (Basics)
-- =====================================================================

INSERT INTO public.categories (name, slug, description) VALUES
  ('Cushion', 'cushion', 'Decorative cushions and pillows'),
  ('Frame', 'frame', 'Photo frames and wall art')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.site_config (key, value, description) VALUES
  ('global_shipping_fee', '50', 'Global shipping fee in INR'),
  ('cod_enabled', 'true', 'Enable Cash on Delivery'),
  ('razorpay_enabled', 'true', 'Enable Razorpay Online Payment'),
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
-- SECTION 7: STORAGE
-- =====================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read" ON storage.objects;
CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin manage" ON storage.objects;
CREATE POLICY "Admin manage" ON storage.objects FOR ALL USING (bucket_id = 'product-images' AND public.is_admin());


-- =====================================================================
-- FINAL ACTIONS
-- =====================================================================
NOTIFY pgrst, 'reload schema';

-- =====================================================================
-- ADMIN SETUP: Run "promote_admin.sql" separately after this schema.
-- That file will promote your user to super_admin.
-- =====================================================================

SELECT '✅ AdvayDecor MASTER SCHEMA applied successfully! Now run promote_admin.sql to set up your admin account.' AS status;
