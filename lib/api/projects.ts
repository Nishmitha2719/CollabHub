import { supabase } from '../supabaseClient';

export interface Project {
  id: string;
  title: string;
  description: string;
  detailed_description?: string;
  category: string;
  difficulty: string;
  duration: string;
  team_size: number;
  is_paid: boolean;
  budget?: string;
  deadline?: string;
  owner_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ProjectWithSkills extends Project {
  skills?: string[];
  owner?: any;
}

export interface ProjectFilters {
  skills?: string[];
  difficulty?: string;
  duration?: string;
  team_size?: number;
  is_paid?: boolean;
  category?: string;
  search?: string;
}

// Get approved projects (public)
export async function getProjects(filters?: ProjectFilters): Promise<ProjectWithSkills[]> {
  try {
    let query = supabase
      .from('projects')
      .select(`*, project_skills (skill_name)`)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);
    if (filters?.duration) query = query.eq('duration', filters.duration);
    if (filters?.team_size) query = query.eq('team_size', filters.team_size);
    if (filters?.is_paid !== undefined) query = query.eq('is_paid', filters.is_paid);
    if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((project: any) => ({
      ...project,
      skills: project.project_skills?.map((ps: any) => ps.skill_name) || []
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Get project by ID
export async function getProjectById(id: string): Promise<ProjectWithSkills | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`*, project_skills (skill_name), profiles!projects_owner_id_fkey (name, email, avatar_url)`)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      skills: data.project_skills?.map((ps: any) => ps.skill_name) || [],
      owner: data.profiles
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

// Create project
export async function createProject(project: Partial<Project>, skills: string[] = []): Promise<ProjectWithSkills | null> {
  try {
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([{ ...project, status: 'pending' }])
      .select()
      .single();

    if (projectError) throw projectError;

    if (skills.length > 0 && projectData) {
      const skillsData = skills.map(skill => ({ project_id: projectData.id, skill_name: skill }));
      await supabase.from('project_skills').insert(skillsData);
    }

    return { ...projectData, skills };
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

// Save project
export async function saveProject(userId: string, projectId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('saved_projects').insert([{ user_id: userId, project_id: projectId }]);
    if (error && error.code !== '23505') throw error;
    return true;
  } catch (error) {
    console.error('Error saving project:', error);
    return false;
  }
}

// Unsave project
export async function unsaveProject(userId: string, projectId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('saved_projects').delete().eq('user_id', userId).eq('project_id', projectId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unsaving project:', error);
    return false;
  }
}

// Get saved projects
export async function getSavedProjects(userId: string): Promise<ProjectWithSkills[]> {
  try {
    const { data, error } = await supabase
      .from('saved_projects')
      .select(`project_id, projects (*, project_skills (skill_name))`)
      .eq('user_id', userId);

    if (error) throw error;

    return (data || [])
      .filter(item => item.projects)
      .map((item: any) => ({
        ...item.projects,
        skills: item.projects.project_skills?.map((ps: any) => ps.skill_name) || []
      }));
  } catch (error) {
    console.error('Error fetching saved projects:', error);
    return [];
  }
}

// Apply to project
export async function applyToProject(userId: string, projectId: string, message?: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('applications').insert([{ user_id: userId, project_id: projectId, message: message || null, status: 'pending' }]);
    if (error && error.code === '23505') throw new Error('You have already applied to this project');
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error applying:', error);
    throw error;
  }
}

// Check if user applied
export async function hasUserApplied(userId: string, projectId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('applications').select('id').eq('user_id', userId).eq('project_id', projectId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    return false;
  }
}

// ADMIN: Get all projects
export async function getAllProjects(): Promise<ProjectWithSkills[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`*, project_skills (skill_name), profiles!projects_owner_id_fkey (name, email)`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((project: any) => ({
      ...project,
      skills: project.project_skills?.map((ps: any) => ps.skill_name) || [],
      owner: project.profiles
    }));
  } catch (error) {
    console.error('Error fetching all projects:', error);
    return [];
  }
}

// ADMIN: Approve project
export async function approveProject(projectId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('projects').update({ status: 'approved' }).eq('id', projectId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error approving project:', error);
    return false;
  }
}

// ADMIN: Reject project
export async function rejectProject(projectId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('projects').update({ status: 'rejected' }).eq('id', projectId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error rejecting project:', error);
    return false;
  }
}

// ADMIN: Delete project
export async function deleteProject(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// Calculate match percentage
export function calculateMatchPercentage(projectSkills: string[], userSkills: string[]): number {
  if (!projectSkills || projectSkills.length === 0) return 0;
  if (!userSkills || userSkills.length === 0) return 0;
  const matching = projectSkills.filter(skill => userSkills.some(us => us.toLowerCase() === skill.toLowerCase()));
  return Math.round((matching.length / projectSkills.length) * 100);
}
