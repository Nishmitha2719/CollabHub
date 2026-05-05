'use client';

import { useEffect, useState } from 'react';
import { getProjectMembers, removeProjectMember, ProjectMember } from '@/lib/api/projectMembers';
import { useToast } from '../ui/Toast';
import LoadingSpinner from '../ui/LoadingSpinner';

interface TeamRosterProps {
  projectId: string;
  isOwner?: boolean;
}

export default function TeamRoster({ projectId, isOwner = false }: TeamRosterProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  const loadMembers = async () => {
    setLoading(true);
    const projectMembers = await getProjectMembers(projectId);
    setMembers(projectMembers);
    setLoading(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    setRemoving(memberId);
    const result = await removeProjectMember(memberId);

    if (result.success) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      addToast({
        message: 'Member removed from project',
        type: 'success',
      });
    } else {
      addToast({
        message: result.error || 'Failed to remove member',
        type: 'error',
      });
    }

    setRemoving(null);
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
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Project Team</h3>
        <p className="text-gray-400">
          {members.length} member{members.length !== 1 ? 's' : ''} on this project
        </p>
      </div>

      {members.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
          No team members yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {member.user?.avatar_url ? (
                  <img
                    src={member.user.avatar_url}
                    alt={member.user.full_name || 'Member'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {(member.user?.full_name || 'U')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">
                    {member.user?.full_name || 'Unknown'}
                  </h4>
                  <p className="text-xs text-purple-400 font-medium">
                    {member.role}
                  </p>
                  {member.user?.email && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {member.user.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                <span>
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                </span>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={removing === member.id}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {removing === member.id ? '...' : 'Remove'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
