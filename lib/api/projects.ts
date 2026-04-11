import { supabase } from '../supabaseClient';
import type { Skill } from '@/types/database';

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
  page?: number;
}

function isUuid(value: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(value);
}

function normalizeSkillsFromProject(project: any): string[] {
  const names = new Set<string>();

  if (Array.isArray(project?.skills)) {
    for (const skill of project.skills) {
      if (typeof skill === 'string' && skill.trim()) {
        names.add(skill.trim());
      }
    }
  }

  if (Array.isArray(project?.project_skills)) {
    for (const skillRow of project.project_skills) {
      if (typeof skillRow?.skill_name === 'string' && skillRow.skill_name.trim()) {
        names.add(skillRow.skill_name.trim());
      }

      const relatedSkill = skillRow?.skills;
      if (Array.isArray(relatedSkill)) {
        for (const s of relatedSkill) {
          if (typeof s?.name === 'string' && s.name.trim()) {
            names.add(s.name.trim());
          }
        }
      } else if (typeof relatedSkill?.name === 'string' && relatedSkill.name.trim()) {
        names.add(relatedSkill.name.trim());
      }
    }
  }

  return Array.from(names);
}

async function insertProjectSkills(projectId: string, selectedSkills: string[]): Promise<void> {
  if (!projectId || selectedSkills.length === 0) return;

  const uniqueSkills = Array.from(new Set(selectedSkills.filter(Boolean)));
  if (uniqueSkills.length === 0) return;

  const allAreUuids = uniqueSkills.every(isUuid);

  if (allAreUuids) {
    const uuidPayload = uniqueSkills.map((skillId) => ({ project_id: projectId, skill_id: skillId }));
    const { error: uuidInsertError } = await supabase.from('project_skills').insert(uuidPayload);

    if (!uuidInsertError) return;

    if (uuidInsertError.code !== '42703') {
      throw uuidInsertError;
    }

    const { data: skillRows } = await supabase
      .from('skills')
      .select('id, name')
      .in('id', uniqueSkills);

    const skillNameById = new Map<string, string>();
    (skillRows || []).forEach((row: any) => {
      if (row?.id && row?.name) {
        skillNameById.set(row.id, row.name);
      }
    });

    const skillNames = uniqueSkills.map((id) => skillNameById.get(id)).filter((name): name is string => !!name);
    if (skillNames.length === 0) {
      return;
    }

    const textPayload = skillNames.map((skillName) => ({ project_id: projectId, skill_name: skillName }));
    const { error: textInsertError } = await supabase.from('project_skills').insert(textPayload);
    if (textInsertError) throw textInsertError;
    return;
  }

  const textPayload = uniqueSkills.map((skillName) => ({ project_id: projectId, skill_name: skillName }));
  const { error: textInsertError } = await supabase.from('project_skills').insert(textPayload);
  if (textInsertError) throw textInsertError;
}

function validateUuid(value: string, label: string): void {
  // Guard against invalid IDs like "1" before hitting Supabase UUID columns.
  if (!value || value.length < 10) {
    throw new Error(`${label} must be a valid UUID`);
  }

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(value)) {
    throw new Error(`${label} must be a valid UUID`);
  }
}

