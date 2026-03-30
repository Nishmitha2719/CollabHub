#!/usr/bin/env python3
"""
CollabHub - Complete Project System Setup
Creates all database types, pages, components, and API routes
"""

import os

print("=" * 70)
print("  CollabHub - Complete Project System Setup")
print("=" * 70)
print()

# Create directories
directories = [
    'types',
    'app/projects',
    'app/projects/[id]',
    'app/post-project',
    'app/saved-projects',
    'app/api/projects',
    'app/api/projects/[id]',
    'app/api/applications',
    'app/api/saved-projects',
    'components/projects',
    'lib/api',
]

print("Step 1: Creating directories...")
for directory in directories:
    os.makedirs(directory, exist_ok=True)
    print(f"  ✓ {directory}")

print("\nStep 2: Creating TypeScript types...")

files = {}

# 1. Database Types
files['types/database.ts'] = """// Database types for Supabase tables

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
"""

# 2. Projects API Service
files['lib/api/projects.ts'] = """import { supabase } from '@/lib/supabaseClient';
import { Project, ProjectWithDetails, ProjectFilters, CreateProjectData } from '@/types/database';

export async function getProjects(filters: ProjectFilters = {}) {
  let query = supabase
    .from('projects')
    .select(`
      *,
      owner:user_profiles!projects_owner_id_fkey(*)
    `)
    .eq('status', 'Open')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters.is_paid !== undefined) {
    query = query.eq('is_paid', filters.is_paid);
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return { projects: data, count, page, limit };
}

export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      owner:user_profiles!projects_owner_id_fkey(*),
      project_skills(
        skill:skills(*)
      ),
      project_roles(*),
      project_members(
        *,
        user:user_profiles(*)
      ),
      project_milestones(*),
      project_attachments(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return data as ProjectWithDetails;
}

export async function createProject(data: CreateProjectData, userId: string) {
  // Create project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      title: data.title,
      description: data.description,
      detailed_description: data.detailed_description,
      difficulty: data.difficulty,
      duration: data.duration,
      team_size: data.team_size,
      is_paid: data.is_paid,
      budget: data.budget,
      deadline: data.deadline,
      category: data.category,
      owner_id: userId,
    })
    .select()
    .single();

  if (projectError) throw projectError;

  // Add skills
  if (data.skills.length > 0) {
    const skillsData = data.skills.map(skillId => ({
      project_id: project.id,
      skill_id: skillId,
    }));

    const { error: skillsError } = await supabase
      .from('project_skills')
      .insert(skillsData);

    if (skillsError) throw skillsError;
  }

  // Add roles
  if (data.roles.length > 0) {
    const { error: rolesError } = await supabase
      .from('project_roles')
      .insert(
        data.roles.map(role => ({
          project_id: project.id,
          ...role,
        }))
      );

    if (rolesError) throw rolesError;
  }

  // Add milestones
  if (data.milestones && data.milestones.length > 0) {
    const { error: milestonesError } = await supabase
      .from('project_milestones')
      .insert(
        data.milestones.map(milestone => ({
          project_id: project.id,
          ...milestone,
        }))
      );

    if (milestonesError) throw milestonesError;
  }

  return project;
}

export async function getSavedProjects(userId: string) {
  const { data, error } = await supabase
    .from('saved_projects')
    .select(`
      *,
      project:projects(
        *,
        owner:user_profiles!projects_owner_id_fkey(*)
      )
    `)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) throw error;

  return data;
}

export async function saveProject(projectId: string, userId: string) {
  const { data, error } = await supabase
    .from('saved_projects')
    .insert({
      project_id: projectId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function unsaveProject(projectId: string, userId: string) {
  const { error } = await supabase
    .from('saved_projects')
    .delete()
    .match({ project_id: projectId, user_id: userId });

  if (error) throw error;
}

export async function applyToProject(projectId: string, userId: string, message?: string, roleId?: string) {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      project_id: projectId,
      user_id: userId,
      message,
      role_id: roleId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getUserSkills(userId: string) {
  const { data, error } = await supabase
    .from('user_skills')
    .select('*, skill:skills(*)')
    .eq('user_id', userId);

  if (error) throw error;

  return data;
}

export async function getAllSkills() {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('name');

  if (error) throw error;

  return data;
}

// Calculate match percentage based on skill overlap
export function calculateMatchPercentage(
  projectSkills: string[],
  userSkills: string[]
): number {
  if (projectSkills.length === 0) return 0;
  
  const matchingSkills = projectSkills.filter(skill => 
    userSkills.includes(skill)
  );
  
  return Math.round((matchingSkills.length / projectSkills.length) * 100);
}
"""

# Create all files
for filepath, content in files.items():
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  ✓ {filepath}")

print()
print("=" * 70)
print("  ✅ Types and API Created!")
print("=" * 70)
print()
print("Run the next script to create pages and components...")
print()
