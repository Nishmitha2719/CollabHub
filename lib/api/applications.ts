import { supabase } from '../supabaseClient';

export interface Application {
  id: string;
  project_id: string;
  user_id: string;
  role_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  applied_at: string;
  reviewed_at?: string;
}

export interface ApplicationWithDetails extends Application {
  user?: {
    id: string;
    full_name?: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
  role?: {
    id: string;
    role_name: string;
    positions_available: number;
    positions_filled: number;
  };
}

function normalizeStatus(status: string | null | undefined): string {
  return (status || '').trim().toLowerCase();
}

function toCanonicalStatus(status: string | null | undefined): 'pending' | 'accepted' | 'rejected' | 'withdrawn' | '' {
  const normalized = normalizeStatus(status);
  if (normalized === 'approved') return 'accepted';
  if (normalized === 'disapproved') return 'rejected';
  if (
    normalized === 'pending' ||
    normalized === 'accepted' ||
    normalized === 'rejected' ||
    normalized === 'withdrawn'
  ) {
    return normalized;
  }
  return '';
}

/**
 * Apply to a project
 */
export async function applyToProject(
  projectId: string,
  roleId: string,
  message: string
): Promise<{ success: boolean; data?: Application; error?: string }> {
  try {
    // ✅ Validate inputs
    if (!roleId || roleId.trim() === '') {
      return { success: false, error: 'Please select a valid role' };
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return { success: false, error: 'User not authenticated' };
    }

    const userId = authData.user.id;


      // 🔍 Check for existing application (any status)
      const { data: existing, error: checkError } = await supabase
        .from('applications')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing application:', checkError);
        return { success: false, error: 'Could not check application status' };
      }

      // ✅ Handle existing application based on status
      if (existing) {
        const existingStatus = toCanonicalStatus(existing.status);
        if (existingStatus === 'pending' || existingStatus === 'accepted') {
          return {
            success: false,
            error: 'You have already applied to this project. Please wait for a decision.',
          };
        }

        // ✅ Allow re-application if previously rejected or withdrawn
        if (existingStatus === 'rejected' || existingStatus === 'withdrawn') {
          let updatedApp: any = null;
          let updateError: any = null;
          for (const pendingVariant of ['pending', 'Pending']) {
            const res = await supabase
              .from('applications')
              .update({
                role_id: roleId,
                message: message || '',
                status: pendingVariant,
              })
              .eq('id', existing.id)
              .select()
              .maybeSingle();
            updatedApp = res.data;
            updateError = res.error;
            if (!updateError) break;
            if (updateError.code !== '23514') break;
          }

          if (updateError) {
            console.error('Error re-applying to project:', {
              message: updateError.message,
              code: updateError.code,
              details: updateError.details,
            });
            return { success: false, error: updateError.message || 'Could not re-apply to project' };
          }

          return { success: true, data: updatedApp || undefined };
        }
      }
    // 🔍 Check role capacity
    const { data: role, error: roleError } = await supabase
      .from('project_roles')
      .select('positions_available, positions_filled')
      .eq('id', roleId)
      .maybeSingle();

    if (roleError || !role) {
      return { success: false, error: 'Role not found' };
    }

    if (role.positions_filled >= role.positions_available) {
      return { success: false, error: 'Sorry, the team is full' };
    }

    const insertApplication = async (statusValue: string) =>
      supabase
        .from('applications')
        .insert([
          {
            project_id: projectId,
            user_id: userId,
            role_id: roleId,
            message: message || '',
            status: statusValue,
          },
        ])
        .select()
        .maybeSingle();

    // ✅ Insert application (support both status styles in older/newer schemas)
    let { data, error } = await insertApplication('pending');
    if (error?.code === '23514') {
      const retry = await insertApplication('Pending');
      data = retry.data;
      error = retry.error;
    }

    // Another request may have inserted the same (project_id, user_id) row first.
    // Treat that as idempotent success and return the existing application.
    if (error?.code === '23505') {
      const { data: existingAfterConflict, error: conflictReadError } = await supabase
        .from('applications')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!conflictReadError && existingAfterConflict) {
        return { success: true, data: existingAfterConflict as Application };
      }
    }

