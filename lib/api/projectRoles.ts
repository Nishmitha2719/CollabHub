import { supabase } from '../supabaseClient';

export interface ProjectRole {
  id: string;
  project_id: string;
  role_name: string;
  description?: string;
  positions_available: number;
  positions_filled: number;
  created_at: string;
}

/**
 * Get all roles for a project
 */
export async function getProjectRoles(
  projectId: string
): Promise<ProjectRole[]> {
  try {
    const { data, error } = await supabase
      .from('project_roles')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching project roles:', error);
    return [];
  }
}

/**
 * Get available roles for a project (not full)
 */
export async function getAvailableProjectRoles(
  projectId: string
): Promise<ProjectRole[]> {
  try {
    const { data, error } = await supabase
      .from('project_roles')
      .select('*')
      .eq('project_id', projectId)
      .lt('positions_filled', supabase.rpc('cast_to_int', { val: 'positions_available' }))
      .order('created_at', { ascending: false });

    // Fallback: fetch all and filter client-side
    if (error || !data) {
      const { data: allRoles } = await supabase
        .from('project_roles')
        .select('*')
        .eq('project_id', projectId);

      return (allRoles || []).filter((r) => r.positions_filled < r.positions_available);
    }

    return data;
  } catch (error) {
    console.error('Error fetching available roles:', error);
    return [];
  }
}

/**
 * Create roles for a project
 */
export async function createProjectRoles(
  projectId: string,
  roles: Array<{
    role_name: string;
    description?: string;
    positions_available: number;
  }>
): Promise<{ success: boolean; data?: ProjectRole[]; error?: string }> {
  try {
    const rolesData = roles.map((role) => ({
      project_id: projectId,
      role_name: role.role_name,
      description: role.description || null,
      positions_available: role.positions_available,
      positions_filled: 0,
    }));

    const { data, error } = await supabase
      .from('project_roles')
      .insert(rolesData)
      .select();

    if (error) {
      console.error('Error creating project roles:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating project roles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update a project role
 */
export async function updateProjectRole(
  roleId: string,
  updates: {
    role_name?: string;
    description?: string;
    positions_available?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('project_roles')
      .update(updates)
      .eq('id', roleId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating project role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a project role (only if no one has applied)
 */
export async function deleteProjectRole(
  roleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if anyone has applied for this role
    const { data: applications } = await supabase
      .from('applications')
      .select('id')
      .eq('role_id', roleId)
      .limit(1);

    if (applications && applications.length > 0) {
      return {
        success: false,
        error: 'Cannot delete role with existing applications',
      };
    }

    const { error } = await supabase
      .from('project_roles')
      .delete()
      .eq('id', roleId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting project role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get role availability info
 */
export async function getRoleAvailability(
  roleId: string
): Promise<{
  role: ProjectRole | null;
  available: number;
  isFull: boolean;
}> {
  try {
    const { data, error } = await supabase
      .from('project_roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (error || !data) {
      return { role: null, available: 0, isFull: true };
    }

    const available = data.positions_available - data.positions_filled;

    return {
      role: data,
      available: Math.max(0, available),
      isFull: available <= 0,
    };
  } catch (error) {
    console.error('Error getting role availability:', error);
    return { role: null, available: 0, isFull: true };
  }
}
