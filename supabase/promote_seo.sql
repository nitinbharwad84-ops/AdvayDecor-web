-- =====================================================================
-- AdvayDecor — PROMOTE USER TO SEO ROLE
-- =====================================================================
-- 
-- INSTRUCTIONS:
-- 1. Make sure you have run "complete_schema.sql" AND "seo_schema.sql" first
-- 2. Go to Supabase Dashboard → Auth → Users
-- 3. Create a new user (or note their email)
-- 4. Replace 'YOUR_SEO_EMAIL@example.com' below with that email
-- 5. Run THIS file in Supabase Dashboard → SQL Editor
-- =====================================================================

-- ⚠️ CHANGE THIS EMAIL to your SEO user's email ⚠️
DO $$
DECLARE
    seo_email TEXT := 'YOUR_SEO_EMAIL@example.com';  -- ← CHANGE THIS
    found_id UUID;
BEGIN
    -- Find the user ID from Supabase Auth
    SELECT id INTO found_id FROM auth.users WHERE email = seo_email;

    IF found_id IS NULL THEN
        RAISE NOTICE '❌ No user found with email: %. Please create the user first in Auth → Users.', seo_email;
    ELSE
        -- Insert into seo_users (or skip if already exists)
        INSERT INTO public.seo_users (id, email, full_name, role)
        VALUES (found_id, seo_email, 'SEO Manager', 'seo')
        ON CONFLICT (id) DO NOTHING;

        RAISE NOTICE '✅ User % (ID: %) has been promoted to SEO role!', seo_email, found_id;
    END IF;
END $$;

-- Verify: Show all SEO users
SELECT id, email, role, created_at FROM public.seo_users;
