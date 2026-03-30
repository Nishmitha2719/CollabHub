// Database types for Supabase tables

export interface Skill {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  detailed_description?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  team_size: number;
  is_paid: boolean;
  budget?: string;
  deadline?: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  category: string;
  owner_id: string;
  location?: string;
  college?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithDetails extends Project {
  skills: Skill[];
  roles: ProjectRole[];
  members: ProjectMember[];
  milestones: Milestone[];
  owner: UserProfile;
  application_count?: number;
  is_saved?: boolean;
  match_percentage?: number;
}

export interface ProjectSkill {
  id: string;
  project_id: string;
  skill_id: string;
  is_required: boolean;
}

export interface ProjectRole {
  id: string;
  project_id: string;
  role_name: string;
  description?: string;
  positions_available: number;
  positions_filled: number;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  status: 'Active' | 'Left' | 'Removed';
  user?: UserProfile;
}

export interface Application {
  id: string;
  project_id: string;
  user_id: string;
  role_id?: string;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn';
  applied_at: string;
  reviewed_at?: string;
  project?: Project;
  user?: UserProfile;
}

export interface SavedProject {
  id: string;
  user_id: string;
  project_id: string;
  saved_at: string;
  project?: ProjectWithDetails;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years_experience?: number;
  skill?: Skill;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  order_index: number;
  created_at: string;
}

export interface ProjectAttachment {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  comment: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  replies?: ProjectComment[];
}

export interface UserProfile {
  id: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  college?: string;
  location?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
}

// Filter types
export interface ProjectFilters {
  search?: string;
  skills?: string[];
  difficulty?: string;
  duration?: string;
  team_size?: string;
  is_paid?: boolean;
  category?: string;
  page?: number;
  limit?: number;
}

// Form types
export interface CreateProjectData {
  title: string;
  description: string;
  detailed_description?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  team_size: number;
  is_paid: boolean;
  budget?: string;
  deadline?: string;
  category: string;
  skills: string[]; // skill IDs
  roles: {
    role_name: string;
    description?: string;
    positions_available: number;
  }[];
  milestones?: {
    title: string;
    description?: string;
    due_date?: string;
    order_index: number;
  }[];
}
