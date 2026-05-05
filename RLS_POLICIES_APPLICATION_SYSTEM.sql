-- RLS POLICIES FOR APPLY-TO-PROJECT SYSTEM
-- Copy this entire script into Supabase SQL Editor and execute

-- ============================================
-- 1. PROJECT_ROLES TABLE - RLS POLICIES
-- ============================================
ALTER TABLE project_roles ENABLE ROW LEVEL SECURITY;

-- Project owners can view roles for their projects
CREATE POLICY "Project owners view their project roles"
  ON project_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_roles.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Everyone can view available roles for public/open projects
CREATE POLICY "Everyone view available roles"
  ON project_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_roles.project_id
      -- Projects are public/apply-able when approved.
      -- Keep compatibility for any legacy rows that may use "Open".
      AND projects.status IN ('approved', 'Open')
    )
  );

-- Project owners can create/update roles
CREATE POLICY "Project owners manage roles"
  ON project_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_roles.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners update roles"
  ON project_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_roles.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners delete roles"
  ON project_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_roles.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- ============================================
-- 2. APPLICATIONS TABLE - RLS POLICIES
-- ============================================
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert applications" ON applications;
DROP POLICY IF EXISTS "Users view own applications" ON applications;
DROP POLICY IF EXISTS "Owners view project applications" ON applications;
DROP POLICY IF EXISTS "Owners update applications" ON applications;
DROP POLICY IF EXISTS "Project owners view applications" ON applications;
DROP POLICY IF EXISTS "Users can apply to projects" ON applications;
DROP POLICY IF EXISTS "Users withdraw applications" ON applications;
DROP POLICY IF EXISTS "Project owners update applications" ON applications;

-- INSERT
CREATE POLICY "Users can insert applications"
  ON applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- SELECT (user)
CREATE POLICY "Users view own applications"
  ON applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- SELECT (project owner)
CREATE POLICY "Owners view project applications"
  ON applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = applications.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- UPDATE (owner approval)
CREATE POLICY "Owners update applications"
  ON applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = applications.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- ============================================
-- 3. PROJECT_MEMBERS TABLE - RLS POLICIES
-- ============================================
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Everyone can view project members
CREATE POLICY "Everyone view project members"
  ON project_members FOR SELECT
  USING (true);

-- Project owners can manage members (added via approval)
CREATE POLICY "Project owners manage members"
  ON project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners update members"
  ON project_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners remove members"
  ON project_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- ============================================
-- 4. VERIFY POLICIES
-- ============================================
-- Run this to verify all policies are in place:
/*
SELECT schemaname, tablename, policyname, permissive, qual
FROM pg_policies
WHERE tablename IN ('project_roles', 'applications', 'project_members')
ORDER BY tablename, policyname;
*/
