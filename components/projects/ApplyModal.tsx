'use client';

import { useState } from 'react';
import { applyToProject } from '@/lib/api/applications';
import { ProjectRole } from '@/lib/api/projectRoles';
import { useToast } from '../ui/Toast';

interface ApplyModalProps {
  projectId: string;
  roles: ProjectRole[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ApplyModal({
  projectId,
  roles,
  isOpen,
  onClose,
  onSuccess,
}: ApplyModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const availableRoles = roles.filter(
    (r) => Number(r.positions_filled) < Number(r.positions_available)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      addToast({
        message: 'Please select a role',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    const result = await applyToProject(projectId, selectedRole, message);

    if (result.success) {
      addToast({
        message: 'Application submitted successfully!',
        type: 'success',
      });
      setSelectedRole('');
      setMessage('');
      onClose();
      onSuccess?.();
    } else {
      addToast({
        message: result.error || 'Failed to submit application',
        type: 'error',
      });
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-white/10 max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Apply to Project</h2>
          <p className="text-gray-400">Select your role and tell us why you&apos;re interested</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role <span className="text-red-400">*</span>
            </label>
            {roles.length === 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-300">
                No roles are available for this project yet.
              </div>
            ) : availableRoles.length === 0 ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                All roles are currently full
              </div>
            ) : (
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="">Choose a role...</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name} ({role.positions_available - role.positions_filled} slot
                    {role.positions_available - role.positions_filled !== 1 ? 's' : ''})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Why are you interested? <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the project owner about your experience and why you'd be a great fit..."
              rows={4}
              className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRole || availableRoles.length === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
