-- ============================================
-- STEP 1: CLEANUP (Run this FIRST)
-- Removes any broken data from previous insert attempts
-- ============================================

-- Remove from admin_users if exists
DELETE FROM public.admin_users WHERE email = 'adminnitin@gmail.com';
DELETE FROM public.admin_users WHERE email = 'admin@gmail.com';

-- Remove broken auth entries from previous raw SQL inserts
DELETE FROM auth.identities WHERE provider_id IN (
  SELECT id::text FROM auth.users WHERE email IN ('adminnitin@gmail.com', 'admin@gmail.com')
);
DELETE FROM auth.users WHERE email = 'adminnitin@gmail.com';
DELETE FROM auth.users WHERE email = 'admin@gmail.com';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Cleanup complete! Now create the user via Dashboard, then run Step 2.' AS status;
