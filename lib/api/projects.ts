import { supabase } from '../supabaseClient';
import type { Skill } from '@/types/database';
import { createProjectRoles } from './projectRoles';

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

    // Fetch approved projects first (simple query, no FK join)
    let query = supabase
      .from('projects')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);
    if (filters?.duration) query = query.eq('duration', filters.duration);
    if (filters?.team_size) query = query.eq('team_size', filters.team_size);
    if (filters?.is_paid !== undefined) query = query.eq('is_paid', filters.is_paid);
    if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

    const { data: projectsData, error: projectsError } = await query;

    if (projectsError) throw projectsError;

    if (!projectsData || projectsData.length === 0) {
      return [];
    }

    const projectIds = projectsData.map((p: any) => p.id);

    // Fetch skills separately
    const { data: skillsData, error: skillsError } = await supabase
      .from('project_skills')
      .select('project_id, skills(name)')
      .in('project_id', projectIds);

    if (skillsError && skillsError.code !== 'PGRST116') {
      console.error('Error fetching skills:', skillsError);
    }

    // Create skills map
    const skillsMap = new Map();
    (skillsData || []).forEach((item: any) => {
      if (!skillsMap.has(item.project_id)) {
        skillsMap.set(item.project_id, []);
      }
      const skillName = item.skills?.name || item.skills?.skill_name || item.skill_name;
      if (skillName) {
        skillsMap.get(item.project_id).push(skillName);
      }
    });

    return (projectsData || []).map((project: any) => ({
      ...project,
      skills: skillsMap.get(project.id) || []
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

    // Fetch project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError) throw projectError;
    if (!projectData) return null;

    // Fetch owner profile
    const { data: ownerData, error: ownerError } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url')
      .eq('id', projectData.owner_id)
      .single();

    if (ownerError && ownerError.code !== 'PGRST116') {
      console.error('Error fetching owner profile:', ownerError);
    }

    // Fetch skills
    const { data: skillsData, error: skillsError } = await supabase
      .from('project_skills')
      .select('project_id, skills(name)')
      .eq('project_id', id);

    if (skillsError && skillsError.code !== 'PGRST116') {
      console.error('Error fetching skills:', skillsError);
    }

    // Extract skill names
    const skills = (skillsData || []).map((item: any) => {
      return item.skills?.name || item.skills?.skill_name || item.skill_name;
    }).filter(Boolean);

    return {
      ...projectData,
      skills,
      owner: ownerData || { name: 'Unknown', email: '', avatar_url: null }
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

// Create project
export async function createProject(
  project: Partial<Project>,
  skills: string[] = [],
  roles: Array<{
    role_name: string;
    description?: string;
    positions_available: number;
  }> = []
): Promise<{ success: boolean; data?: ProjectWithSkills; error?: string }> {
  try {
    // Validate required fields
    if (!project.title?.trim()) {
      return { success: false, error: 'Project title is required' };
    }
    if (!project.description?.trim()) {
      return { success: false, error: 'Project description is required' };
    }
    if (!project.owner_id) {
      return { success: false, error: 'User ID is required' };
    }
    if (!project.category?.trim()) {
      return { success: false, error: 'Category is required' };
    }

    const validRoles = roles
      .map((role) => ({
        role_name: role.role_name?.trim() || '',
        description: role.description?.trim() || '',
        positions_available: Number(role.positions_available) || 0,
      }))
      .filter((role) => role.role_name.length > 0 && role.positions_available > 0);

    if (validRoles.length === 0) {
      return { success: false, error: 'At least one valid role is required' };
    }

    const { id: _ignoredId, ...projectPayload } = project;

    const insertPayload = {
      title: projectPayload.title,
      description: projectPayload.description,
      detailed_description: projectPayload.detailed_description || null,
      category: projectPayload.category,
      difficulty: projectPayload.difficulty || 'Intermediate',
      duration: projectPayload.duration || '1-2 months',
      team_size: projectPayload.team_size || 3,
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

    if (projectError) {
      const errorMessage = projectError.message || 'Failed to insert project into database';
      console.error('Project insert error:', {
        message: projectError.message,
        code: projectError.code,
        details: projectError.details,
        hint: projectError.hint,
      });
      return { success: false, error: errorMessage };
    }

    if (!projectData) {
      return { success: false, error: 'Project was not created (no data returned)' };
    }

    // Insert skills (non-blocking - don't fail if this fails)
    if (skills.length > 0) {
      try {
        await insertProjectSkills(projectData.id, skills);
      } catch (skillError) {
        console.warn('Error inserting skills (non-blocking):', skillError);
        // Don't fail the entire request
      }
    }

    const roleResult = await createProjectRoles(projectData.id, validRoles);
    if (!roleResult.success) {
      console.error('Error creating project roles:', roleResult.error);
      return {
        success: false,
        error:
          roleResult.error ||
          'Project was created but roles failed to save. Please edit the project and add roles again.',
      };
    }

    console.log('Project created successfully:', projectData.id);
    return { success: true, data: { ...projectData, skills } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error creating project:', error);
    return { success: false, error: errorMessage };
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

/**
 * @deprecated Use applyToProject from lib/api/applications.ts instead (requires roleId)
 * This function is kept for backwards compatibility but doesn't support roles
 */
export async function applyToProject(userId: string, projectId: string, message?: string): Promise<boolean> {
  try {
    validateUuid(userId, 'userId');
    validateUuid(projectId, 'projectId');

    // 🔍 Check for existing application
    const { data: existing, error: checkError } = await supabase
      .from('applications')
      .select('status')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing application:', checkError);
      throw checkError;
    }

    // ✅ Handle existing application
    if (existing) {
      if (existing.status === 'pending' || existing.status === 'accepted') {
        throw new Error('You have already applied to this project');
      }

      // Allow re-application if previously rejected/withdrawn
      if (existing.status === 'rejected' || existing.status === 'withdrawn') {
        const { error: updateError } = await supabase
          .from('applications')
          .update({
            message: message || null,
            status: 'pending',
          })
          .eq('project_id', projectId)
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error re-applying to project:', updateError);
          throw updateError;
        }
        return true;
      }
    }

    // Insert new application
    const { error } = await supabase.from('applications').insert([
      {
        user_id: userId,
        project_id: projectId,
        message: message || null,
        status: 'pending',
      },
    ]);

    if (error) {
      console.error('Error applying to project:', error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error('Error in applyToProject:', error);
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
    console.log('Fetching all projects with limit:', limit);

    // First, fetch all projects
    let { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (projectsError) {
      console.error('Error fetching all projects:', projectsError);
      throw projectsError;
    }

    console.log(`Found ${projectsData?.length || 0} total projects`);

    // Then fetch owner profiles separately
    const projectIds = (projectsData || []).map((p: any) => p.owner_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', projectIds);

    if (profilesError) {
      console.error('Error fetching owner profiles:', profilesError);
      // Don't throw - continue without profile data
    }

    // Create lookup map for profiles
    const profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]));

    // Now fetch skills for these projects
    const { data: skillsData, error: skillsError } = await supabase
      .from('project_skills')
      .select('project_id, skills(name)')
      .in('project_id', projectIds);

    if (skillsError && skillsError.code !== 'PGRST116') {
      console.error('Error fetching project skills:', skillsError);
      // Don't throw - continue without skills
    }

    // Create lookup map for skills
    const skillsMap = new Map();
    (skillsData || []).forEach((item: any) => {
      if (!skillsMap.has(item.project_id)) {
        skillsMap.set(item.project_id, []);
      }
      const skillName = item.skills?.name || item.skills?.skill_name || item.skill_name;
      if (skillName) {
        skillsMap.get(item.project_id).push(skillName);
      }
    });

    // Combine results
    return (projectsData || []).map((project: any) => ({
      ...project,
      skills: skillsMap.get(project.id) || [],
      owner: profilesMap.get(project.owner_id) || { name: 'Unknown', email: 'unknown@example.com' }
    }));
  } catch (error) {
    console.error('Error fetching all projects:', error);
    return [];
  }
}

// ADMIN: Get pending projects (for admin dashboard)
export async function getPendingProjects(limit = 20): Promise<ProjectWithSkills[]> {
  try {
    console.log('Fetching pending projects with limit:', limit);

    // First, try with project_skills join
    let { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (projectsError) {
      console.error('Error fetching pending projects:', {
        message: projectsError.message,
        code: projectsError.code,
        details: projectsError.details,
      });
      throw projectsError;
    }

    console.log(`Found ${projectsData?.length || 0} pending projects`);

    // Then fetch owner profiles separately
    const projectIds = (projectsData || []).map((p: any) => p.owner_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', projectIds);

    if (profilesError) {
      console.error('Error fetching owner profiles:', profilesError);
      // Don't throw - continue without profile data
    }

    // Create lookup map for profiles
    const profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]));

    // Now fetch skills for these projects
    const { data: skillsData, error: skillsError } = await supabase
      .from('project_skills')
      .select('project_id, skills(name)')
      .in('project_id', projectIds);

    if (skillsError && skillsError.code !== 'PGRST116') {
      console.error('Error fetching project skills:', skillsError);
      // Don't throw - continue without skills
    }

    // Create lookup map for skills
    const skillsMap = new Map();
    (skillsData || []).forEach((item: any) => {
      if (!skillsMap.has(item.project_id)) {
        skillsMap.set(item.project_id, []);
      }
      const skillName = item.skills?.name || item.skills?.skill_name || item.skill_name;
      if (skillName) {
        skillsMap.get(item.project_id).push(skillName);
      }
    });

    // Combine results
    return (projectsData || []).map((project: any) => ({
      ...project,
      skills: skillsMap.get(project.id) || [],
      owner: profilesMap.get(project.owner_id) || { name: 'Unknown', email: 'unknown@example.com' }
    }));
  } catch (error) {
    console.error('Error in getPendingProjects:', error);
    throw error; // Don't silent fail - admin needs to know
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
