'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/lib/AuthContext';
import { getProjectById, saveProject, type ProjectWithSkills } from '@/lib/api/projects';
import { createProjectRoles, getProjectRoles, type ProjectRole } from '@/lib/api/projectRoles';
import { useToast } from '@/components/ui/Toast';

const ApplyModal = dynamic(() => import('@/components/projects/ApplyModal'), {
  ssr: false,
});

const ApplicationsReview = dynamic(() => import('@/components/projects/ApplicationsReview'), {
  ssr: false,
  loading: () => <div className="glass rounded-2xl p-6 border border-white/10 text-center text-gray-400">Loading applications...</div>,
});

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [roles, setRoles] = useState<ProjectRole[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePositions, setNewRolePositions] = useState(1);
  const [addingRole, setAddingRole] = useState(false);
  const [roleActionMessage, setRoleActionMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [project, setProject] = useState<ProjectWithSkills | null>(null);
  const { addToast } = useToast();
  const projectId = Array.isArray(params.id) ? params.id[0] : String(params.id || '');
  
  const getSkillColorClass = (skill: string) => {
    const key = skill.toLowerCase();
    if (key.includes('node')) return 'skill-pill-purple';
    if (key.includes('react')) return 'skill-pill-orange';
    if (key.includes('data') || key.includes('analysis') || key.includes('sql') || key.includes('python')) return 'skill-pill-teal';
    return 'skill-pill-blue';
  };
  
  useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      if (!projectId) {
        if (mounted) {
          setNotice('Project not found or unavailable.');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setNotice('');
      try {
        const data = await getProjectById(projectId);
        if (!mounted) return;

        if (!data) {
          setNotice('Project not found or unavailable.');
          setProject(null);
        } else {
          setProject(data);
        }
      } catch (error) {
        if (!mounted) return;
        setNotice('Unable to load project details.');
        setProject(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProject();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  useEffect(() => {
    let mounted = true;

    const loadRoles = async () => {
      if (!projectId) {
        if (mounted) {
          setRoles([]);
          setRolesLoading(false);
        }
        return;
      }

      setRolesLoading(true);
      try {
        const projectRoles = await getProjectRoles(projectId);
        if (mounted) {
          setRoles(projectRoles);
        }
      } catch {
        if (mounted) {
          setRoles([]);
        }
      } finally {
        if (mounted) {
          setRolesLoading(false);
        }
      }
    };

    loadRoles();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  const availableRoles = roles.filter(
    (role) => Number(role.positions_filled) < Number(role.positions_available)
  );
  const isTeamFull = !rolesLoading && roles.length > 0 && availableRoles.length === 0;
  const isOwner = user?.id === project?.owner_id;

  const refreshProjectData = async () => {
    if (!projectId) return;
    const [projectData, projectRoles] = await Promise.all([
      getProjectById(projectId),
      getProjectRoles(projectId),
    ]);
    setProject(projectData);
    setRoles(projectRoles);
  };

  const handleApplyClick = async () => {
    if (!user) {
      router.push('/auth/login?redirectTo=/projects/' + projectId);
      return;
    }

    if (isTeamFull) {
      setNotice('Sorry, the team is full.');
      addToast({
        message: 'Sorry, the team is full',
        type: 'error',
      });
      return;
    }

    setIsApplyModalOpen(true);
  };

  const handleSave = async () => {
    if (!user) {
      router.push('/auth/login?redirectTo=/projects/' + projectId);
      return;
    }

    setSaving(true);
    setNotice('');
    try {
      const success = await saveProject(user.id, projectId);
      setNotice(success ? 'Project saved.' : 'Could not save project.');
    } catch (error: any) {
      setNotice(error?.message || 'Could not save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRole = async () => {
    if (!project) return;
    setRoleActionMessage('');

    const roleName = newRoleName.trim();
    if (!roleName) {
      setRoleActionMessage('Role name is required.');
      addToast({ message: 'Role name is required', type: 'error' });
      return;
    }
    if (newRolePositions < 1) {
      setRoleActionMessage('Positions must be at least 1.');
      addToast({ message: 'Positions must be at least 1', type: 'error' });
      return;
    }

    setAddingRole(true);
    const result = await createProjectRoles(project.id, [
      {
        role_name: roleName,
        description: newRoleDescription.trim() || '',
        positions_available: newRolePositions,
      },
    ]);
    setAddingRole(false);

    if (!result.success) {
      setRoleActionMessage(result.error || 'Failed to add role.');
      addToast({
        message: result.error || 'Failed to add role',
        type: 'error',
      });
      return;
    }

    setNewRoleName('');
    setNewRoleDescription('');
    setNewRolePositions(1);
    setRoleActionMessage('Role added successfully.');
    addToast({ message: 'Role added successfully', type: 'success' });
    await refreshProjectData();
  };

  if (loading) {
    return <Loader />;
  }

  if (!project) {
    return (
      <div className="py-12">
        <Container>
          <div className="glass rounded-2xl p-8 border border-white/10 text-center">
            <p className="text-gray-300 mb-4">{notice || 'Project not found.'}</p>
            <Button onClick={() => router.push('/projects')}>Back to Browse</Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-10 lg:py-12">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="glass rounded-2xl p-5 sm:p-6 lg:p-8 border border-white/10 mb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 break-words">{project.title}</h1>
                <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-2">
                    📁 <span>{project.category}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    📊 <span>{project.difficulty}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    ⏱️ <span>{project.duration}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    👥 <span>{project.team_size} members needed</span>
                  </span>
                  {project.is_paid && (
                    <span className="flex items-center gap-2 text-green-400">
                      💰 <span>Paid Project</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:shrink-0">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full px-6 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-all font-semibold sm:w-auto"
                >
                  {saving ? 'Saving...' : '🤍 Save'}
                </button>
                <Button onClick={handleApplyClick} disabled={rolesLoading || isTeamFull} className="w-full sm:w-auto">
                  {rolesLoading ? 'Checking Roles...' : isTeamFull ? 'Team is Full' : 'Apply Now'}
                </Button>
              </div>
            </div>
            {notice ? (
              <div className="mt-4 text-sm text-purple-300">{notice}</div>
            ) : null}

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
                {project.detailed_description || project.description}
              </p>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {(project.skills || []).map((skill, index) => (
                  <span
                    key={index}
                    className={`skill-pill text-sm font-medium px-4 py-2 ${getSkillColorClass(skill)}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {roles.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Open Roles</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {roles.map((role) => {
                    const available = Number(role.positions_available) - Number(role.positions_filled);
                    const full = available <= 0;

                    return (
                      <div
                        key={role.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-4"
                      >
                        <p className="text-white font-semibold">{role.role_name}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {full ? 'Team is full' : `${available} slot${available !== 1 ? 's' : ''} available`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Apply CTA */}
          <div className="glass rounded-2xl p-6 sm:p-8 lg:p-12 border border-white/10 text-center mt-8 sm:mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Interested in Joining?</h2>
            <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
              Apply now to be part of this exciting project. We&apos;ll review your application and get back to you soon!
            </p>
            <div className="flex flex-col gap-4 justify-center sm:flex-row">
              <Button
                onClick={handleApplyClick}
                size="lg"
                className="w-full px-12 sm:w-auto"
                disabled={rolesLoading || isTeamFull}
              >
                {rolesLoading ? 'Checking Roles...' : isTeamFull ? 'Team is Full' : 'Apply Now'}
              </Button>
              <Button
                onClick={() => router.push('/projects')}
                size="lg"
                variant="outline"
                className="w-full px-12 sm:w-auto"
              >
                Back to Browse
              </Button>
            </div>
          </div>
        </motion.div>

        {project && (
          <ApplyModal
            projectId={project.id}
            roles={roles}
            isOpen={isApplyModalOpen}
            onClose={() => setIsApplyModalOpen(false)}
            onSuccess={async () => {
              await refreshProjectData();
            }}
          />
        )}

        {project && isOwner && (
          <>
            <div className="mt-10 glass rounded-2xl p-5 sm:p-6 lg:p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Manage Roles</h2>
              <p className="text-gray-400 text-sm mb-6">
                Add roles to this project so applicants can choose a role while applying.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleAddRole();
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-[1fr_140px]">
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Role name (e.g., Frontend Developer)"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="number"
                    min={1}
                    value={newRolePositions}
                    onChange={(e) => setNewRolePositions(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Role description (optional)"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <Button
                  type="button"
                  onClick={() => void handleAddRole()}
                  disabled={addingRole}
                  className="w-full sm:w-auto"
                >
                  {addingRole ? 'Adding Role...' : 'Add Role'}
                </Button>
                {roleActionMessage ? (
                  <p className="text-sm text-gray-300">{roleActionMessage}</p>
                ) : null}
              </form>
            </div>

            <div className="mt-10">
              <ApplicationsReview projectId={project.id} onUpdated={refreshProjectData} />
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
