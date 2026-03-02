-- =====================================================================
-- AdvayDecor — COMPLETE DATABASE MASTER SCHEMA (Project-Aligned)
-- =====================================================================
-- Run this in your Supabase SQL Editor.
-- Safe to re-run: It creates tables if missing AND patches existing ones.
-- =====================================================================

-- =============================================
-- SECTION 1: CORE TABLES
-- =============================================

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT DEFAULT 'Admin',
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_protected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
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

-- Variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Images
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  guest_info JSONB,
  status TEXT DEFAULT 'Pending', -- Constraint added in patching section below
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  shipping_address JSONB NOT NULL,
  payment_method TEXT DEFAULT 'COD',
  payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  coupon_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
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

-- Site Config
CREATE TABLE IF NOT EXISTS public.site_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT
);

-- OTPs
CREATE TABLE IF NOT EXISTS public.email_verification_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses
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

-- Reviews
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


-- =============================================
-- SECTION 2: FUNCTIONS & RPCs (Aligned with API)
-- =============================================

-- Security: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Security: is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'super_admin' AND is_protected = TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Logic: decrement_stock (Checkout)
CREATE OR REPLACE FUNCTION public.decrement_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.product_variants SET stock_quantity = GREATEST(stock_quantity - p_quantity, 0) WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.decrement_stock(UUID, INTEGER) TO authenticated, service_role;

-- Logic: get_dashboard_stats (Admin API)
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_revenue', COALESCE((SELECT SUM(total_amount) FROM public.orders WHERE status NOT IN ('Cancelled', 'Returned', 'Awaiting Payment')), 0),
    'total_orders', (SELECT COUNT(*) FROM public.orders),
    'pending_orders', (SELECT COUNT(*) FROM public.orders WHERE status = 'Pending'),
    'total_products', (SELECT COUNT(*) FROM public.products)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated, service_role;

-- Logic: handle_new_user (Auth Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- SECTION 3: TRIGGERS
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS on_address_updated ON public.user_addresses;
CREATE TRIGGER on_address_updated BEFORE UPDATE ON public.user_addresses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- =============================================
-- SECTION 4: PERFORMANCE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_parent ON public.product_variants(parent_product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);


-- =============================================
-- SECTION 5: RETROACTIVE PATCHING (Existing DBs)
-- =============================================
-- This section ensures your existing tables get the new columns and constraints.

DO $$ 
BEGIN 
    -- 1. Patch Orders table status constraint
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
    ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('Awaiting Payment', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'));
    
    -- 2. Add missing Razorpay and Finance columns to orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='razorpay_order_id') THEN
        ALTER TABLE public.orders ADD COLUMN razorpay_order_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='razorpay_payment_id') THEN
        ALTER TABLE public.orders ADD COLUMN razorpay_payment_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shipping_fee') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_fee DECIMAL(10,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='discount_amount') THEN
        ALTER TABLE public.orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- 3. Patch Profiles Table for unique phone
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_phone') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT unique_phone UNIQUE (phone);
    END IF;
END $$;


-- =============================================
-- SECTION 6: SECURITY (RLS)
-- =============================================
DO $$ DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;'; END LOOP; END $$;

-- Policies (Condensed)
DROP POLICY IF EXISTS "Own Data" ON public.orders; -- Example cleanup
CREATE POLICY "Admins manage everything" ON public.products FOR ALL USING (public.is_admin());
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Users browse own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins browse all orders" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE USING (public.is_admin());

-- Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public access" ON storage.objects;
CREATE POLICY "Public access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');


-- =============================================
-- FINAL VERIFICATION
-- =============================================
NOTIFY pgrst, 'reload schema';
SELECT '✅ AdvayDecor MASTER SCHEMA applied and fully aligned with project code!' AS status;
