-- =====================================================================
-- AdvayDecor — PROMOTE USER TO SUPER ADMIN
-- =====================================================================
-- 
-- INSTRUCTIONS:
-- 1. Create a new Supabase project
-- 2. Run the "complete_schema.sql" FIRST to set up all tables
-- 3. Go to Supabase Dashboard → Auth → Users
-- 4. Create a user (or note their email)
-- 5. Replace 'YOUR_EMAIL@example.com' below with that email
-- 6. Run THIS file in Supabase Dashboard → SQL Editor
-- =====================================================================

-- ⚠️ CHANGE THIS EMAIL to your admin account email ⚠️
DO $$
DECLARE
    admin_email TEXT := 'YOUR_EMAIL@example.com';  -- ← CHANGE THIS
    found_id UUID;
BEGIN
    -- Find the user ID from Supabase Auth
    SELECT id INTO found_id FROM auth.users WHERE email = admin_email;

    IF found_id IS NULL THEN
        RAISE NOTICE '❌ No user found with email: %. Please create the user first in Auth → Users.', admin_email;
    ELSE
        -- Insert into admin_users (or skip if already exists)
        INSERT INTO public.admin_users (id, email, full_name, role, is_protected)
        VALUES (found_id, admin_email, 'Super Admin', 'super_admin', TRUE)
        ON CONFLICT (id) DO NOTHING;

        RAISE NOTICE '✅ User % (ID: %) has been promoted to super_admin!', admin_email, found_id;
    END IF;
END $$;

-- Verify: Show all admin users
SELECT id, email, role, is_protected FROM public.admin_users;
