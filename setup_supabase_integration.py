#!/usr/bin/env python3
"""
Complete Supabase Integration Setup Script
"""
import os
import shutil

def setup_supabase():
    print("="*50)
    print("COLLABHUB SUPABASE INTEGRATION SETUP")
    print("="*50)
    print()

    # Create admin directory
    admin_dir = os.path.join('app', 'admin')
    os.makedirs(admin_dir, exist_ok=True)
    print(f"✓ Created {admin_dir} directory")

    # Create admin page.tsx
    admin_page_content = '''('use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { getAllProjects, approveProject, rejectProject, deleteProject } from '@/lib/api/projects';
import { isUserAdmin } from '@/lib/api/profiles';
import type { ProjectWithSkills } from '@/lib/api/projects';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithSkills[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminAndFetch() {
      if (authLoading) return;

      if (!user) {
        router.push('/auth/login?redirect=/admin');
        return;
      }

      const adminStatus = await isUserAdmin(user.id);
      if (!adminStatus) {
        alert('Access denied. Admin only.');
        router.push('/');
        return;
      }

      setIsAdmin(true);

      const allProjects = await getAllProjects();
      setProjects(allProjects);
      setLoading(false);
    }

    checkAdminAndFetch();
  }, [user, authLoading, router]);

  const handleApprove = async (projectId: string) => {
    setActionLoading(projectId);
    const success = await approveProject(projectId);
    if (success) {
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, status: 'approved' as const } : p
      ));
      alert('Project approved!');
    } else {
      alert('Failed to approve project');
    }
    setActionLoading(null);
  };

  const handleReject = async (projectId: string) => {
    setActionLoading(projectId);
    const success = await rejectProject(projectId);
    if (success) {
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, status: 'rejected' as const } : p
      ));
      alert('Project rejected');
    } else {
      alert('Failed to reject project');
    }
    setActionLoading(null);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      return;
    }

    setActionLoading(projectId);
    const success = await deleteProject(projectId);
    if (success) {
      setProjects(projects.filter(p => p.id !== projectId));
      alert('Project deleted');
    } else {
      alert('Failed to delete project');
    }
    setActionLoading(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pendingProjects = projects.filter(p => p.status === 'pending');
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
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-yellow-400 text-3xl font-bold">{pendingProjects.length}</div>
            <div className="text-gray-400 mt-1">Pending Review</div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-green-400 text-3xl font-bold">{approvedProjects.length}</div>
            <div className="text-gray-400 mt-1">Approved</div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-red-400 text-3xl font-bold">{rejectedProjects.length}</div>
            <div className="text-gray-400 mt-1">Rejected</div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            Pending Projects ({pendingProjects.length})
          </h2>

          {pendingProjects.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <p className="text-gray-400">No pending projects to review</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            All Projects ({projects.length})
          </h2>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Owner</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-sm text-white font-medium">{project.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{project.owner?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{project.category}</td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(project.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(project.id)}
                          disabled={actionLoading === project.id}
                          className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
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
      </div>
    </div>
  );
}

function ProjectCard({ project, onApprove, onReject, onDelete, actionLoading }: {
  project: ProjectWithSkills;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  actionLoading: string | null;
}) {
  const isLoading = actionLoading === project.id;

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
          <p className="text-gray-400 text-sm mb-3">{project.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>📂 {project.category}</span>
            <span>👥 {project.team_size} members</span>
            <span>⏱️ {project.duration}</span>
            {project.is_paid && <span className="text-green-400">💰 Paid</span>}
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {project.skills && project.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        <button
          onClick={() => onApprove(project.id)}
          disabled={isLoading || project.status === 'approved'}
          className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : '✓ Approve'}
        </button>
        <button
          onClick={() => onReject(project.id)}
          disabled={isLoading || project.status === 'rejected'}
          className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : '✗ Reject'}
        </button>
        <button
          onClick={() => onDelete(project.id)}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition disabled:opacity-50"
        >
          🗑️ Delete
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
'''

    admin_page_path = os.path.join(admin_dir, 'page.tsx')
    with open(admin_page_path, 'w', encoding='utf-8') as f:
        f.write(admin_page_content.strip().replace("'''", ""))
    
    print(f"✓ Created {admin_page_path}")
    print()
    print("="*50)
    print("SETUP COMPLETE!")
    print("="*50)
    print()
    print("📋 NEXT STEPS:")
    print()
    print("1. Run the SQL schema in your Supabase dashboard:")
    print("   - Open: supabase_collabhub_schema.sql")
    print("   - Go to Supabase SQL Editor")
    print("   - Paste and Run")
    print()
    print("2. Make yourself admin after signup:")
    print("   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';")
    print()
    print("3. Start the dev server:")
    print("   npm run dev")
    print()
    print("4. Test:")
    print("   ✓ Sign up at /auth/signup")
    print("   ✓ Post project at /post-project")
    print("   ✓ Approve at /admin")
    print("   ✓ Browse at /browse")
    print()

if __name__ == '__main__':
    try:
        setup_supabase()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
