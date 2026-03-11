-- =====================================================================
-- AdvayDecor — SEO DASHBOARD SCHEMA
-- =====================================================================
-- Run this in Supabase SQL Editor AFTER running complete_schema.sql
-- Creates SEO-specific tables, functions, and RLS policies.
-- =====================================================================


-- =====================================================================
-- TABLE 1: SEO_USERS (Separate from admin_users)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.seo_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT DEFAULT 'SEO User',
  role TEXT DEFAULT 'seo' CHECK (role IN ('seo', 'seo_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================================
-- TABLE 2: SEO_PAGE_METADATA (Page-level SEO settings)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.seo_page_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT UNIQUE NOT NULL,        -- e.g. 'home', 'shop', 'story', 'contact'
  title TEXT,
  description TEXT,
  keywords TEXT,                         -- comma-separated keywords
  og_title TEXT,
  og_description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);


-- =====================================================================
-- TABLE 3: SEO_SETTINGS (Global SEO config like tracking IDs)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT
);


-- =====================================================================
-- FUNCTIONS
-- =====================================================================

-- is_seo() — Helper for RLS policies (separate from is_admin)
CREATE OR REPLACE FUNCTION public.is_seo()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.seo_users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION public.handle_seo_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =====================================================================
-- TRIGGERS
-- =====================================================================
DROP TRIGGER IF EXISTS on_seo_metadata_updated ON public.seo_page_metadata;
CREATE TRIGGER on_seo_metadata_updated
  BEFORE UPDATE ON public.seo_page_metadata
  FOR EACH ROW EXECUTE FUNCTION public.handle_seo_metadata_updated_at();


-- =====================================================================
-- INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_seo_page_metadata_page_key ON seo_page_metadata(page_key);
CREATE INDEX IF NOT EXISTS idx_seo_settings_key ON seo_settings(key);


-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

-- Enable RLS
ALTER TABLE public.seo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_page_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- SEO_USERS: SEO users can view their own record
DROP POLICY IF EXISTS "SEO users view own record" ON seo_users;
CREATE POLICY "SEO users view own record" ON seo_users FOR SELECT USING (auth.uid() = id);

-- SEO_USERS: Admins can manage all SEO users
DROP POLICY IF EXISTS "Admins manage seo users" ON seo_users;
CREATE POLICY "Admins manage seo users" ON seo_users FOR ALL USING (public.is_admin());

-- SEO_PAGE_METADATA: SEO users can read and write
DROP POLICY IF EXISTS "SEO users manage metadata" ON seo_page_metadata;
CREATE POLICY "SEO users manage metadata" ON seo_page_metadata FOR ALL USING (public.is_seo());

-- SEO_PAGE_METADATA: Admins can also manage
DROP POLICY IF EXISTS "Admins manage seo metadata" ON seo_page_metadata;
CREATE POLICY "Admins manage seo metadata" ON seo_page_metadata FOR ALL USING (public.is_admin());

-- SEO_PAGE_METADATA: Public can read (needed for layouts to read metadata)
DROP POLICY IF EXISTS "Public read seo metadata" ON seo_page_metadata;
CREATE POLICY "Public read seo metadata" ON seo_page_metadata FOR SELECT USING (true);

-- SEO_SETTINGS: SEO users can read and write
DROP POLICY IF EXISTS "SEO users manage settings" ON seo_settings;
CREATE POLICY "SEO users manage settings" ON seo_settings FOR ALL USING (public.is_seo());

-- SEO_SETTINGS: Admins can also manage
DROP POLICY IF EXISTS "Admins manage seo settings" ON seo_settings;
CREATE POLICY "Admins manage seo settings" ON seo_settings FOR ALL USING (public.is_admin());

-- SEO_SETTINGS: Public can read (needed for tracking script IDs)
DROP POLICY IF EXISTS "Public read seo settings" ON seo_settings;
CREATE POLICY "Public read seo settings" ON seo_settings FOR SELECT USING (true);


-- =====================================================================
-- SEED DATA
-- =====================================================================
INSERT INTO public.seo_page_metadata (page_key, title, description, keywords) VALUES
  ('home', 'AdvayDecor: Premium Home Decor & Cushion Covers Online India', 'Elevate spaces with artisan cushions, linen covers & designer decor. Pan-India shipping directly from our Mumbai studio.', 'home decor online India, cushion covers online India, buy cushions online, premium cushion covers, artisan home accessories, designer cushion covers'),
  ('shop', 'Buy Cushion Covers Online India - AdvayDecor Collection', 'Curated linen, embroidered & bouclé cushions for sofas. Discover premium artistic decor to match your space and your vibe.', 'cushion covers online India, buy cushions online, designer cushion covers, embroidered cushion covers, linen pillow covers India'),
  ('story', 'Our Story & Studio | Handmade Home Decor Mumbai', 'AdvayDecor is a premium home decor brand based in Dahisar East, Mumbai. Contact us for bespoke artisan cushions and accessories.', 'handmade home decor Mumbai, artisan cushions Dahisar, home decor brand Mumbai'),
  ('contact', 'Contact Us | Handmade Home Decor Mumbai - AdvayDecor', 'AdvayDecor is a premium home decor brand based in Dahisar East, Mumbai. Reach out for bespoke artisan cushions and accessories.', 'handmade home decor Mumbai, artisan cushions Dahisar, AdvayDecor contact')
ON CONFLICT (page_key) DO NOTHING;

INSERT INTO public.seo_settings (key, value, description) VALUES
  ('ga4_measurement_id', '', 'Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX)'),
  ('google_tag_id', 'AW-17990232628', 'Google Tag / Ads Conversion ID'),
  ('meta_pixel_id', '', 'Meta (Facebook) Pixel ID'),
  ('google_verification', 'GVNgZZ_0bSD0QJuRyvEBEbGuNuX1xgZ296vLruj4_JY', 'Google Search Console verification meta tag')
ON CONFLICT (key) DO NOTHING;


-- =====================================================================
-- DONE
-- =====================================================================
SELECT '✅ SEO Dashboard schema applied successfully! Now run promote_seo.sql.' AS status;
