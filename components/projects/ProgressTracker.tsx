'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  createTask,
  deleteTask,
  getProgressPercent,
  getTasks,
  TASK_STATUSES,
  updateTaskStatus,
  type ProjectTask,
  type TaskStatus,
} from '@/lib/api/tasks';
import { getProjectMembers } from '@/lib/api/projectMembers';
import { useToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProgressTrackerProps {
  projectId: string;
  /** Owner or active team member: can add and move tasks. */
  canEdit: boolean;
  isOwner: boolean;
  currentUserId?: string;
  owner?: { id: string; name: string };
}

const COLUMN_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

const COLUMN_ACCENTS: Record<TaskStatus, string> = {
  todo: 'border-t-slate-400/60',
  in_progress: 'border-t-amber-400/70',
  done: 'border-t-emerald-400/70',
};

function isOverdue(task: ProjectTask): boolean {
  if (!task.due_date || task.status === 'done') return false;
  const today = new Date().toISOString().slice(0, 10);
  return task.due_date < today;
}

export default function ProgressTracker({
  projectId,
  canEdit,
  isOwner,
  currentUserId,
  owner,
}: ProgressTrackerProps) {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [people, setPeople] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const [taskRows, members] = await Promise.all([getTasks(projectId), getProjectMembers(projectId)]);
      if (!mounted) return;

      const list: Array<{ id: string; name: string }> = [];
      if (owner) list.push({ id: owner.id, name: `${owner.name} (owner)` });
      members.forEach((member) => {
        if (!list.some((person) => person.id === member.user_id)) {
          list.push({
            id: member.user_id,
            name: member.user?.full_name || member.user?.email || 'Member',
          });
        }
      });

      setTasks(taskRows);
      setPeople(list);
      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [projectId, owner?.id, owner?.name]);

  const nameById = useMemo(() => {
    const map: Record<string, string> = {};
    people.forEach((person) => {
      map[person.id] = person.name.replace(/ \(owner\)$/, '');
    });
    return map;
  }, [people]);

  const percent = getProgressPercent(tasks);
  const doneCount = tasks.filter((task) => task.status === 'done').length;

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast({ message: 'Give the task a title', type: 'error' });
      return;
    }

    setAdding(true);
    const result = await createTask({
      project_id: projectId,
      title,
      due_date: dueDate || null,
      assigned_to: assignee || null,
    });
    setAdding(false);

    if (!result.success || !result.data) {
      addToast({ message: result.error || 'Could not add task', type: 'error' });
      return;
    }

    setTasks((prev) => [...prev, result.data as ProjectTask]);
    setTitle('');
    setDueDate('');
    setAssignee('');
  };

  const moveTask = async (task: ProjectTask, direction: -1 | 1) => {
    const index = TASK_STATUSES.indexOf(task.status);
    const next = TASK_STATUSES[index + direction];
    if (!next) return;

    setBusyId(task.id);
    const result = await updateTaskStatus(task.id, next);
    setBusyId(null);

    if (!result.success || !result.data) {
      addToast({ message: result.error || 'Could not update task', type: 'error' });
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? (result.data as ProjectTask) : t)));
  };

  const removeTask = async (task: ProjectTask) => {
    if (!confirm(`Delete "${task.title}"?`)) return;

    setBusyId(task.id);
    const result = await deleteTask(task.id);
    setBusyId(null);

    if (!result.success) {
      addToast({ message: result.error || 'Could not delete task', type: 'error' });
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Overall progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Project Progress</h3>
            <p className="text-sm text-gray-400">
              {tasks.length === 0
                ? 'No tasks yet'
                : `${doneCount} of ${tasks.length} task${tasks.length !== 1 ? 's' : ''} done`}
            </p>
          </div>
          <span className="text-3xl font-bold text-gradient">{percent}%</span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#6d28d9,#4f46e5)] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Add task */}
      {canEdit ? (
        <form onSubmit={handleAdd} className="mb-8 grid gap-3 md:grid-cols-[1fr_160px_200px_auto]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="New task, e.g. Set up the login page"
            className="w-full rounded-lg px-4 py-3"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg px-4 py-3"
            aria-label="Due date"
          />
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="select-dark w-full px-4 py-3"
            aria-label="Assign to"
          >
            <option value="">Unassigned</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={adding}
            className="rounded-lg bg-[linear-gradient(135deg,#6d28d9,#4f46e5)] px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      ) : (
        <p className="mb-8 text-sm text-gray-500">Only the project owner and team members can add or move tasks.</p>
      )}

      {/* Board */}
      <div className="grid gap-4 md:grid-cols-3">
        {TASK_STATUSES.map((status, columnIndex) => {
          const columnTasks = tasks.filter((task) => task.status === status);
          return (
            <div
              key={status}
              className={`rounded-xl border border-white/10 border-t-2 bg-white/5 p-4 ${COLUMN_ACCENTS[status]}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-semibold text-white">{COLUMN_LABELS[status]}</h4>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnTasks.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">Nothing here</p>
                ) : (
                  columnTasks.map((task) => {
                    const canDelete = isOwner || (!!currentUserId && task.created_by === currentUserId);
                    const busy = busyId === task.id;
                    return (
                      <div key={task.id} className="rounded-lg border border-white/10 bg-[var(--bg-surface)] p-3">
                        <p
                          className={`font-medium break-words ${
                            task.status === 'done' ? 'text-gray-400 line-through' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                          {task.assigned_to ? (
                            <span>👤 {nameById[task.assigned_to] || 'Member'}</span>
                          ) : null}
                          {task.due_date ? (
                            <span className={isOverdue(task) ? 'text-red-400' : ''}>
                              📅 {new Date(`${task.due_date}T00:00:00`).toLocaleDateString()}
                              {isOverdue(task) ? ' (overdue)' : ''}
                            </span>
                          ) : null}
                        </div>

                        {canEdit && (
                          <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-2">
                            <button
                              onClick={() => moveTask(task, -1)}
                              disabled={busy || columnIndex === 0}
                              className="rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-30"
                              aria-label="Move back"
                            >
                              ←
                            </button>
                            <button
                              onClick={() => moveTask(task, 1)}
                              disabled={busy || columnIndex === TASK_STATUSES.length - 1}
                              className="rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-30"
                              aria-label="Move forward"
                            >
                              →
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => removeTask(task)}
                                disabled={busy}
                                className="ml-auto rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-30"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
