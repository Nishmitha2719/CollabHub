-- ============================================
-- FIX: Failed to Load Projects Error
-- ============================================
-- This script fixes the query error in admin dashboard
-- Error: "Failed to load projects"
-- ============================================

-- ============================================
-- STEP 1: Check if projects table has owner_id column
-- ============================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
  AND column_name IN ('owner_id', 'id', 'title', 'status')
ORDER BY ordinal_position;

-- ============================================
-- STEP 2: Check if foreign key exists
-- ============================================
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
FROM information_schema.key_column_usage
WHERE table_name = 'projects' AND column_name = 'owner_id';

-- ============================================
-- STEP 3: Drop and recreate foreign key if needed
-- ============================================

-- Check if FK already exists
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'projects' AND constraint_type = 'FOREIGN KEY';

-- If no FK exists, create it:
ALTER TABLE projects
ADD CONSTRAINT fk_projects_owner_id
FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ============================================
-- STEP 4: Verify all required columns exist in profiles
-- ============================================
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('id', 'name', 'email', 'role')
ORDER BY column_name;

-- ============================================
-- STEP 5: Test simple query (no joins)
-- ============================================
SELECT id, title, status, owner_id
FROM projects
WHERE status = 'pending'
LIMIT 5;

-- ============================================
-- STEP 6: Test query with profile joins
-- ============================================
SELECT 
  p.id,
  p.title,
  p.status,
  p.owner_id,
  pr.name,
  pr.email,
  pr.role
FROM projects p
LEFT JOIN profiles pr ON p.owner_id = pr.id
WHERE p.status = 'pending'
LIMIT 5;

-- ============================================
-- STEP 7: Verify RLS policies allow admin access
-- ============================================
SELECT policyname, qual, with_check, permissive
FROM pg_policies
WHERE tablename = 'projects'
  AND policyname LIKE 'Admin%'
ORDER BY policyname;

-- Expected: Should see admin view policy

-- ============================================
-- If no admin view policy, create it:
-- ============================================
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;

CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- STEP 8: Check project_skills table
-- ============================================
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'project_skills'
ORDER BY column_name;

-- ============================================
-- STEP 9: Verify skills table exists
-- ============================================
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'skills'
ORDER BY column_name;

-- ============================================
-- FINAL CHECK: Run the exact dashboard query
-- ============================================
SELECT 
  p.id,
  p.title,
  p.description,
  p.category,
  p.status,
  p.owner_id,
  p.created_at,
  pr.name as owner_name,
  pr.email as owner_email
FROM projects p
LEFT JOIN profiles pr ON p.owner_id = pr.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC
LIMIT 200;

-- ============================================
-- If this query works above, the issue is in:
-- - Project skills JOIN
-- - OR Supabase PostgREST syntax
-- ============================================
