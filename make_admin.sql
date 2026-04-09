-- ============================================
-- MAKE USER ADMIN
-- ============================================
-- This script updates the user role to 'admin' in the profiles table
-- User ID: 748123c8-b4ca-4e75-9db1-2919ff794751
-- Email: nnm24ad044@nmamit.in
-- ============================================

-- Update the user's role to admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = '748123c8-b4ca-4e75-9db1-2919ff794751'::uuid;

-- Verify the update
SELECT id, name, email, role, created_at 
FROM profiles 
WHERE id = '748123c8-b4ca-4e75-9db1-2919ff794751'::uuid;

-- Alternative: Update by email (if the profile exists)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'nnm24ad044@nmamit.in';

-- Verify by email
SELECT id, name, email, role, created_at 
FROM profiles 
WHERE email = 'nnm24ad044@nmamit.in';

-- ============================================
-- If profile doesn't exist yet, create it:
-- ============================================
-- Note: Run this only if the user has signed up via Supabase Auth
-- but their profile hasn't been created yet

INSERT INTO profiles (id, email, role, name)
VALUES (
  '748123c8-b4ca-4e75-9db1-2919ff794751'::uuid,
  'nnm24ad044@nmamit.in',
  'admin',
  'Admin User'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- Final verification
SELECT id, name, email, role, created_at 
FROM profiles 
WHERE id = '748123c8-b4ca-4e75-9db1-2919ff794751'::uuid 
   OR email = 'nnm24ad044@nmamit.in';
