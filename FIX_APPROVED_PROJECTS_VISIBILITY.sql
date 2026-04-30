-- ============================================
-- FIX: Approved Projects Not Visible
-- ============================================
-- This fixes the RLS policies to allow:
-- 1. Public/unauthenticated users to see approved projects
-- 2. Authenticated users to see approved + their own projects
-- ============================================

-- ============================================
-- STEP 1: Drop all existing projects RLS policies
-- ============================================
DROP POLICY IF EXISTS "Approved projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view own and approved projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view approved projects" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can update any project" ON projects;
DROP POLICY IF EXISTS "Admins can delete any project" ON projects;

-- ============================================
-- STEP 2: Recreate policies in correct order
-- ============================================

-- ======== ADMIN POLICIES (must be first) ========

-- Admin can view ALL projects (pending, approved, rejected)
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update ANY project
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

-- ======== PUBLIC POLICIES (second) ========

-- Everyone can view approved projects (no auth required!)
CREATE POLICY "Anyone can view approved projects"
  ON projects FOR SELECT
  USING (status = 'approved');

-- ======== AUTHENTICATED USER POLICIES (last) ========

-- Authenticated users can view approved + their own
CREATE POLICY "Users can view own and approved projects"
  ON projects FOR SELECT
  USING (
    status = 'approved' 
    OR auth.uid() = owner_id
  );

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- STEP 3: Verify policies are correct
-- ============================================

SELECT 
  policyname,
  permissive,
  cmd as operation,
  qual as using_clause
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'projects'
ORDER BY policyname;

-- Expected: 8 policies total
-- - 3 admin policies (view all, update any, delete any)
-- - 5 user/public policies

-- ============================================
-- STEP 4: Test - Verify approved projects are visible
-- ============================================

-- Check if approved projects exist:
SELECT id, title, status FROM projects WHERE status = 'approved' LIMIT 5;

-- Check if any projects exist at all:
SELECT id, title, status, COUNT(*) OVER () as total FROM projects LIMIT 5;

-- ============================================
-- NOTES:
-- ============================================
-- The key fix: "Anyone can view approved projects" policy
-- This allows unauthenticated users to see approved projects
-- without needing auth.uid() to be set
--
-- RLS Policy Evaluation Order:
-- 1. Admin policies checked first (most permissive)
-- 2. Public policy allows approved projects
-- 3. User policies for their own + approved
--
-- Result: Everyone sees approved projects!