    if (error) {
      console.error('Error submitting application:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return { success: false, error: error.message || 'Could not submit application' };
    }

    if (!data) {
      console.error('Application insert returned no rows.');
      return { success: false, error: 'Could not submit application' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in applyToProject:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Get applications for a project (owner view)
 */
export async function getProjectApplications(
  projectId: string
): Promise<ApplicationWithDetails[]> {
  try {
    const mapApplications = async (rows: any[]): Promise<ApplicationWithDetails[]> => {
      const userIds = Array.from(new Set((rows || []).map((app: any) => app.user_id))).filter(Boolean);
      const roleIds = Array.from(new Set((rows || []).map((app: any) => app.role_id))).filter(Boolean);

      let profilesData: any[] = [];
      let profilesError: any = null;
      let rolesData: any[] = [];
      let rolesError: any = null;

      if (userIds.length > 0) {
        const profileResponse = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url')
          .in('id', userIds);
        profilesData = profileResponse.data || [];
        profilesError = profileResponse.error;
      }

      if (roleIds.length > 0) {
        const roleResponse = await supabase
          .from('project_roles')
          .select('id, role_name, positions_available, positions_filled')
          .in('id', roleIds);
        rolesData = roleResponse.data || [];
        rolesError = roleResponse.error;
      }

      if (profilesError) {
        console.error('Error fetching applicant profiles:', profilesError);
      }
      if (rolesError) {
        console.error('Error fetching application roles:', rolesError);
      }

      const profilesById = new Map((profilesData || []).map((profile: any) => [profile.id, profile]));
      const rolesById = new Map((rolesData || []).map((role: any) => [role.id, role]));

      return (rows || []).map((app: any) => ({
        ...app,
        // Some databases have created_at but not applied_at.
        applied_at: app.applied_at || app.created_at || new Date().toISOString(),
        role: rolesById.get(app.role_id),
        user: profilesById.get(app.user_id),
      }));
    };

    const { data, error } = await supabase
      .from('applications')
      .select(
        `
        id,
        project_id,
        user_id,
        role_id,
        message,
        status,
        applied_at,
        reviewed_at
      `
      )
      .eq('project_id', projectId)
      .order('applied_at', { ascending: false });

    if (!error) {
      return mapApplications(data || []);
    }

    // Fallback for older schemas where applications.applied_at does not exist.
    if (error.code === '42703') {
      const fallback = await supabase
        .from('applications')
        .select(
          `
          id,
          project_id,
          user_id,
          role_id,
          message,
          status,
          created_at,
          reviewed_at
        `
        )
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (fallback.error) {
        console.error('Error fetching project applications (fallback):', fallback.error);
        throw fallback.error;
      }

      return mapApplications(fallback.data || []);
    }

    console.error('Error fetching project applications:', error);
    throw error;
  } catch (error) {
    console.error('Unexpected error in getProjectApplications:', error);
    return [];
  }
}

/**
 * Approve application
 */
export async function approveApplication(
  applicationId: string,
  projectId: string,
  roleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 🔍 Get application
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .maybeSingle();

    if (appError) {
      console.error('Error fetching application for approval:', appError);
      return { success: false, error: appError.message || 'Failed to fetch application' };
    }

    if (!app) {
      return { success: false, error: 'Application not found' };
    }

    // 🔍 Get role with name
    const { data: role, error: roleError } = await supabase
      .from('project_roles')
      .select('role_name, positions_available, positions_filled')
      .eq('id', roleId)
      .maybeSingle();

    if (roleError) {
      console.error('Error fetching role for approval:', roleError);
      return { success: false, error: roleError.message || 'Failed to fetch role' };
    }

    if (!role) {
      return { success: false, error: 'Role not found' };
    }

    if (role.positions_filled >= role.positions_available) {
      return { success: false, error: 'Team is already full' };
    }

    const updateApplicationStatus = async (statusValue: string) =>
      supabase
        .from('applications')
        .update({
          status: statusValue,
        })
        .eq('id', applicationId);

    // ✅ Update application (support both status styles in older/newer schemas)
    let updateError: any = null;
    let approvedVariant = 'accepted';
    for (const variant of ['accepted', 'Accepted', 'approved', 'Approved']) {
      const res = await updateApplicationStatus(variant);
      updateError = res.error;
      if (!updateError) {
        approvedVariant = variant;
        break;
      }
      if (updateError.code !== '23514') break;
    }

    if (updateError) {
      console.error('Error approving application:', updateError);
      return { success: false, error: updateError.message };
    }

    // ✅ Add member
    const { error: insertMemberError } = await supabase.from('project_members').insert([
      {
        project_id: projectId,
        user_id: app.user_id,
        role: role.role_name,
        joined_at: new Date().toISOString(),
        status: 'Active',
      },
    ]);

    if (insertMemberError && insertMemberError.code !== '23505') {
      console.error('Error adding project member on approval:', insertMemberError);
      return {
        success: false,
        error: insertMemberError.message || 'Failed to add approved user to project team',
      };
    }

    // ✅ Keep role occupancy in sync with team membership.
    const membersCountResponse = await supabase
      .from('project_members')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('role', role.role_name)
      .in('status', ['Active', 'active']);

    const membersCount = membersCountResponse.count ?? role.positions_filled + 1;
    const nextFilled = Math.min(
      role.positions_available,
      Math.max(role.positions_filled, membersCount)
    );

    const { error: incrementError } = await supabase
      .from('project_roles')
      .update({
        positions_filled: nextFilled,
      })
      .eq('id', roleId)
      .select('id');

    if (incrementError) {
      console.error('Error incrementing role capacity:', incrementError);
      return { success: false, error: incrementError.message || 'Failed to update role capacity' };
    }

    // ✅ Reject other pending apps from same user
    const rejectOtherPending = async (pendingValues: string[], rejectedValue: string) =>
      supabase
        .from('applications')
        .update({ status: rejectedValue })
        .eq('project_id', projectId)
        .eq('user_id', app.user_id)
        .in('status', pendingValues)
        .neq('id', applicationId);

    const rejectedVariant = approvedVariant.toLowerCase().includes('approved')
      ? approvedVariant.charAt(0).toUpperCase() === approvedVariant.charAt(0)
        ? 'Rejected'
        : 'rejected'
      : 'rejected';

    let { error: rejectOthersError } = await rejectOtherPending(
      ['pending', 'Pending'],
      rejectedVariant
    );
    if (rejectOthersError?.code === '23514') {
      const retry = await rejectOtherPending(['pending', 'Pending'], 'Rejected');
      rejectOthersError = retry.error;
    }

    if (rejectOthersError) {
      console.error('Error rejecting other pending applications:', rejectOthersError);
      return {
        success: false,
        error: rejectOthersError.message || 'Failed to clean up other pending applications',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in approveApplication:', error);
    return { success: false, error: 'Approval failed' };
  }
}

/**
 * Reject application
 */
export async function rejectApplication(applicationId: string) {
  const rejectWith = async (statusValue: string) =>
    supabase
      .from('applications')
      .update({
        status: statusValue,
      })
      .eq('id', applicationId);

  let error: any = null;
  for (const variant of ['rejected', 'Rejected', 'disapproved', 'Disapproved']) {
    const res = await rejectWith(variant);
    error = res.error;
    if (!error) break;
    if (error.code !== '23514') break;
  }

  if (error) {
    console.error('Error rejecting application:', error);
  }

  return error ? { success: false, error: error.message } : { success: true };
}

/**
 * Withdraw application
 */
export async function withdrawApplication(applicationId: string) {
  const { error } = await supabase
    .from('applications')
    .update({ status: 'withdrawn' })
    .eq('id', applicationId);

  if (error) {
    console.error('Error withdrawing application:', error);
  }

  return error ? { success: false, error: error.message } : { success: true };
}