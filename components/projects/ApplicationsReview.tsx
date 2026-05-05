'use client';

import { useEffect, useState } from 'react';
import {
  getProjectApplications,
  approveApplication,
  rejectApplication,
  ApplicationWithDetails,
} from '@/lib/api/applications';
import { useToast } from '../ui/Toast';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ApplicationsReviewProps {
  projectId: string;
  onUpdated?: () => Promise<void> | void;
}

export default function ApplicationsReview({
  projectId,
  onUpdated,
}: ApplicationsReviewProps) {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOnId, setActingOnId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { addToast } = useToast();

  const normalizeStatus = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'approved') return 'accepted';
    if (normalized === 'disapproved') return 'rejected';
    return normalized;
  };

  useEffect(() => {
    loadApplications();
  }, [projectId]);

  const loadApplications = async () => {
    setLoading(true);
    const apps = await getProjectApplications(projectId);
    setApplications(apps);
    setLoading(false);
  };

  const handleApprove = async (applicationId: string, roleId: string) => {
    setActingOnId(applicationId);

    const result = await approveApplication(applicationId, projectId, roleId);

    if (result.success) {
      await loadApplications();
      await onUpdated?.();
      addToast({
        message: 'Application approved! User added to project team.',
        type: 'success',
      });
    } else {
      addToast({
        message: result.error || 'Failed to approve application',
        type: 'error',
      });
    }

    setActingOnId(null);
  };

  const handleReject = async (applicationId: string) => {
    setActingOnId(applicationId);

    const result = await rejectApplication(applicationId);

    if (result.success) {
      await loadApplications();
      await onUpdated?.();
      addToast({
        message: 'Application rejected',
        type: 'success',
      });
    } else {
      addToast({
        message: result.error || 'Failed to reject application',
        type: 'error',
      });
    }

    setActingOnId(null);
  };

  const filteredApplications = applications.filter(
    (app) =>
      filterStatus === 'all' ||
      normalizeStatus(app.status) === filterStatus.toLowerCase()
  );

  const stats = {
    pending: applications.filter((a) => normalizeStatus(a.status) === 'pending').length,
    accepted: applications.filter((a) => normalizeStatus(a.status) === 'accepted').length,
    rejected: applications.filter((a) => normalizeStatus(a.status) === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-yellow-400 text-2xl font-bold">{stats.pending}</div>
          <div className="text-gray-400 text-sm mt-1">Pending Applications</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-green-400 text-2xl font-bold">{stats.accepted}</div>
          <div className="text-gray-400 text-sm mt-1">Approved</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-red-400 text-2xl font-bold">{stats.rejected}</div>
          <div className="text-gray-400 text-sm mt-1">Rejected</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filterStatus === status
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
            No {filterStatus !== 'all' ? filterStatus : ''} applications
          </div>
        ) : (
          filteredApplications.map((app) => (
            (() => {
              const normalizedStatus = normalizeStatus(app.status);
              return (
            <div
              key={app.id}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    {app.user?.full_name || app.user?.name || 'Unknown User'}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {app.user?.email}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    normalizedStatus === 'accepted'
                      ? 'bg-green-500/20 text-green-300'
                      : normalizedStatus === 'rejected'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}
                >
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>

              {/* Role & Message */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Applied Role
                  </p>
                  <p className="text-white font-medium">
                    {app.role?.role_name || 'Unknown Role'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {app.role?.positions_available - app.role?.positions_filled}{' '}
                    slots available
                  </p>
                </div>

                {app.message && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Message
                    </p>
                    <p className="text-gray-300 text-sm mt-1">{app.message}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Applied on {new Date(app.applied_at).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              {normalizedStatus === 'pending' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleApprove(app.id, app.role_id)}
                    disabled={actingOnId === app.id}
                    className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {actingOnId === app.id ? '...' : '✓ Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(app.id)}
                    disabled={actingOnId === app.id}
                    className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {actingOnId === app.id ? '...' : '✗ Reject'}
                  </button>
                </div>
              )}
            </div>
              );
            })()
          ))
        )}
      </div>
    </div>
  );
}
