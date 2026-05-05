-- Fix: Add admin policy to projects table to allow admins to view all projects including pending ones

-- First, drop the existing policy that's restricting admin access
DROP POLICY IF EXISTS "Approved projects are viewable by everyone" ON projects;

-- Create new policies:

-- 1. Admins can view ALL projects (pending, approved, rejected)
CREATE POLICY "Admins can view all projects" 
  ON projects FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 2. Everyone can view approved projects
CREATE POLICY "Approved projects are viewable by everyone" 
  ON projects FOR SELECT 
  USING (status = 'approved');

-- 3. Users can view their own projects (including pending/rejected)
CREATE POLICY "Users can view their own projects" 
  ON projects FOR SELECT 
  USING (owner_id = auth.uid());

-- Ensure INSERT, UPDATE, DELETE policies are still in place
CREATE POLICY "Authenticated users can insert projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = owner_id);
