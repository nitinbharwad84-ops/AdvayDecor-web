-- AdvayDecor Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ⚠️  If upgrading from old schema, run the migration SQL at the bottom first.

-- ============================================
-- 1. PROFILES (Website Customers ONLY)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ADMIN_USERS (Admin accounts — separate table)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT DEFAULT 'Admin',
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP (customers only)
-- ============================================
-- This trigger creates a profile row when a new user signs up.
-- It does NOT create an admin_users row — admins are added via the admin panel.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if user is NOT already in admin_users
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. PRODUCTS (Parent Items)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  category TEXT DEFAULT 'Cushion',  -- Legacy text field, kept for backwards compatibility
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,  -- Proper FK to categories table
  has_variants BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration: add category_id if upgrading existing table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- ============================================
-- 5. PRODUCT VARIANTS (Child Items)
-- ============================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. PRODUCT IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- ============================================
-- 7. SITE CONFIG (Control Center)
-- ============================================
CREATE TABLE IF NOT EXISTS site_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT
);

-- Seed site config defaults
INSERT INTO site_config (key, value, description) VALUES
  ('global_shipping_fee', '50', 'Global shipping fee in INR. Set to 0 for free shipping promotion.'),
  ('hero_banner_url', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80', 'URL for the homepage hero banner image.'),
  ('cod_enabled', 'true', 'Enable or disable Cash on Delivery payment option.'),
  ('free_shipping_threshold', '999', 'Order amount above which shipping is free.')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 8. ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
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

-- ============================================
-- 9. ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
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

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- PROFILES: Customers can read/update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (public.is_admin());

-- ADMIN_USERS: Admins can view all admin users
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
CREATE POLICY "Admins can view admin users" ON admin_users FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can insert admin users" ON admin_users;
CREATE POLICY "Admins can insert admin users" ON admin_users FOR INSERT WITH CHECK (public.is_admin());

-- PRODUCTS: Anyone can read active products, admins can CRUD
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (public.is_admin());

-- PRODUCT VARIANTS: Anyone can read, admins can CRUD
DROP POLICY IF EXISTS "Anyone can view variants" ON product_variants;
CREATE POLICY "Anyone can view variants" ON product_variants FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins can manage variants" ON product_variants;
CREATE POLICY "Admins can manage variants" ON product_variants FOR ALL USING (public.is_admin());

-- PRODUCT IMAGES: Anyone can read, admins can CRUD
DROP POLICY IF EXISTS "Anyone can view images" ON product_images;
CREATE POLICY "Anyone can view images" ON product_images FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins can manage images" ON product_images;
CREATE POLICY "Admins can manage images" ON product_images FOR ALL USING (public.is_admin());

-- SITE CONFIG: Anyone can read, admins can update
DROP POLICY IF EXISTS "Anyone can read config" ON site_config;
CREATE POLICY "Anyone can read config" ON site_config FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins can manage config" ON site_config;
CREATE POLICY "Admins can manage config" ON site_config FOR ALL USING (public.is_admin());

-- ORDERS: Users can view own orders, admins can view all
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (public.is_admin());

-- ORDER ITEMS: Same as orders
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
CREATE POLICY "Users can create order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
CREATE POLICY "Admins can manage order items" ON order_items FOR ALL USING (public.is_admin());

-- ============================================
-- 11. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_variants_parent ON product_variants(parent_product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_variant ON product_images(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- SETUP INSTRUCTIONS:
-- ============================================
-- After running this schema:
--
-- 1. Create the first admin user in Supabase Auth:
--    Dashboard → Authentication → Add User
--    Use a strong email and password (do NOT commit credentials to source control)
--
-- 2. Insert into admin_users table:
--    INSERT INTO admin_users (id, email, role)
--    SELECT id, email, 'super_admin'
--    FROM auth.users WHERE email = '<YOUR_ADMIN_EMAIL>';
--
-- ============================================
-- MIGRATION (if upgrading from old schema with role in profiles):
-- ============================================
-- Run this BEFORE the schema above if you had the old schema:
--
-- -- Move existing admins to admin_users table
-- INSERT INTO admin_users (id, email, role)
-- SELECT id, email, role FROM profiles WHERE role IN ('admin', 'super_admin')
-- ON CONFLICT (id) DO NOTHING;
--
-- -- Remove role column from profiles
-- ALTER TABLE profiles DROP COLUMN IF EXISTS role;
--
-- -- Add coupons support to orders table
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- ============================================

-- ============================================
-- 12. CONTACT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
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

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Users can view own messages" ON contact_messages;
CREATE POLICY "Users can view own messages" ON contact_messages FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage messages" ON contact_messages;
CREATE POLICY "Admins can manage messages" ON contact_messages FOR ALL USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_contact_messages_user ON contact_messages(user_id);

-- ============================================
-- 13. FAQ QUESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS faq_questions (
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

ALTER TABLE faq_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert faq questions" ON faq_questions;
CREATE POLICY "Anyone can insert faq questions" ON faq_questions FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Users can view own faq questions" ON faq_questions;
CREATE POLICY "Users can view own faq questions" ON faq_questions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage faq questions" ON faq_questions;
CREATE POLICY "Admins can manage faq questions" ON faq_questions FOR ALL USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_faq_questions_user ON faq_questions(user_id);

-- ============================================
-- 14. COUPONS
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percentage')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER,  -- NULL means unlimited usage
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if upgrading existing table
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_usage INTEGER;

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active coupons" ON coupons;
CREATE POLICY "Anyone can read active coupons" ON coupons FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL USING (public.is_admin());

-- Add the missing phone column to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================
-- 15. CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active categories" ON categories;
CREATE POLICY "Anyone can read active categories" ON categories FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Insert defaults if needed
INSERT INTO categories (name, slug, description) VALUES
  ('Cushion', 'cushion', 'Decorative cushions and pillows'),
  ('Frame', 'frame', 'Photo frames and wall art')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 16. EMAIL VERIFICATION OTPs
-- ============================================
CREATE TABLE IF NOT EXISTS email_verification_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE email_verification_otps ENABLE ROW LEVEL SECURITY;

-- OTPs are managed only by the service-role (admin client) in API routes.
-- No user-facing RLS policies needed; the admin client bypasses RLS.
-- This prevents any client-side tampering with OTP records.

CREATE INDEX IF NOT EXISTS idx_otp_email ON email_verification_otps(email);

-- ============================================
-- 17. USER ADDRESSES (Saved Shipping Addresses)
-- ============================================
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own addresses" ON user_addresses;
CREATE POLICY "Users can view own addresses" ON user_addresses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON user_addresses;
CREATE POLICY "Users can insert own addresses" ON user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON user_addresses;
CREATE POLICY "Users can update own addresses" ON user_addresses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON user_addresses;
CREATE POLICY "Users can delete own addresses" ON user_addresses FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all addresses" ON user_addresses;
CREATE POLICY "Admins can manage all addresses" ON user_addresses FOR ALL USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);

-- Migration: Update order_items FKs for proper deletion handling
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_variant_id_fkey;
ALTER TABLE order_items ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

-- ============================================
-- PRODUCT REVIEWS & RATINGS
-- ============================================
CREATE TABLE IF NOT EXISTS product_reviews (
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

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON product_reviews;
CREATE POLICY "Anyone can view approved reviews" ON product_reviews FOR SELECT USING (is_approved = TRUE);

DROP POLICY IF EXISTS "Users can insert own reviews" ON product_reviews;
CREATE POLICY "Users can insert own reviews" ON product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON product_reviews;
CREATE POLICY "Users can update own reviews" ON product_reviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON product_reviews;
CREATE POLICY "Users can delete own reviews" ON product_reviews FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all reviews" ON product_reviews;
CREATE POLICY "Admins can manage all reviews" ON product_reviews FOR ALL USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);

-- ============================================
-- WISHLIST
-- ============================================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlists;
CREATE POLICY "Users can view own wishlist" ON wishlists FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wishlist" ON wishlists;
CREATE POLICY "Users can insert own wishlist" ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own wishlist" ON wishlists;
CREATE POLICY "Users can delete own wishlist" ON wishlists FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all wishlists" ON wishlists;
CREATE POLICY "Admins can manage all wishlists" ON wishlists FOR ALL USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON wishlists(product_id);
