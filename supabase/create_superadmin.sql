-- ============================================
-- STEP 2: PROMOTE TO SUPERADMIN (Run AFTER Dashboard user creation)
-- ============================================
-- Before running this:
--   1. Run cleanup_admin.sql first
--   2. Go to Dashboard > Authentication > Users > Add User
--      Email: admin@gmail.com | Password: adminnitin | Auto Confirm: Yes
--   3. Then run this SQL
-- ============================================

INSERT INTO public.admin_users (id, email, full_name, role)
SELECT id, email, 'Super Admin', 'admin'
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT id, email, role FROM admin_users WHERE email = 'admin@gmail.com';
