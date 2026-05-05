-- ============================================
-- FIX: APPLY-TO-PROJECT SYSTEM SCHEMA
-- ============================================
-- This script fixes the schema to match the code expectations
-- Run this in your Supabase SQL Editor AFTER the main schema

-- 1. ALTER applications TABLE - Add missing fields
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS role_id UUID,
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- 2. CREATE project_roles TABLE - New table for role tracking
CREATE TABLE IF NOT EXISTS project_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  role_name TEXT NOT NULL,
  description TEXT,
  positions_available INTEGER DEFAULT 1,
  positions_filled INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, role_name)
);

-- 3. UPDATE applications status CHECK constraint to include 'withdrawn'
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn'));

-- 4. ADD FOREIGN KEY for role_id
ALTER TABLE applications 
ADD CONSTRAINT fk_applications_role_id 
FOREIGN KEY (role_id) REFERENCES project_roles(id) ON DELETE CASCADE;

-- 5. ENABLE RLS on project_roles
ALTER TABLE project_roles ENABLE ROW LEVEL SECURITY;

-- 6. CREATE INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_project_roles_project ON project_roles(project_id);
CREATE INDEX IF NOT EXISTS idx_applications_role ON applications(role_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- 7. UPDATE project_roles RLS POLICIES
DROP POLICY IF EXISTS "Project owners view their project roles" ON project_roles;
DROP POLICY IF EXISTS "Everyone view available roles" ON project_roles;
DROP POLICY IF EXISTS "Project owners manage roles" ON project_roles;
DROP POLICY IF EXISTS "Project owners update roles" ON project_roles;
DROP POLICY IF EXISTS "Project owners delete roles" ON project_roles;

CREATE POLICY "Project owners view their project roles"
  ON project_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_roles.project_id
      AND projects.owner_id = auth.uid()
    )
  );

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

-- 8. UPDATE applications RLS POLICIES to support approval workflow
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
DROP POLICY IF EXISTS "Authenticated users can insert applications" ON applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON applications;

CREATE POLICY "Users view own applications"
  ON applications
  FOR SELECT
  USING (auth.uid() = user_id);

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

CREATE POLICY "Users can insert applications"
  ON applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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

-- 9. CREATE/UPDATE project_members RLS if needed
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone view project members" ON project_members;
DROP POLICY IF EXISTS "Project owners manage members" ON project_members;
DROP POLICY IF EXISTS "Project owners update members" ON project_members;
DROP POLICY IF EXISTS "Project owners remove members" ON project_members;

CREATE POLICY "Everyone view project members"
  ON project_members FOR SELECT
  USING (true);

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

-- 10. Verify the schema
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('applications', 'project_roles', 'project_members')
ORDER BY table_name, ordinal_position;
