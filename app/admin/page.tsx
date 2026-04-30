'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { getAllProjects, getPendingProjects, approveProject, rejectProject, deleteProject } from '@/lib/api/projects';
import { isUserAdmin } from '@/lib/api/profiles';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { ProjectWithSkills } from '@/lib/api/projects';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [projects, setProjects] = useState<ProjectWithSkills[]>([]);
  const [pendingProjects, setPendingProjects] = useState<ProjectWithSkills[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAdminAndFetch() {
      if (authLoading) {
        return;
      }

      console.log('User:', user);

      if (!user) {
        if (!cancelled) {
          router.push('/auth/login?redirectTo=/admin');
        }
        return;
      }

      const adminStatus = await isUserAdmin(user.id);
      console.log('Admin status:', adminStatus);

      if (!adminStatus) {
        if (!cancelled) {
          setAccessDenied(true);
          setLoading(false);
        }
        return;
      }

      try {
        const pending = await getPendingProjects(200);
        const all = await getAllProjects(200);

        if (!cancelled) {
          setIsAdmin(true);
          setPendingProjects(pending);
          setProjects(all);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load projects');
          setLoading(false);
        }
      }
    }

    checkAdminAndFetch();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const handleApprove = async (projectId: string) => {
    setActionLoading(projectId);
    const success = await approveProject(projectId);
    if (success) {
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: 'approved' as const } : p));
      addToast({
        message: 'Project approved successfully!',
        type: 'success',
      });
    } else {
      addToast({
        message: 'Failed to approve project. Please try again.',
        type: 'error',
      });
    }
    setActionLoading(null);
  };

  const handleReject = async (projectId: string) => {
    setActionLoading(projectId);
    const success = await rejectProject(projectId);
    if (success) {
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: 'rejected' as const } : p));
      addToast({
        message: 'Project rejected successfully.',
        type: 'success',
      });
    } else {
      addToast({
        message: 'Failed to reject project. Please try again.',
        type: 'error',
      });
    }
    setActionLoading(null);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    setActionLoading(projectId);
    const success = await deleteProject(projectId);
    if (success) {
      setProjects(projects.filter(p => p.id !== projectId));
      addToast({
        message: 'Project deleted successfully.',
        type: 'success',
      });
    } else {
      addToast({
        message: 'Failed to delete project. Please try again.',
        type: 'error',
      });
    }
    setActionLoading(null);
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white text-lg mt-6">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-3xl p-12 max-w-md text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-3xl font-bold text-red-400 mb-3">Error Loading Dashboard</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
          <p className="text-gray-400 mb-8">You don't have permission to access the admin dashboard. Only administrators can view this page.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-300"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const approvedProjects = projects.filter(p => p.status === 'approved');
  const rejectedProjects = projects.filter(p => p.status === 'rejected');

  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Manage and approve projects</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-yellow-500/30 transition-colors">
            <div className="text-yellow-400 text-3xl font-bold">{pendingProjects.length}</div>
            <div className="text-gray-400 mt-1">Pending Review</div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-green-500/30 transition-colors">
            <div className="text-green-400 text-3xl font-bold">{approvedProjects.length}</div>
            <div className="text-gray-400 mt-1">Approved</div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-red-500/30 transition-colors">
            <div className="text-red-400 text-3xl font-bold">{rejectedProjects.length}</div>
            <div className="text-gray-400 mt-1">Rejected</div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Pending Projects ({pendingProjects.length})</h2>
          {pendingProjects.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-gray-400">
              No pending projects
            </div>
          ) : (
            <div className="space-y-6">
              {pendingProjects.map(project => (
                <ProjectCard key={project.id} project={project} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} actionLoading={actionLoading} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">All Projects ({projects.length})</h2>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Owner</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {projects.map(project => (
                  <tr key={project.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-sm font-medium">{project.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{project.owner?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{project.category}</td>
                    <td className="px-6 py-4 text-sm"><StatusBadge status={project.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={actionLoading === project.id}
                        className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading === project.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function ProjectCard({ project, onApprove, onReject, onDelete, actionLoading }: any) {
  const isLoading = actionLoading === project.id;
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold mb-2">{project.title}</h3>
          <p className="text-gray-400 text-sm mb-3">{project.description}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>📁 {project.category}</span>
            <span>👥 {project.team_size}</span>
            <span>⏱️ {project.duration}</span>
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>
      {project.skills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills.map((skill: string, i: number) => (
            <span key={i} className="skill-pill text-xs px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full">{skill}</span>
          ))}
        </div>
      )}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <button
          onClick={() => onApprove(project.id)}
          disabled={isLoading || project.status === 'approved'}
          className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Processing...' : '✓ Approve'}
        </button>
        <button
          onClick={() => onReject(project.id)}
          disabled={isLoading || project.status === 'rejected'}
          className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Processing...' : '✗ Reject'}
        </button>
        <button
          onClick={() => onDelete(project.id)}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-300 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
