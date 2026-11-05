import { supabase } from '../supabaseClient';

/**
 * True if the user is an active member of the project's team.
 * (The owner is handled separately by comparing with project.owner_id.)
 */
export async function isActiveProjectMember(projectId: string, userId: string): Promise<boolean> {
  if (!projectId || !userId) return false;

  try {
    const { data, error } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .in('status', ['Active', 'active'])
      .limit(1);

    if (error) throw error;
    return (data || []).length > 0;
  } catch (error) {
    console.error('Error checking project membership:', error);
    return false;
  }
}
