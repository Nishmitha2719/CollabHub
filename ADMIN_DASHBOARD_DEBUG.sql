-- ============================================
-- ADMIN DASHBOARD DEBUGGING SCRIPT
-- ============================================
-- Run this in Supabase SQL Editor to diagnose
-- why admin dashboard won't load
-- ============================================

-- ============================================
-- 1. CHECK: Do admin RLS policies exist?
-- ============================================
SELECT 
  policyname,
  qual as condition,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'projects'
ORDER BY policyname;

-- Expected: Should see policies like:
-- - "Admins can view all projects"
-- - "Admins can update project status"
-- - "Admins can delete any project"

-- ============================================
-- 2. CHECK: Is admin user actually admin?
-- ============================================
-- Run this after getting your user ID from auth.users
-- Replace 'YOUR_USER_ID' with actual UUID
SELECT id, role, email FROM profiles WHERE role = 'admin' LIMIT 5;

-- ============================================
-- 3. CHECK: Are there any pending projects?
-- ============================================
SELECT id, title, status, owner_id, created_at 
FROM projects 
WHERE status = 'pending'
LIMIT 10;

-- ============================================
-- 4. CHECK: Can we query projects at all?
-- ============================================
SELECT id, title, status FROM projects LIMIT 5;

-- ============================================
-- 5. CHECK: Is RLS enabled on projects?
-- ============================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'projects' AND schemaname = 'public';

-- Expected: rowsecurity should be true

-- ============================================
-- 6. CHECK: What's the projects table structure?
-- ============================================
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- ============================================
-- 7. CHECK: Constraint on status column
-- ============================================
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'projects' AND constraint_type = 'CHECK';

-- ============================================
-- COMMON ISSUES & FIXES
-- ============================================

-- Issue 1: Admin policies don't exist
-- Fix: Run FIX_PROJECT_WORKFLOW.sql

-- Issue 2: No pending projects exist
-- Test by inserting a pending project:
-- (Replace owner_id with a real admin UUID)
-- INSERT INTO projects (title, description, category, owner_id, status)
-- VALUES ('Test Project', 'Test Description', 'Web Dev', '<admin-uuid>', 'pending');

-- Issue 3: RLS policies prevent admin access
-- Check all policies on projects table (above)
-- If admin policies missing, run:
-- CREATE POLICY "Admins can view all projects" ON projects FOR SELECT
--   USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Issue 4: User trying to access admin is not actually admin
-- Check: SELECT role FROM profiles WHERE id = '<user-id>';
-- If role != 'admin', update it:
-- UPDATE profiles SET role = 'admin' WHERE id = '<user-id>';

-- ============================================
-- QUICK TEST: Set a user as admin
-- ============================================
-- Get a user ID from auth.users:
-- SELECT id, email FROM auth.users LIMIT 1;
--
-- Then make them admin:
-- UPDATE profiles SET role = 'admin' WHERE id = '<their-uuid>';
--
-- Verify:
-- SELECT id, role FROM profiles WHERE id = '<their-uuid>';

-- ============================================
-- If dashboard still doesn't load:
-- ============================================
-- 1. Open browser DevTools → Console
-- 2. Look for error messages
-- 3. Check if it says "permission denied" or "RLS"
-- 4. If RLS error, come back here and verify admin policies exist
