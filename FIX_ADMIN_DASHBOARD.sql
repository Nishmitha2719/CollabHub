-- ============================================
-- QUICK FIX: Admin Dashboard Not Loading
-- ============================================
-- Run this in Supabase SQL Editor if:
-- 1. Admin dashboard shows loading forever
-- 2. You get "Access Denied" error
-- 3. You see errors in browser console about permissions
-- ============================================

-- ============================================
-- STEP 1: Make sure user is admin
-- ============================================
-- First, check if any admin exists:
SELECT id, email, role FROM profiles WHERE role = 'admin' LIMIT 5;

-- If no admin exists, you need to make one:
-- 1. Get a user ID: SELECT id, email FROM auth.users LIMIT 1;
-- 2. Update their role: UPDATE profiles SET role = 'admin' WHERE id = '<uuid>';

-- ============================================
-- STEP 2: Drop and recreate admin policies
-- ============================================

-- Drop any existing admin-related policies
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can update project status" ON projects;
DROP POLICY IF EXISTS "Admins can update any project" ON projects;
DROP POLICY IF EXISTS "Admins can delete any project" ON projects;

-- ============================================
-- STEP 3: Create admin policies (MUST BE FIRST)
-- ============================================

-- Admin can view ALL projects (pending, approved, rejected)
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update ANY project (to change status)
CREATE POLICY "Admins can update any project"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can delete ANY project
CREATE POLICY "Admins can delete any project"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- STEP 4: Ensure regular user policies exist
-- ============================================

-- Drop old user policies to recreate
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view approved projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Users can SELECT their own projects + approved projects
CREATE POLICY "Users can view own and approved projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = owner_id OR status = 'approved'
  );

-- Users can INSERT their own projects
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can UPDATE their own projects
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Users can DELETE their own projects
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- STEP 5: Verify all policies are created
-- ============================================

SELECT 
  policyname,
  permissive,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'projects'
ORDER BY policyname;

-- Expected output (should have 7 policies):
-- 1. Admins can view all projects (SELECT)
-- 2. Admins can update any project (UPDATE)
-- 3. Admins can delete any project (DELETE)
-- 4. Users can insert own projects (INSERT)
-- 5. Users can update own projects (UPDATE)
-- 6. Users can delete own projects (DELETE)
-- 7. Users can view own and approved projects (SELECT)

-- ============================================
-- STEP 6: Verify admin users exist
-- ============================================

SELECT COUNT(*) as admin_count FROM profiles WHERE role = 'admin';
-- Should show at least 1

-- ============================================
-- STEP 7: Test that pending projects are readable
-- ============================================

SELECT id, title, status, owner_id FROM projects WHERE status = 'pending' LIMIT 5;

-- If this query returns no rows:
-- - Either no pending projects exist (insert a test one)
-- - Or RLS is still blocking (check policies again)

-- ============================================
-- STEP 8: Restart your Next.js dev server
-- ============================================
-- After running this SQL, restart:
-- npm run dev
--
-- Then try accessing admin dashboard again

-- ============================================
-- If dashboard STILL doesn't load:
-- ============================================

-- 1. Open browser DevTools → Console
-- 2. Look for specific errors
-- 3. Run ADMIN_DASHBOARD_DEBUG.sql to diagnose
-- 4. Check if:
--    a) No admin user exists → make one admin
--    b) No pending projects exist → submit one first
--    c) RLS policies missing → come back here
--    d) Wrong RLS conditions → check policies above
