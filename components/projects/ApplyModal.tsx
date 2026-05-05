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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl sm:max-h-[90vh] sm:rounded-2xl sm:p-6 lg:max-w-xl">
        {/* Header */}
        <div className="mb-6 pr-8 sm:pr-10">
          <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">Apply to Project</h2>
          <p className="text-sm text-gray-400 sm:text-base">Select your role and tell us why you&apos;re interested</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Role <span className="text-red-400">*</span>
            </label>
            {roles.length === 0 ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
                No roles are available for this project yet.
              </div>
            ) : availableRoles.length === 0 ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                All roles are currently full
              </div>
            ) : (
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white transition-colors focus:border-purple-500 focus:outline-none"
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
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Why are you interested? <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the project owner about your experience and why you'd be a great fit..."
              rows={4}
              className="w-full resize-none rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg bg-slate-700 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRole || availableRoles.length === 0}
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 font-medium text-white transition-all hover:from-purple-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition-colors hover:text-white sm:right-4 sm:top-4"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
