-- ============================================
-- PROJECT WORKFLOW FIXES - RLS & PERMISSIONS
-- ============================================
-- Run this in Supabase SQL Editor to fix the entire workflow
-- ============================================

-- ============================================
-- STEP 1: DROP EXISTING CONFLICTING POLICIES
-- ============================================

DROP POLICY IF EXISTS "Approved projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can update any project" ON projects;
DROP POLICY IF EXISTS "Admins can delete any project" ON projects;

-- ============================================
-- STEP 2: RECREATE CORE RLS POLICIES
-- ============================================

-- POLICY 1: Users can see approved projects OR their own projects
CREATE POLICY "Approved projects visible to everyone"
  ON projects FOR SELECT
  USING (
    status = 'approved' OR owner_id = auth.uid()
  );

-- POLICY 2: Admins can see ALL projects (pending, approved, rejected)
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLICY 3: Authenticated users can INSERT their own projects
CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- POLICY 4: Users can UPDATE their own projects
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- POLICY 5: Users can DELETE their own projects
CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);

-- POLICY 6: ADMINS CAN UPDATE ANY PROJECT (e.g., to approve/reject)
CREATE POLICY "Admins can update project status"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLICY 7: ADMINS CAN DELETE ANY PROJECT
CREATE POLICY "Admins can delete any project"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- STEP 3: VERIFY RLS IS ENABLED
-- ============================================

-- Run this query to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename = 'projects';
-- Expected: true

-- ============================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_owner_status ON projects(owner_id, status);

-- ============================================
-- STEP 5: VERIFY POLICIES EXIST
-- ============================================

-- Check if all policies are in place:
SELECT 
  policyname,
  cmd as operation,
  SUBSTRING(qual FOR 100) as "SELECT condition"
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'projects'
ORDER BY policyname;

-- Expected output: 7 policies
-- - Approved projects visible to everyone (SELECT)
-- - Admins can delete any project (DELETE)
-- - Admins can update project status (UPDATE)
-- - Admins can view all projects (SELECT)
-- - Authenticated users can create projects (INSERT)
-- - Users can delete their own projects (DELETE)
-- - Users can update their own projects (UPDATE)

-- ============================================
-- STEP 6: CHECK TABLE STRUCTURE
-- ============================================

-- Verify projects table has correct columns:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid) - not null
-- title (text) - not null
-- description (text) - not null
-- detailed_description (text) - nullable
-- category (text) - not null
-- difficulty (text)
-- duration (text)
-- team_size (integer)
-- is_paid (boolean)
-- budget (text)
-- deadline (date)
-- owner_id (uuid) - not null, references profiles(id)
-- status (text) - check constraint: pending, approved, rejected
-- created_at (timestamp with time zone)
-- updated_at (timestamp with time zone)

-- ============================================
-- STEP 7: TEST PERMISSIONS
-- ============================================

-- Note: These queries show the structure but actual execution requires proper auth context

-- Test 1: Regular user should see only approved OR their own projects
-- SELECT id, title, status FROM projects WHERE status = 'approved' OR owner_id = auth.uid();

-- Test 2: Admin should see ALL projects
-- SELECT id, title, status FROM projects;

-- Test 3: Admin should be able to update status
-- UPDATE projects SET status = 'approved' WHERE id = '...';

-- ============================================
-- STEP 8: DIAGNOSTIC QUERIES
-- ============================================

-- Check if any projects exist
SELECT COUNT(*) as total_projects FROM projects;

-- Count by status
SELECT status, COUNT(*) FROM projects GROUP BY status;

-- Check admin users
SELECT id, email, role FROM profiles WHERE role = 'admin';

-- Check latest projects
SELECT id, title, owner_id, status, created_at 
FROM projects 
ORDER BY created_at DESC 
LIMIT 10;

-- Check profile-project relationship
SELECT 
  p.id,
  p.title,
  p.status,
  pr.email as owner_email,
  pr.role as owner_role
FROM projects p
LEFT JOIN profiles pr ON p.owner_id = pr.id
ORDER BY p.created_at DESC
LIMIT 10;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If admin still can't see projects:
-- 1. Run: SELECT * FROM profiles WHERE id = '<user-id>';
-- 2. Verify role = 'admin'
-- 3. Run: SELECT * FROM pg_policies WHERE tablename = 'projects';
-- 4. Verify admin policies exist

-- If UPDATE fails:
-- 1. Check if admin policy exists for UPDATE
-- 2. Check if user is actually admin
-- 3. Check if project owner_id is valid UUID

-- If INSERT fails:
-- 1. Check if owner_id matches auth.uid()
-- 2. Check if required fields are present
-- 3. Verify RLS policy allows INSERT

-- ============================================
-- NOTES
-- ============================================

-- Priority Order of RLS Policies:
-- 1. Admins see ALL projects (via admin check)
-- 2. Regular users see approved + own projects
-- 3. Only owner/admin can UPDATE own/any projects
-- 4. Only owner/admin can DELETE own/any projects

-- Policy Evaluation (PostgreSQL stops at first match):
-- When user queries projects, RLS evaluates policies in order:
-- 1. "Admins can view all projects" - if admin, ALLOW
-- 2. "Approved projects visible to everyone" - if approved OR owner, ALLOW
-- If neither matches, DENY

-- Key: Admin policy comes FIRST so admins always see what they need

-- ============================================