// Get approved projects (public)
export async function getProjects(filters?: ProjectFilters, limit = 10): Promise<ProjectWithSkills[]> {
  try {
    const page = Math.max(1, filters?.page || 1);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const buildQuery = (selectShape: string) => {
      let query = supabase
        .from('projects')
        .select(selectShape)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);
      if (filters?.duration) query = query.eq('duration', filters.duration);
      if (filters?.team_size) query = query.eq('team_size', filters.team_size);
      if (filters?.is_paid !== undefined) query = query.eq('is_paid', filters.is_paid);
      if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

      return query;
    };

    let { data, error } = await buildQuery(`*, project_skills (skill_id, skills (name))`);

    if (error?.code === '42703') {
      ({ data, error } = await buildQuery(`*, project_skills (skill_name)`));
    }

    if (error) throw error;

    return (data || []).map((project: any) => ({
      ...project,
      skills: normalizeSkillsFromProject(project)
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Get project by ID
export async function getProjectById(id: string): Promise<ProjectWithSkills | null> {
  try {
    validateUuid(id, 'projectId');

    let { data, error } = await supabase
      .from('projects')
      .select(`*, project_skills (skill_id, skills (name)), profiles!projects_owner_id_fkey (name, email, avatar_url)`)
      .eq('id', id)
      .single();

    if (error?.code === '42703') {
      ({ data, error } = await supabase
        .from('projects')
        .select(`*, project_skills (skill_name), profiles!projects_owner_id_fkey (name, email, avatar_url)`)
        .eq('id', id)
        .single());
    }

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      skills: normalizeSkillsFromProject(data),
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
    const { id: _ignoredId, ...projectPayload } = project;

    const insertPayload = {
      title: projectPayload.title,
      description: projectPayload.description,
      detailed_description: projectPayload.detailed_description || null,
      category: projectPayload.category,
      difficulty: projectPayload.difficulty,
      duration: projectPayload.duration,
      team_size: projectPayload.team_size,
      is_paid: projectPayload.is_paid ?? false,
      budget: projectPayload.budget || null,
      deadline: projectPayload.deadline || null,
      owner_id: projectPayload.owner_id,
      status: 'pending' as const,
    };

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([insertPayload])
      .select()
      .single();

    if (projectError) throw projectError;

    if (skills.length > 0 && projectData) {
      await insertProjectSkills(projectData.id, skills);
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
    validateUuid(userId, 'userId');
    validateUuid(projectId, 'projectId');

    const { error } = await supabase.from('saved_projects').insert([{ user_id: userId, project_id: projectId }]);
    if (error && error.code !== '23505') {
      console.error(error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving project:', error);
    return false;
  }
}

// Unsave project
export async function unsaveProject(userId: string, projectId: string): Promise<boolean> {
  try {
    validateUuid(userId, 'userId');
    validateUuid(projectId, 'projectId');

    const { error } = await supabase.from('saved_projects').delete().eq('user_id', userId).eq('project_id', projectId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unsaving project:', error);
    return false;
  }
}

// Get saved projects
export async function getSavedProjects(userId: string, limit = 10): Promise<ProjectWithSkills[]> {
  try {
    validateUuid(userId, 'userId');

    let { data, error } = await supabase
      .from('saved_projects')
      .select(`project_id, projects (*, project_skills (skill_id, skills (name)))`)
      .eq('user_id', userId)
      .limit(limit);

    if (error?.code === '42703') {
      ({ data, error } = await supabase
        .from('saved_projects')
        .select(`project_id, projects (*, project_skills (skill_name))`)
        .eq('user_id', userId)
        .limit(limit));
    }

    if (error) throw error;

    return (data || [])
      .filter(item => item.projects)
      .map((item: any) => ({
        ...item.projects,
        skills: normalizeSkillsFromProject(item.projects)
      }));
  } catch (error) {
    console.error('Error fetching saved projects:', error);
    return [];
  }
}

// Apply to project
export async function applyToProject(userId: string, projectId: string, message?: string): Promise<boolean> {
  try {
    validateUuid(userId, 'userId');
    validateUuid(projectId, 'projectId');

    const { error } = await supabase.from('applications').insert([{ user_id: userId, project_id: projectId, message: message || null, status: 'pending' }]);
    if (error && error.code === '23505') throw new Error('You have already applied to this project');
    if (error) {
      console.error(error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Error applying:', error);
    throw error;
  }
}

// Check if user applied
export async function hasUserApplied(userId: string, projectId: string): Promise<boolean> {
  try {
    validateUuid(userId, 'userId');
    validateUuid(projectId, 'projectId');

    const { data, error } = await supabase.from('applications').select('id').eq('user_id', userId).eq('project_id', projectId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    return false;
  }
}

// ADMIN: Get all projects
export async function getAllProjects(limit = 20): Promise<ProjectWithSkills[]> {
  try {
    let { data, error } = await supabase
      .from('projects')
      .select(`*, project_skills (skill_id, skills (name)), profiles!projects_owner_id_fkey (name, email)`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error?.code === '42703') {
      ({ data, error } = await supabase
        .from('projects')
        .select(`*, project_skills (skill_name), profiles!projects_owner_id_fkey (name, email)`)
        .order('created_at', { ascending: false })
        .limit(limit));
    }

    if (error) throw error;

    return (data || []).map((project: any) => ({
      ...project,
      skills: normalizeSkillsFromProject(project),
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
    validateUuid(projectId, 'projectId');
    console.log('Approving project:', projectId);

    const { error } = await supabase
      .from('projects')
      .update({ status: 'approved' })
      .eq('id', projectId);

    if (error) {
      console.error(error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error approving project:', error);
    return false;
  }
}

// ADMIN: Reject project
export async function rejectProject(projectId: string): Promise<boolean> {
  try {
    validateUuid(projectId, 'projectId');
    console.log('Rejecting project:', projectId);

    const { error } = await supabase
      .from('projects')
      .update({ status: 'rejected' })
      .eq('id', projectId);

    if (error) {
      console.error(error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error rejecting project:', error);
    return false;
  }
}

// ADMIN: Delete project
export async function deleteProject(id: string): Promise<boolean> {
  try {
    validateUuid(id, 'projectId');

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// Get all skills (for post-project form)
export async function getAllSkills(): Promise<Skill[]> {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []) as Skill[];
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
}

// Calculate match percentage
export function calculateMatchPercentage(projectSkills: string[], userSkills: string[]): number {
  if (!projectSkills || projectSkills.length === 0) return 0;
  if (!userSkills || userSkills.length === 0) return 0;
  const matching = projectSkills.filter(skill => userSkills.some(us => us.toLowerCase() === skill.toLowerCase()));
  return Math.round((matching.length / projectSkills.length) * 100);
}
