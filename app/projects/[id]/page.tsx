'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';
import { applyToProject, saveProject } from '@/lib/api/projects';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  
  // Mock project data
  const mockProject = {
    id: params.id,
    title: 'AI-Powered Study Assistant',
    description: 'Build an intelligent study companion using GPT-4 and React. Help students learn more effectively with personalized recommendations.',
    detailed_description: `We're building an AI-powered study assistant that helps students learn more effectively. The app will use GPT-4 to provide personalized learning recommendations, generate practice questions, and explain complex concepts in simple terms.

Key Features:
- Personalized study plans based on learning style
- AI-generated practice questions and quizzes
- Concept explanations with examples
- Progress tracking and analytics
- Integration with popular learning platforms

Tech Stack:
- Frontend: React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python
- AI: OpenAI GPT-4 API
- Database: PostgreSQL`,
    category: 'AI/ML',
    difficulty: 'Intermediate',
    duration: '2-3 months',
    team_size: 4,
    is_paid: false,
    skills: ['React', 'Python', 'OpenAI API', 'FastAPI', 'PostgreSQL'],
    roles: [
      { name: 'Frontend Developer', description: 'Build responsive UI with React', positions: 2 },
      { name: 'Backend Developer', description: 'Develop API with FastAPI', positions: 1 },
      { name: 'ML Engineer', description: 'Integrate GPT-4 and optimize prompts', positions: 1 },
    ],
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleApply = async () => {
    if (!user) {
      router.push('/auth/login?redirectTo=/projects/' + params.id);
      return;
    }

    setApplying(true);
    setNotice('');
    try {
      await applyToProject(String(params.id), user.id);
      setNotice('Application submitted successfully.');
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
      await saveProject(String(params.id), user.id);
      setNotice('Project saved.');
    } catch (error: any) {
      setNotice(error?.message || 'Could not save project.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
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
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{mockProject.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-2">
                    📁 <span>{mockProject.category}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    📊 <span>{mockProject.difficulty}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    ⏱️ <span>{mockProject.duration}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    👥 <span>{mockProject.team_size} members needed</span>
                  </span>
                  {mockProject.is_paid && (
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
                {mockProject.detailed_description}
              </p>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {mockProject.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Roles Needed */}
          <div className="glass rounded-2xl p-8 border border-white/10 mb-8">
            <h2 className="text-2xl font-bold mb-6">Roles Needed</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {mockProject.roles.map((role, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-2">{role.name}</h3>
                  <p className="text-gray-400 mb-4">{role.description}</p>
                  <div className="text-sm text-purple-400 font-semibold">
                    {role.positions} {role.positions === 1 ? 'position' : 'positions'} available
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Apply CTA */}
          <div className="glass rounded-2xl p-12 border border-white/10 text-center">
            <h2 className="text-3xl font-bold mb-4">Interested in Joining?</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Apply now to be part of this exciting project. We'll review your application and get back to you soon!
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
