-- ============================================
-- ADMIN RLS POLICIES FOR PROJECTS TABLE
-- ============================================

-- Admin can view all projects (bypasses status filter)
CREATE POLICY "Admins can view all projects" 
  ON projects FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can update any project (approve/reject)
CREATE POLICY "Admins can update any project" 
  ON projects FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can delete any project
CREATE POLICY "Admins can delete any project" 
  ON projects FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- USER RLS POLICIES (INTACT - DO NOT CHANGE)
-- ============================================

-- Regular users can see approved projects or their own
CREATE POLICY "Approved projects are viewable by everyone" 
  ON projects FOR SELECT 
  USING (status = 'approved' OR owner_id = auth.uid());

-- Users can only insert their own projects
CREATE POLICY "Authenticated users can insert projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

-- Users can only update their own projects
CREATE POLICY "Users can update their own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = owner_id);

-- Users can only delete their own projects
CREATE POLICY "Users can delete their own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = owner_id);
