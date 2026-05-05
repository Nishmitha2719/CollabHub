-- COMPLETE RLS FIX FOR PROJECT APPROVAL SYSTEM
-- This replaces the previous partial fix with a complete solution

-- ============================================
-- STEP 1: Drop ALL existing policies on projects table
-- ============================================
DROP POLICY IF EXISTS "Approved projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;

-- ============================================
-- STEP 2: CREATE NEW POLICIES FOR SELECT (Read)
-- ============================================

-- 2.1: Admins can view ALL projects (pending, approved, rejected)
CREATE POLICY "Admins can view all projects" 
  ON projects FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 2.2: Everyone can view approved projects
CREATE POLICY "Approved projects viewable by everyone" 
  ON projects FOR SELECT 
  USING (status = 'approved');

-- 2.3: Users can view their own projects (including pending/rejected)
CREATE POLICY "Users can view own projects" 
  ON projects FOR SELECT 
  USING (owner_id = auth.uid());

-- ============================================
-- STEP 3: CREATE POLICIES FOR INSERT (Create)
-- ============================================

CREATE POLICY "Authenticated users can insert projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

-- ============================================
-- STEP 4: CREATE POLICIES FOR UPDATE
-- ============================================

-- 4.1: Users can update their own projects
CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = owner_id);

-- 4.2: ADMINS CAN UPDATE ANY PROJECT (for approval/rejection)
CREATE POLICY "Admins can update any project" 
  ON projects FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- STEP 5: CREATE POLICIES FOR DELETE
-- ============================================

-- 5.1: Users can delete their own projects
CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = owner_id);

-- 5.2: Admins can delete any project
CREATE POLICY "Admins can delete any project" 
  ON projects FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- STEP 6: Verify the policies are in place
-- ============================================
-- You can run this query to verify all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'projects'
-- ORDER BY policyname;
