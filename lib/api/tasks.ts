import { supabase } from '../supabaseClient';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigned_to: string | null;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

/** Percentage of tasks marked done (0 when there are no tasks). */
export function getProgressPercent(tasks: ProjectTask[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((task) => task.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
}

export async function getTasks(projectId: string): Promise<ProjectTask[]> {
  try {
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as ProjectTask[];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function createTask(input: {
  project_id: string;
  title: string;
  description?: string;
  assigned_to?: string | null;
  due_date?: string | null;
}): Promise<{ success: boolean; data?: ProjectTask; error?: string }> {
  const title = input.title.trim();
  if (!title) return { success: false, error: 'Task title is required' };
  if (title.length > 200) return { success: false, error: 'Task title must be 200 characters or fewer' };

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return { success: false, error: 'Please sign in to add tasks' };

    const { data, error } = await supabase
      .from('project_tasks')
      .insert([
        {
          project_id: input.project_id,
          title,
          description: input.description?.trim() || null,
          assigned_to: input.assigned_to || null,
          due_date: input.due_date || null,
          status: 'todo',
          created_by: authData.user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data as ProjectTask };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error: 'Could not add task' };
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<{ success: boolean; data?: ProjectTask; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('project_tasks')
      .update({ status })
      .eq('id', taskId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }
    if (!data) return { success: false, error: 'You do not have permission to update this task' };
    return { success: true, data: data as ProjectTask };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error: 'Could not update task' };
  }
}

export async function deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId)
      .select('id');

    if (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }
    if (!data || data.length === 0) {
      return { success: false, error: 'Only the project owner or the task creator can delete it' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: 'Could not delete task' };
  }
}
