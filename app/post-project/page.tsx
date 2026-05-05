'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { createProject, getAllSkills } from '@/lib/api/projects';
import { useAuth } from '@/lib/AuthContext';
import { Skill, CreateProjectData } from '@/types/database';

export default function PostProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    detailed_description: '',
    difficulty: 'Intermediate',
    duration: '1-2 months',
    team_size: 3,
    is_paid: false,
    budget: '',
    deadline: '',
    category: 'Web Dev',
    skills: [],
    roles: [{ role_name: '', description: '', positions_available: 1 }],
    milestones: [],
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login?redirectTo=/post-project');
      return;
    }
    loadSkills();
  }, [user, authLoading, router]);

  if (authLoading) {
    return <Loader />;
  }

  const loadSkills = async () => {
    try {
      const data = await getAllSkills();
      setSkills(data);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Project title is required');
        setLoading(false);
        return;
      }
      if (!formData.description.trim()) {
        setError('Short description is required');
        setLoading(false);
        return;
      }
      if (formData.skills.length === 0) {
        setError('Please select at least one skill');
        setLoading(false);
        return;
      }
      const validRoles = formData.roles.filter(
        (role) => role.role_name.trim().length > 0 && Number(role.positions_available) > 0
      );
      if (validRoles.length === 0) {
        setError('Please add at least one valid role with available positions');
        setLoading(false);
        return;
      }

      const result = await createProject(
        {
          title: formData.title,
          description: formData.description,
          detailed_description: formData.detailed_description,
          difficulty: formData.difficulty,
          duration: formData.duration,
          team_size: formData.team_size,
          is_paid: formData.is_paid,
          budget: formData.budget,
          deadline: formData.deadline,
          category: formData.category,
          owner_id: user.id,
        },
        formData.skills,
        validRoles
      );

      if (!result.success) {
        setError(result.error || 'Failed to create project. Please try again.');
        console.error('Project creation failed:', result.error);
        return;
      }

      setSuccess('✓ Project posted successfully! Your project is now pending admin approval.');
      console.log('Project created:', result.data?.id);
      
      setTimeout(() => {
        router.push(`/projects/${result.data?.id}`);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error posting project:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRole = () => {
    setFormData({
      ...formData,
      roles: [...formData.roles, { role_name: '', description: '', positions_available: 1 }],
    });
  };

  const removeRole = (index: number) => {
    setFormData({
      ...formData,
      roles: formData.roles.filter((_, i) => i !== index),
    });
  };

  const updateRole = (index: number, field: string, value: any) => {
    const newRoles = [...formData.roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setFormData({ ...formData, roles: newRoles });
  };

  return (
    <div className="py-12">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-2">
            Post a <span className="text-gradient">Project</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Create a new project and find your dream team
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="glass rounded-2xl p-4 border border-red-500/50 bg-red-500/10">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="glass rounded-2xl p-4 border border-green-500/50 bg-green-500/10">
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}
            {/* Basic Info */}
            <div className="glass rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Basic Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="AI-Powered Study Assistant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Short Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Brief description for project cards"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Detailed Description</label>
                  <textarea
                    value={formData.detailed_description}
                    onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={6}
                    placeholder="Detailed project description, goals, requirements..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 select-dark"
                    >
                      <option value="AI/ML">AI/ML</option>
                      <option value="Web Dev">Web Dev</option>
                      <option value="Mobile">Mobile</option>
                      <option value="IoT">IoT</option>
                      <option value="Blockchain">Blockchain</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty *</label>
                    <select
                      required
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full px-4 py-3 select-dark"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration *</label>
                    <select
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 select-dark"
                    >
                      <option value="1-2 weeks">1-2 weeks</option>
                      <option value="3-4 weeks">3-4 weeks</option>
                      <option value="1-2 months">1-2 months</option>
                      <option value="2-3 months">2-3 months</option>
                      <option value="3+ months">3+ months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Team Size *</label>
                    <input
                      type="number"
                      required
                      min="2"
                      max="20"
                      value={formData.team_size}
                      onChange={(e) => setFormData({ ...formData, team_size: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_paid}
                      onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                      className="mr-2"
                    />
                    <span>This is a paid project</span>
                  </label>
                </div>

                {formData.is_paid && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Budget</label>
                    <input
                      type="text"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., $1000-2000"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="glass rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Required Skills *</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {skills.map((skill) => (
                  <label key={skill.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, skills: [...formData.skills, skill.id] });
                        } else {
                          setFormData({ ...formData, skills: formData.skills.filter(id => id !== skill.id) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Roles */}
            <div className="glass rounded-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Roles Needed</h2>
                <button
                  type="button"
                  onClick={addRole}
                  className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition text-sm"
                >
                  + Add Role
                </button>
              </div>

              <div className="space-y-4">
                {formData.roles.map((role, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <input
                          type="text"
                          placeholder="Role name (e.g., Frontend Developer)"
                          value={role.role_name}
                          onChange={(e) => updateRole(index, 'role_name', e.target.value)}
                          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="Positions"
                          value={role.positions_available}
                          onChange={(e) => updateRole(index, 'positions_available', parseInt(e.target.value))}
                          className="w-24 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
                        />
                        {formData.roles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRole(index)}
                            className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <textarea
                        placeholder="Role description"
                        value={role.description}
                        onChange={(e) => updateRole(index, 'description', e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Posting...' : 'Post Project'}
              </Button>
            </div>
          </form>
        </motion.div>
      </Container>
    </div>
  );
}