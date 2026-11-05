import { supabase } from '../supabaseClient';

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  status: 'Active' | 'Left' | 'Removed';
  user?: {
    id: string;
    full_name?: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
}

/**
 * Get all members of a project
 */
export async function getProjectMembers(
  projectId: string
): Promise<ProjectMember[]> {
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select('id, project_id, user_id, role, joined_at, status')
      .eq('project_id', projectId)
      .in('status', ['Active', 'active'])
      .order('joined_at', { ascending: false });

    if (error) throw error;

    const rows: any[] = data || [];
    const userIds = Array.from(new Set(rows.map((member) => member.user_id))).filter(Boolean);

    // Member names live in `profiles` (column `name`), so look them up separately.
    const profilesById = new Map<string, any>();
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching member profiles:', profilesError);
      }

      (profiles || []).forEach((profile: any) => profilesById.set(profile.id, profile));
    }

    return rows.map((member) => {
      const profile = profilesById.get(member.user_id);
      return {
        ...member,
        user: profile
          ? {
              id: profile.id,
              full_name: profile.name ?? undefined,
              name: profile.name ?? undefined,
              email: profile.email ?? undefined,
              avatar_url: profile.avatar_url ?? undefined,
            }
          : undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching project members:', error);
    return [];
  }
}

/**
 * Get active members count
 */
export async function getProjectMembersCount(
  projectId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'Active');

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error counting project members:', error);
    return 0;
  }
}

/**
 * Remove a member from project
 */
export async function removeProjectMember(
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('project_members')
      .update({ status: 'Removed' })
      .eq('id', memberId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing project member:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get projects where user is a member
 */
export async function getUserProjects(userId: string) {
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select(
        `
        id,
        project_id,
        role,
        joined_at,
        projects:project_id (
          id,
          title,
          description,
          category,
          status
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', 'Active')
      .order('joined_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((member: any) => ({
      membership_id: member.id,
      project_id: member.project_id,
      role: member.role,
      joined_at: member.joined_at,
      ...member.projects,
    }));
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return [];
  }
}
