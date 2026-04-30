-- ============================================
-- PROJECT WORKFLOW VERIFICATION
-- ============================================
-- Run these queries to verify fixes are in place
-- ============================================

-- ============================================
-- VERIFICATION 1: Check RLS Policies
-- ============================================

SELECT 
  policyname,
  cmd as operation,
  SUBSTRING(qual FOR 100) as "condition"
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'projects'
ORDER BY policyname;

-- Expected: 7 policies
-- - Admins can delete any project (DELETE)
-- - Admins can update project status (UPDATE)
-- - Admins can view all projects (SELECT)
-- - Approved projects visible to everyone (SELECT)
-- - Authenticated users can create projects (INSERT)
-- - Users can delete their own projects (DELETE)
-- - Users can update their own projects (UPDATE)

-- ============================================
-- VERIFICATION 2: Check Indexes
-- ============================================

SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'projects'
ORDER BY indexname;

-- Expected: at least 5 indexes including
-- - idx_projects_status
-- - idx_projects_owner_id
-- - idx_projects_created_at
-- - idx_projects_owner_status

-- ============================================
-- VERIFICATION 3: Check RLS Enabled
-- ============================================

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('projects', 'profiles');

-- Expected: both should show rowsecurity = true

-- ============================================
-- VERIFICATION 4: Check Projects Table Structure
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid, not null)
-- title (text, not null)
-- description (text, not null)
-- detailed_description (text, nullable)
-- category (text, not null)
-- difficulty (text)
-- duration (text)
-- team_size (integer)
-- is_paid (boolean)
-- budget (text)
-- deadline (date)
-- owner_id (uuid, not null)
-- status (text, not null, default='pending')
-- created_at (timestamp with time zone)
-- updated_at (timestamp with time zone)

-- ============================================
-- VERIFICATION 5: Check Admin Users
-- ============================================

SELECT 
  id,
  email,
  name,
  role
FROM profiles
WHERE role = 'admin';

-- Expected: at least one admin user
-- Copy the admin id for testing below

-- ============================================
-- VERIFICATION 6: Check Projects by Status
-- ============================================

SELECT 
  status,
  COUNT(*) as count
FROM projects
GROUP BY status
ORDER BY status;

-- Shows distribution of project statuses

-- ============================================
-- VERIFICATION 7: Check Constraints
-- ============================================

SELECT 
  constraint_name,
  constraint_type,
  check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' AND tc.table_name = 'projects';

-- Expected: status check constraint
-- - status IN ('pending', 'approved', 'rejected')

-- ============================================
-- VERIFICATION 8: Sample Test Query
-- ============================================

-- This query shows all projects with their owner info
SELECT 
  p.id,
  p.title,
  p.status,
  p.owner_id,
  pr.email as owner_email,
  pr.role as owner_role,
  p.created_at
FROM projects p
LEFT JOIN profiles pr ON p.owner_id = pr.id
ORDER BY p.created_at DESC
LIMIT 20;

-- This helps verify:
-- - Projects have valid owner_ids
-- - Owners are in profiles table
-- - Status values are correct
-- - Timestamps are reasonable

-- ============================================
-- VERIFICATION 9: Check Foreign Keys
-- ============================================

SELECT 
  constraint_name,
  table_name,
  column_name,
  foreign_table_name,
  foreign_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public' AND table_name = 'projects'
  AND foreign_table_name IS NOT NULL;

-- Expected: owner_id references profiles(id)

-- ============================================
-- VERIFICATION 10: Full Health Check
-- ============================================

-- Run this comprehensive check:

DO $$
DECLARE
  policy_count INT;
  index_count INT;
  projects_count INT;
  admin_count INT;
  status_pending INT;
  status_approved INT;
  status_rejected INT;
BEGIN
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'projects';
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'projects'
    AND indexname LIKE 'idx_projects%';
  
  -- Count projects
  SELECT COUNT(*) INTO projects_count FROM projects;
  
  -- Count admins
  SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
  
  -- Count by status
  SELECT COUNT(*) INTO status_pending FROM projects WHERE status = 'pending';
  SELECT COUNT(*) INTO status_approved FROM projects WHERE status = 'approved';
  SELECT COUNT(*) INTO status_rejected FROM projects WHERE status = 'rejected';
  
  -- Output results
  RAISE NOTICE '=== PROJECT WORKFLOW HEALTH CHECK ===';
  RAISE NOTICE 'RLS Policies: % (expected: 7)', policy_count;
  RAISE NOTICE 'Indexes: % (expected: 4+)', index_count;
  RAISE NOTICE 'Total Projects: %', projects_count;
  RAISE NOTICE 'Admin Users: %', admin_count;
  RAISE NOTICE 'Pending: %, Approved: %, Rejected: %', status_pending, status_approved, status_rejected;
  
  -- Status checks
  IF policy_count < 7 THEN
    RAISE WARNING 'WARNING: Not all RLS policies found! Run FIX_PROJECT_WORKFLOW.sql';
  END IF;
  
  IF admin_count = 0 THEN
    RAISE WARNING 'WARNING: No admin users found! Create an admin user for testing.';
  END IF;
  
  IF policy_count >= 7 AND admin_count > 0 THEN
    RAISE NOTICE '✓ PROJECT WORKFLOW SETUP COMPLETE!';
  END IF;
END $$;

-- ============================================
-- MANUAL VERIFICATION STEPS
-- ============================================

-- 1. Copy an admin user ID from verification 5
-- 2. Test admin can see pending projects:
--    SELECT id, title, status FROM projects WHERE status = 'pending';
--
-- 3. Test regular user can only see own or approved:
--    SELECT id, title, status FROM projects 
--    WHERE status = 'approved' OR owner_id = auth.uid();
--
-- 4. Test admin can update project status:
--    UPDATE projects SET status = 'approved' 
--    WHERE id = '<project-id>' AND status = 'pending';
--
-- 5. Verify update succeeded:
--    SELECT id, title, status FROM projects 
--    WHERE id = '<project-id>';

-- ============================================
-- TROUBLESHOOTING QUERIES
-- ============================================

-- If no pending projects show for admin:
-- 1. Check if projects exist at all:
SELECT COUNT(*) FROM projects;

-- 2. Check if there are pending projects:
SELECT COUNT(*) FROM projects WHERE status = 'pending';

-- 3. Check admin user details:
SELECT * FROM profiles WHERE id = '<admin-id>';

-- 4. Check RLS policy for admin:
SELECT * FROM pg_policies 
WHERE tablename = 'projects' AND policyname LIKE 'Admins%';

-- 5. Manually test admin query (need proper auth context):
-- SELECT * FROM projects WHERE status = 'pending' LIMIT 10;

-- ============================================
