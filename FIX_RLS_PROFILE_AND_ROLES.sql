-- Run this in Supabase SQL Editor to fix profile save and add-role actions.
-- It resets policies for user_profiles and project_roles to match the app logic.

ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users update own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users insert own user_profiles" ON user_profiles;

CREATE POLICY "Profiles are viewable by everyone"
  ON user_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Project owners view their project roles" ON project_roles;
DROP POLICY IF EXISTS "Everyone view available roles" ON project_roles;
DROP POLICY IF EXISTS "Project owners manage roles" ON project_roles;
DROP POLICY IF EXISTS "Project owners update roles" ON project_roles;
DROP POLICY IF EXISTS "Project owners delete roles" ON project_roles;

CREATE POLICY "Project owners view their project roles"
  ON project_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_roles.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Everyone view available roles"
  ON project_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_roles.project_id
      AND projects.status = 'approved'
    )
  );

CREATE POLICY "Project owners manage roles"
  ON project_roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_roles.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners update roles"
  ON project_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_roles.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_roles.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners delete roles"
  ON project_roles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_roles.project_id
      AND projects.owner_id = auth.uid()
    )
  );
