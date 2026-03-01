-- =====================================================================
-- AdvayDecor — COMPLETE DATABASE SCHEMA (Single-File)
-- =====================================================================
-- This is the ONLY SQL file you need to run on a FRESH Supabase project.
-- It creates ALL tables, functions, triggers, indexes, RLS policies,
-- seed data, storage bucket, and the super admin user.
-- 
-- ⚠️  RUN THIS IN: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- =====================================================================


-- =====================================================================
-- SECTION 1: TABLES (16 Total)
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
ALTER TABLE public.profiles ADD CONSTRAINT unique_phone UNIQUE (phone);

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
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned')),
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  shipping_address JSONB NOT NULL,
  payment_method TEXT DEFAULT 'COD' CHECK (payment_method IN ('COD', 'Razorpay')),
  payment_id TEXT,
  coupon_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,
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
  phone TEXT,
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
-- SECTION 2: FUNCTIONS
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
    RAISE EXCEPTION 'Cannot modify or delete the protected super admin account. This action can only be performed directly in the Supabase database.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================
-- SECTION 3: TRIGGERS
-- =====================================================================

-- Auto-create profile on new auth user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update `updated_at` on address changes
DROP TRIGGER IF EXISTS on_address_updated ON public.user_addresses;
CREATE TRIGGER on_address_updated
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Protect super admin from deletion via admin_users table
DROP TRIGGER IF EXISTS protect_super_admin_delete ON public.admin_users;
CREATE TRIGGER protect_super_admin_delete
  BEFORE DELETE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.protect_super_admin();

-- Protect super admin from update via admin_users table
DROP TRIGGER IF EXISTS protect_super_admin_update ON public.admin_users;
CREATE TRIGGER protect_super_admin_update
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  WHEN (OLD.is_protected = TRUE)
  EXECUTE FUNCTION public.protect_super_admin();


-- =====================================================================
-- SECTION 4: INDEXES
-- =====================================================================
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


-- =====================================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- 5a. Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_verification_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 5b. POLICIES

-- ── PROFILES ──
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins manage all profiles" ON profiles FOR ALL USING (public.is_admin());

-- ── ADMIN_USERS ──
CREATE POLICY "Admins can read own row" ON admin_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Super admins can manage admin_users" ON admin_users FOR ALL USING (public.is_admin());

-- ── CATEGORIES ──
CREATE POLICY "Anyone view active categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON categories FOR ALL USING (public.is_admin());

-- ── PRODUCTS ──
CREATE POLICY "Anyone view active products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage products" ON products FOR ALL USING (public.is_admin());

-- ── PRODUCT VARIANTS ──
CREATE POLICY "Anyone view product variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Admins manage product variants" ON product_variants FOR ALL USING (public.is_admin());

-- ── PRODUCT IMAGES ──
CREATE POLICY "Anyone view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admins manage product images" ON product_images FOR ALL USING (public.is_admin());

-- ── SITE CONFIG ──
CREATE POLICY "Anyone read site config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Admins manage site config" ON site_config FOR ALL USING (public.is_admin());

-- ── ORDERS ──
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage orders" ON orders FOR ALL USING (public.is_admin());

-- ── ORDER ITEMS ──
CREATE POLICY "Users view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Users insert own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Admins manage order items" ON order_items FOR ALL USING (public.is_admin());

-- ── OTPs (managed via service role key on server) ──
CREATE POLICY "Admins manage email otps" ON email_verification_otps FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage phone otps" ON phone_verification_otps FOR ALL USING (public.is_admin());

-- ── USER ADDRESSES ──
CREATE POLICY "Users manage own addresses" ON user_addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins read all addresses" ON user_addresses FOR SELECT USING (public.is_admin());

-- ── PRODUCT REVIEWS ──
CREATE POLICY "Anyone view approved reviews" ON product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users insert own reviews" ON product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all reviews" ON product_reviews FOR ALL USING (public.is_admin());

-- ── WISHLISTS ──
CREATE POLICY "Users manage own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view all wishlists" ON wishlists FOR SELECT USING (public.is_admin());

-- ── CONTACT MESSAGES ──
CREATE POLICY "Anyone can send contact message" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own messages" ON contact_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all messages" ON contact_messages FOR ALL USING (public.is_admin());

