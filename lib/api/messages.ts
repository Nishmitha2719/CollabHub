import { supabase } from '../supabaseClient';

export interface ProjectMessage {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export const MAX_MESSAGE_LENGTH = 2000;

/** Latest messages for a project, oldest first. */
export async function getMessages(projectId: string, limit = 100): Promise<ProjectMessage[]> {
  try {
    const { data, error } = await supabase
      .from('project_messages')
      .select('id, project_id, user_id, content, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return ((data || []) as ProjectMessage[]).reverse();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function sendMessage(
  projectId: string,
  content: string
): Promise<{ success: boolean; data?: ProjectMessage; error?: string }> {
  const text = content.trim();
  if (!text) return { success: false, error: 'Message is empty' };
  if (text.length > MAX_MESSAGE_LENGTH) {
    return { success: false, error: `Messages can be up to ${MAX_MESSAGE_LENGTH} characters` };
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return { success: false, error: 'Please sign in to send messages' };

    const { data, error } = await supabase
      .from('project_messages')
      .insert([{ project_id: projectId, user_id: authData.user.id, content: text }])
      .select('id, project_id, user_id, content, created_at')
      .single();

    if (error) {
      console.error('Error sending message:', error);
      if (error.message?.toLowerCase().includes('row-level security')) {
        return { success: false, error: 'Only team members can send messages in this project' };
      }
      return { success: false, error: error.message };
    }
    return { success: true, data: data as ProjectMessage };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Could not send message' };
  }
}

export async function deleteMessage(messageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('project_messages').delete().eq('id', messageId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { success: false, error: 'Could not delete message' };
  }
}

/**
 * Calls the handlers whenever a message is added or deleted in this project.
 * Returns a function that stops listening.
 */
export function subscribeToMessages(
  projectId: string,
  handlers: { onInsert: (message: ProjectMessage) => void; onDelete?: (messageId: string) => void }
): () => void {
  const channel = supabase
    .channel(`project-messages-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`,
      },
      (payload: any) => handlers.onInsert(payload.new as ProjectMessage)
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'project_messages',
      },
      (payload: any) => {
        const id = payload.old?.id;
        if (id && handlers.onDelete) handlers.onDelete(id);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/** Display names for a set of user IDs (from the profiles table). */
export async function getProfileNames(userIds: string[]): Promise<Record<string, string>> {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (ids.length === 0) return {};

  try {
    const { data, error } = await supabase.from('profiles').select('id, name, email').in('id', ids);
    if (error) throw error;

    const names: Record<string, string> = {};
    (data || []).forEach((profile: any) => {
      names[profile.id] = profile.name || profile.email?.split('@')[0] || 'Member';
    });
    return names;
  } catch (error) {
    console.error('Error fetching names:', error);
    return {};
  }
}
