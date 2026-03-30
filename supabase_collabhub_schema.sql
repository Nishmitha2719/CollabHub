-- ============================================
-- COLLABHUB DATABASE SCHEMA (SIMPLIFIED)
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  bio TEXT,
  avatar_url TEXT,
  skills TEXT[], -- Array of skills
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Intermediate',
  duration TEXT DEFAULT '1-2 months',
  team_size INTEGER DEFAULT 3,
  is_paid BOOLEAN DEFAULT false,
  budget TEXT,
  deadline DATE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Approved projects are viewable by everyone" 
  ON projects FOR SELECT 
  USING (status = 'approved' OR owner_id = auth.uid());

CREATE POLICY "Authenticated users can insert projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = owner_id);

-- ============================================
-- 3. PROJECT SKILLS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS project_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, skill_name)
);

-- Enable RLS
ALTER TABLE project_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project skills are viewable by everyone" 
  ON project_skills FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert project skills" 
  ON project_skills FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT owner_id FROM projects WHERE id = project_id));

-- ============================================
-- 4. APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id) -- Prevent duplicate applications
);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Applications policies
CREATE POLICY "Users can view their own applications" 
  ON applications FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM projects WHERE id = project_id));

CREATE POLICY "Authenticated users can insert applications" 
  ON applications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
  ON applications FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================
-- 5. SAVED PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id) -- Prevent duplicate saves
);

-- Enable RLS
ALTER TABLE saved_projects ENABLE ROW LEVEL SECURITY;

-- Saved projects policies
CREATE POLICY "Users can view their own saved projects" 
  ON saved_projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can save projects" 
  ON saved_projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their projects" 
  ON saved_projects FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_project ON applications(project_id);
CREATE INDEX IF NOT EXISTS idx_saved_projects_user ON saved_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_skills_project ON project_skills(project_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for projects
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for applications
CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON applications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADMIN POLICIES (Run these separately after creating first admin user)
-- ============================================
-- Note: After creating your first user, manually set their role to 'admin' in Supabase:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';

-- Admin can view all projects
CREATE POLICY "Admins can view all projects" 
  ON projects FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can update any project
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
-- SAMPLE DATA (OPTIONAL - for testing)
-- ============================================
-- Note: Replace 'your-user-id-here' with your actual auth user ID

-- INSERT INTO profiles (id, name, email, role, bio) VALUES
-- ('your-user-id-here', 'Admin User', 'admin@collabhub.com', 'admin', 'Platform Administrator');

-- INSERT INTO projects (title, description, category, owner_id, status) VALUES
-- ('AI Study Assistant', 'Build an AI-powered study companion', 'AI/ML', 'your-user-id-here', 'approved'),
-- ('Blockchain Voting', 'Decentralized voting platform', 'Blockchain', 'your-user-id-here', 'approved');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'CollabHub database schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create your first user via signup';
  RAISE NOTICE '2. Set their role to admin: UPDATE profiles SET role = ''admin'' WHERE email = ''your-email'';';
  RAISE NOTICE '3. Start using the app!';
END $$;
