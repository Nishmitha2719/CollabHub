-- CollabHub Database Schema for Supabase
-- Run these SQL commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT, -- e.g., 'Frontend', 'Backend', 'AI/ML', 'Design'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    duration TEXT, -- e.g., '2-3 months', '1-2 weeks'
    team_size INTEGER,
    is_paid BOOLEAN DEFAULT FALSE,
    budget TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed', 'Cancelled')),
    category TEXT, -- AI/ML, Web Dev, IoT, Mobile, Blockchain, Cybersecurity
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location TEXT,
    college TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Project Skills (Many-to-Many)
CREATE TABLE IF NOT EXISTS project_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE,
    UNIQUE(project_id, skill_id)
);

-- 4. Roles/Positions Needed
CREATE TABLE IF NOT EXISTS project_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL, -- e.g., 'Frontend Developer', 'ML Engineer'
    description TEXT,
    positions_available INTEGER DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Project Members/Team
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT, -- Their role in the project
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Left', 'Removed')),
    UNIQUE(project_id, user_id)
);

-- 6. Applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES project_roles(id) ON DELETE SET NULL,
    message TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Withdrawn')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, user_id)
);

-- 7. Saved/Bookmarked Projects
CREATE TABLE IF NOT EXISTS saved_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- 8. User Skills (for matching)
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency TEXT CHECK (proficiency IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    years_experience INTEGER,
    UNIQUE(user_id, skill_id)
);

-- 9. Milestones/Timeline
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Project Attachments
CREATE TABLE IF NOT EXISTS project_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Supabase storage path
    file_type TEXT,
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Project Comments/Discussion
CREATE TABLE IF NOT EXISTS project_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    parent_id UUID REFERENCES project_comments(id) ON DELETE CASCADE, -- For replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. User Profiles (extended)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    college TEXT,
    location TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_skills_project ON project_skills(project_id);
CREATE INDEX IF NOT EXISTS idx_project_skills_skill ON project_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_project ON applications(project_id);
CREATE INDEX IF NOT EXISTS idx_saved_projects_user ON saved_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Projects: Everyone can view, only owner can update/delete
CREATE POLICY "Projects are viewable by everyone" ON projects
    FOR SELECT USING (true);

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = owner_id);

-- Applications: Users can view their own applications
CREATE POLICY "Users can view their own applications" ON applications
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT owner_id FROM projects WHERE id = project_id
    ));

CREATE POLICY "Users can create applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" ON applications
    FOR UPDATE USING (auth.uid() = user_id);

-- Saved Projects: Users can manage their own bookmarks
CREATE POLICY "Users can view their saved projects" ON saved_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save projects" ON saved_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved projects" ON saved_projects
    FOR DELETE USING (auth.uid() = user_id);

-- User Profiles: Public read, own write
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Comments: Everyone can view, authenticated users can create
CREATE POLICY "Comments are viewable by everyone" ON project_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON project_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON project_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON project_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Insert some sample skills
INSERT INTO skills (name, category) VALUES
    -- Frontend
    ('React', 'Frontend'),
    ('Vue.js', 'Frontend'),
    ('Angular', 'Frontend'),
    ('TypeScript', 'Frontend'),
    ('JavaScript', 'Frontend'),
    ('HTML/CSS', 'Frontend'),
    ('Tailwind CSS', 'Frontend'),
    ('Next.js', 'Frontend'),
    
    -- Backend
    ('Node.js', 'Backend'),
    ('Python', 'Backend'),
    ('Django', 'Backend'),
    ('FastAPI', 'Backend'),
    ('Express.js', 'Backend'),
    ('PostgreSQL', 'Backend'),
    ('MongoDB', 'Backend'),
    ('GraphQL', 'Backend'),
    ('REST API', 'Backend'),
    
    -- AI/ML
    ('Machine Learning', 'AI/ML'),
    ('TensorFlow', 'AI/ML'),
    ('PyTorch', 'AI/ML'),
    ('NLP', 'AI/ML'),
    ('Computer Vision', 'AI/ML'),
    ('OpenAI API', 'AI/ML'),
    
    -- Mobile
    ('React Native', 'Mobile'),
    ('Flutter', 'Mobile'),
    ('iOS', 'Mobile'),
    ('Android', 'Mobile'),
    ('Kotlin', 'Mobile'),
    ('Swift', 'Mobile'),
    
    -- Blockchain
    ('Solidity', 'Blockchain'),
    ('Web3.js', 'Blockchain'),
    ('Ethereum', 'Blockchain'),
    ('Smart Contracts', 'Blockchain'),
    
    -- IoT
    ('Arduino', 'IoT'),
    ('Raspberry Pi', 'IoT'),
    ('MQTT', 'IoT'),
    ('Embedded Systems', 'IoT'),
    
    -- DevOps & Cloud
    ('Docker', 'DevOps'),
    ('AWS', 'Cloud'),
    ('Azure', 'Cloud'),
    ('GCP', 'Cloud'),
    ('Kubernetes', 'DevOps'),
    
    -- Design
    ('Figma', 'Design'),
    ('UI/UX', 'Design'),
    ('Adobe XD', 'Design'),
    
    -- Other
    ('Git', 'Tools'),
    ('Cybersecurity', 'Security'),
    ('Penetration Testing', 'Security')
ON CONFLICT (name) DO NOTHING;

-- Create storage bucket for project attachments
-- Run this in the Supabase Storage interface or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-attachments', 'project-attachments', false);

-- Storage policies (run after creating bucket)
-- CREATE POLICY "Authenticated users can upload attachments" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'project-attachments' AND auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Attachments are viewable by everyone" ON storage.objects
--     FOR SELECT USING (bucket_id = 'project-attachments');