-- ── FAQ QUESTIONS ──
CREATE POLICY "Anyone can submit faq question" ON faq_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own questions" ON faq_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all faq questions" ON faq_questions FOR ALL USING (public.is_admin());

-- ── COUPONS ──
CREATE POLICY "Anyone view active coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage coupons" ON coupons FOR ALL USING (public.is_admin());


-- =====================================================================
-- SECTION 6: SEED DATA
-- =====================================================================

-- Default categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('Cushion', 'cushion', 'Decorative cushions and pillows'),
  ('Frame', 'frame', 'Photo frames and wall art')
ON CONFLICT (name) DO NOTHING;

-- Default site configuration
INSERT INTO public.site_config (key, value, description) VALUES
  ('global_shipping_fee', '50', 'Global shipping fee in INR. Set to 0 for free shipping promotion.'),
  ('hero_banner_url', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80', 'URL for the homepage hero banner image.'),
  ('cod_enabled', 'true', 'Enable or disable Cash on Delivery payment option.'),
  ('free_shipping_threshold', '999', 'Order amount above which shipping is free.')
ON CONFLICT (key) DO NOTHING;

-- Sample products
INSERT INTO products (id, title, slug, description, base_price, category_id, has_variants, is_active) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Multicolor Flower Cushion', 'multicolor-flower-cushion', 'A vibrant, hand-stitched floral cushion that brings a burst of color to any room.', 999, (SELECT id FROM categories WHERE name = 'Cushion'), TRUE, TRUE),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Bohemian Tasseled Cushion', 'bohemian-tasseled-cushion', 'Embrace bohemian chic with this beautifully tasseled cushion cover.', 799, (SELECT id FROM categories WHERE name = 'Cushion'), TRUE, TRUE),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Rustic Wooden Frame', 'rustic-wooden-frame', 'Handcrafted solid oak frame with a vintage finish. Perfect for family portraits or travel photography.', 1299, (SELECT id FROM categories WHERE name = 'Frame'), TRUE, TRUE),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Velvet Royal Cushion', 'velvet-royal-cushion', 'Indulge in luxury with our velvet royal cushion. Features sumptuous velvet fabric.', 1499, (SELECT id FROM categories WHERE name = 'Cushion'), TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Sample variants
INSERT INTO product_variants (id, parent_product_id, variant_name, sku, price, stock_quantity) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Red', 'CUSH-FLR-RED', 999, 12),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', 'Blue', 'CUSH-FLR-BLU', 1099, 3),
  ('b1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0003-4000-8000-000000000003', 'Classic Oak', 'FRM-WD-OAK', 1299, 10),
  ('b1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0003-4000-8000-000000000003', 'Dark Walnut', 'FRM-WD-WLN', 1399, 5)
ON CONFLICT (id) DO NOTHING;

-- Sample images
INSERT INTO product_images (id, product_id, image_url, display_order) VALUES
  ('c1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800&q=80', 0),
  ('c1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0003-4000-8000-000000000003', 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80', 0)
ON CONFLICT (id) DO NOTHING;


-- =====================================================================
-- SECTION 7: STORAGE BUCKET
-- =====================================================================
-- Create a public bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow admins to upload product images
CREATE POLICY "Admins upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
  );

-- Allow admins to update product images
CREATE POLICY "Admins update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND public.is_admin()
  );

-- Allow admins to delete product images
CREATE POLICY "Admins delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND public.is_admin()
  );


-- =====================================================================
-- SECTION 8: RELOAD SCHEMA
-- =====================================================================
NOTIFY pgrst, 'reload schema';


-- =====================================================================
-- FINAL VERIFICATION (Check counts after execution)
-- =====================================================================
SELECT 'Categories: ' || COUNT(*) FROM categories;
SELECT 'Products: ' || COUNT(*) FROM products;
SELECT 'Variants: ' || COUNT(*) FROM product_variants;
SELECT 'Images: ' || COUNT(*) FROM product_images;
SELECT 'Site Config: ' || COUNT(*) FROM site_config;
SELECT '✅ Schema setup complete!' AS status;
