'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getProjectById } from '@/lib/api/projects';
import { getProjectRoles } from '@/lib/api/projectRoles';
import ApplyModal from '@/components/projects/ApplyModal';
import ApplicationsReview from '@/components/projects/ApplicationsReview';
import TeamRoster from '@/components/projects/TeamRoster';
import Container from '@/components/ui/Container';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * COMPLETE PROJECT DETAIL PAGE WITH APPLY-TO-PROJECT SYSTEM
 * 
 * This example shows how to integrate all three components:
 * 1. ApplyModal - for users to apply
 * 2. ApplicationsReview - for owners to review applications
 * 3. TeamRoster - to display team members
 * 
 * Copy this into app/projects/[id]/page.tsx and adjust as needed
 */

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'applications'>('overview');

  // Check if current user is the project owner
  const isOwner = user?.id === project?.owner_id;

  useEffect(() => {
    loadProjectData();
  }, [params.id]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      // Fetch project and roles in parallel
      const [projectData, rolesData] = await Promise.all([
        getProjectById(params.id),
        getProjectRoles(params.id),
      ]);

      if (!projectData) {
        throw new Error('Project not found');
      }

      setProject(projectData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Project not found</h2>
          <p className="text-gray-400">The project you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </Container>
    );
  }

  // Filter roles that have available positions
  const availableRoles = roles.filter(
    (r) => r.positions_filled < r.positions_available
  );

  // Total available positions across all roles
  const totalAvailable = availableRoles.reduce(
    (sum, r) => sum + (r.positions_available - r.positions_filled),
    0
  );

  return (
    <Container>
      <div className="py-12">
        {/* ===== HEADER SECTION ===== */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {project.title}
              </h1>
              <p className="text-xl text-gray-300">{project.description}</p>
            </div>

            {/* Status Badge */}
            <div>
              <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                {project.status || 'Open'}
              </span>
            </div>
          </div>

          {/* Project Meta Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide">Category</p>
              <p className="text-white font-bold mt-1">{project.category || 'N/A'}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide">Difficulty</p>
              <p className="text-white font-bold mt-1">{project.difficulty || 'Intermediate'}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide">Duration</p>
              <p className="text-white font-bold mt-1">{project.duration || 'TBD'}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide">Team Size</p>
              <p className="text-white font-bold mt-1">{project.team_size || project.team_size}</p>
            </div>
          </div>

          {/* Apply Button (for non-owners) */}
          {!isOwner && availableRoles.length > 0 && (
            <button
              onClick={() => setIsApplyOpen(true)}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Apply Now ({totalAvailable} position{totalAvailable !== 1 ? 's' : ''} available)
            </button>
          )}

          {/* Team Full Message */}
          {!isOwner && availableRoles.length === 0 && (
            <div className="px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-medium">
              🔴 Team is currently full. Check back later!
            </div>
          )}
        </div>

        {/* ===== TAB NAVIGATION ===== */}
        <div className="mb-8">
          <div className="flex gap-8 border-b border-white/10 overflow-x-auto">
            {/* Overview Tab */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Project Overview
            </button>

            {/* Team Tab */}
            <button
              onClick={() => setActiveTab('team')}
              className={`pb-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === 'team'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Team ({roles.reduce((sum, r) => sum + r.positions_filled, 0)}/
              {roles.reduce((sum, r) => sum + r.positions_available, 0)})
            </button>

            {/* Applications Tab (owner only) */}
            {isOwner && (
              <button
                onClick={() => setActiveTab('applications')}
                className={`pb-3 font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'applications'
                    ? 'text-white border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Applications
              </button>
            )}
          </div>
        </div>

        {/* ===== TAB CONTENT ===== */}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Open Positions */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Open Positions</h2>
              {roles.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center text-gray-400">
                  No roles defined for this project yet
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.map((role) => {
                    const available = role.positions_available - role.positions_filled;
                    const isFull = available <= 0;

                    return (
                      <div
                        key={role.id}
                        className={`border rounded-lg p-6 transition-colors ${
                          isFull
                            ? 'bg-white/5 border-white/10 opacity-75'
                            : 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/30 hover:border-purple-500/50'
                        }`}
                      >
                        <h3 className="text-xl font-bold text-white mb-2">
                          {role.role_name}
                        </h3>

                        {role.description && (
                          <p className="text-gray-300 text-sm mb-4">
                            {role.description}
                          </p>
                        )}

                        {/* Availability Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-400 mb-2">
                            <span>Positions</span>
                            <span className="font-bold">
                              {role.positions_filled}/{role.positions_available}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isFull
                                  ? 'bg-red-500'
                                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                              }`}
                              style={{
                                width: `${(role.positions_filled / role.positions_available) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            isFull
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-green-500/20 text-green-300'
                          }`}
                        >
                          {isFull ? '🔴 Full' : `✅ ${available} open`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Full Description */}
            {project.detailed_description && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">About the Project</h2>
                <div className="bg-white/5 border border-white/10 rounded-lg p-8">
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {project.detailed_description}
                  </p>
                </div>
              </div>
            )}

            {/* Skills Required */}
            {project.skills && project.skills.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Required Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {project.skills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
          <TeamRoster projectId={params.id} isOwner={isOwner} />
        )}

        {/* APPLICATIONS TAB (Owner Only) */}
        {activeTab === 'applications' && isOwner && (
          <ApplicationsReview projectId={params.id} projectOwnerId={user!.id} />
        )}
      </div>

      {/* ===== APPLY MODAL ===== */}
      <ApplyModal
        projectId={params.id}
        roles={availableRoles}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSuccess={() => {
          // Refresh project data to show updated positions_filled
          loadProjectData();
          // Also close the modal
          setIsApplyOpen(false);
        }}
      />
    </Container>
  );
}
