'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BsPinAngleFill } from "react-icons/bs";
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/home/ProjectCard';
import { getSavedProjects } from '@/lib/api/projects';
import { useAuth } from '@/lib/AuthContext';
import { SavedProject } from '@/types/database';

export default function SavedProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedProjects = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getSavedProjects(user.id);
      setSavedProjects(data || []);
    } catch (error) {
      console.error('Error loading saved projects:', error);
      setSavedProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirectTo=/saved');
      return;
    }
    loadSavedProjects();
  }, [user, router, loadSavedProjects]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
          <h1 className="text-4xl font-bold mb-2">
            Saved <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Projects you&apos;ve bookmarked for later
          </p>

          {savedProjects.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <div className="text-6xl mb-4 flex justify-center text-white">
                <BsPinAngleFill />
              </div>
              <p className="text-gray-400 mb-4 text-lg">No saved projects yet</p>
              <button
                onClick={() => router.push('/projects')}
                className="text-purple-400 hover:text-purple-300 text-lg font-semibold"
              >
                Browse projects to save →
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProjects.map((saved, index) => (
                <motion.div
                  key={saved.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {saved.project && (
                    <ProjectCard
                      id={saved.project.id}
                      title={saved.project.title}
                      description={saved.project.description}
                      skills={saved.project.skills?.map((s: any) => s.name) || []}
                      category={saved.project.category}
                      teamSize={saved.project.team_size}
                      applicants={0}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  );
}