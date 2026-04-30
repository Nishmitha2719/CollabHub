-- ============================================
-- SUPABASE VERIFICATION SCRIPT
-- ============================================
-- Run this in Supabase SQL Editor to verify auth setup
-- Copy each section and run individually to see results
-- ============================================

-- ============================================
-- 1. CHECK: RLS POLICIES ON PROFILES
-- ============================================
-- Should show at least 3 policies:
-- - Profiles are viewable by everyone (SELECT)
-- - Users can create their own profile (INSERT)
-- - Users can update their own profile (UPDATE)

SELECT 
  policyname,
  cmd as operation,
  qual as "SELECT condition",
  with_check as "INSERT/UPDATE condition"
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- Expected output: 3 rows with correct policies

-- ============================================
-- 2. CHECK: RLS ENABLED ON TABLES
-- ============================================
-- Should show 'true' for both profiles and projects

SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('profiles', 'projects')
ORDER BY tablename;

-- Expected output: t for both

-- ============================================
-- 3. CHECK: PROFILES TABLE STRUCTURE
-- ============================================
-- Should show id, email, name, role columns

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Expected output: id (uuid), email (text), name (text), role (text), etc.

-- ============================================
-- 4. CHECK: AUTO-PROFILE TRIGGER EXISTS
-- ============================================
-- Should show 'on_auth_user_created' trigger

SELECT 
  trigger_name,
  event_object_schema,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' AND trigger_name = 'on_auth_user_created';

-- Expected output: 1 row with trigger details

-- ============================================
-- 5. CHECK: EXISTING USERS AND PROFILES
-- ============================================
-- Count of users in auth system and profiles table
-- These numbers should match after auth is working

SELECT 
  'auth.users' as table_name,
  COUNT(*) as record_count
FROM auth.users

UNION ALL

SELECT 
  'profiles' as table_name,
  COUNT(*) as record_count
FROM profiles;

-- Expected output: 2 rows, counts should be equal (or profiles might be behind)

-- ============================================
-- 6. CHECK: SAMPLE TEST - PERMISSIONS
-- ============================================
-- This tests if RLS is working correctly
-- (Note: This checks policies, not actual auth)

SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Expected: Multiple rows showing:
-- - "Profiles are viewable by everyone" with USING: true
-- - "Users can create their own profile" with WITH CHECK: (auth.uid() = id)
-- - "Users can update their own profile" with USING: (auth.uid() = id)

-- ============================================
-- 7. DETAILED PROFILES TABLE INFO
-- ============================================

\d+ profiles

-- Shows: columns, types, constraints, indexes, policies, etc.

-- ============================================
-- DEBUGGING COMMANDS (if issues found)
-- ============================================

-- If profiles table doesn't exist:
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  bio TEXT,
  avatar_url TEXT,
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- If RLS policies are missing, recreate them:
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================
-- FINAL VERIFICATION
-- ============================================
-- Run this if everything above looks good:

-- Check that trigger function exists:
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- Check trigger is active:
SELECT 
  t.trigger_name,
  t.action_statement,
  t.action_orientation,
  t.action_timing,
  t.event_manipulation
FROM information_schema.triggers t
WHERE trigger_name = 'on_auth_user_created';

-- Check a recent profile (if any exist):
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- IF ALL ABOVE PASS ✅
-- ============================================
-- Auth should be working!
-- 
-- Test by:
-- 1. Go to app: http://localhost:3000/auth/signup
-- 2. Sign up with new email
-- 3. Check this table for new profile:
--    SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
-- 4. Should see your new profile!

-- ============================================
