-- =====================================================================
-- AdvayDecor — SUPER ADMIN SETUP
-- =====================================================================
-- ⚠️  RUN THIS AFTER:
--   1. Running complete_schema.sql
--   2. Creating the user in Supabase Dashboard:
--      Dashboard → Authentication → Users → Add User
--      Email: adminnitin@gmail.com
--      Password: adminnitin
--      Auto Confirm: ✅ YES
-- =====================================================================

-- Step 1: Insert as PROTECTED super_admin
INSERT INTO public.admin_users (id, email, full_name, role, is_protected)
SELECT id, email, 'Nitin (Owner)', 'super_admin', TRUE
FROM auth.users
WHERE email = 'adminnitin@gmail.com'
ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  is_protected = TRUE,
  full_name = 'Nitin (Owner)';

-- Step 2: Remove any accidental profile row (admins don't belong in profiles)
DELETE FROM public.profiles WHERE email = 'adminnitin@gmail.com';

-- Step 3: Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Step 4: Verify
SELECT
  id,
  email,
  full_name,
  role,
  is_protected,
  '✅ Super Admin created successfully!' AS status
FROM admin_users
WHERE email = 'adminnitin@gmail.com';
