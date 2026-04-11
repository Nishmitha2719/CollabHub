'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/lib/AuthContext';
import { applyToProject, getProjectById, saveProject, type ProjectWithSkills } from '@/lib/api/projects';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [project, setProject] = useState<ProjectWithSkills | null>(null);
  
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
      setLoading(true);
      setNotice('');
      try {
        const projectId = String(params.id);
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
  }, [params.id]);

  const handleApply = async () => {
    if (!user) {
      router.push('/auth/login?redirectTo=/projects/' + params.id);
      return;
    }

    setApplying(true);
    setNotice('');
    try {
      const projectId = String(params.id);
      const success = await applyToProject(user.id, projectId);
      setNotice(success ? 'Application submitted successfully.' : 'Could not submit application. Please try again.');
    } catch (error: any) {
      // Handle duplicate apply or other backend errors without a mock message.
      setNotice(error?.message || 'Could not submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      router.push('/auth/login?redirectTo=/projects/' + params.id);
      return;
    }

    setSaving(true);
    setNotice('');
    try {
      const projectId = String(params.id);
      const success = await saveProject(user.id, projectId);
      setNotice(success ? 'Project saved.' : 'Could not save project.');
    } catch (error: any) {
      setNotice(error?.message || 'Could not save project.');
    } finally {
      setSaving(false);
    }
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
    <div className="py-12">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="glass rounded-2xl p-8 border border-white/10 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
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
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-all font-semibold"
                >
                  {saving ? 'Saving...' : '🤍 Save'}
                </button>
                <Button onClick={handleApply} disabled={applying}>
                  {applying ? 'Applying...' : 'Apply Now'}
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
          </div>

          {/* Apply CTA */}
          <div className="glass rounded-2xl p-12 border border-white/10 text-center">
            <h2 className="text-3xl font-bold mb-4">Interested in Joining?</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Apply now to be part of this exciting project. We&apos;ll review your application and get back to you soon!
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleApply} size="lg" className="px-12">
                Apply Now
              </Button>
              <button
                onClick={() => router.push('/projects')}
                className="px-12 py-4 glass border-2 border-white/10 text-white font-semibold rounded-lg hover:bg-white/5 transition-all"
              >
                Back to Browse
              </button>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
