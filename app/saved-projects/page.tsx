'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/home/ProjectCard';
import { getSavedProjects } from '@/lib/api/projects';
import { useAuth } from '@/lib/AuthContext';
import Loader from '@/components/ui/Loader';
import type { ProjectWithSkills } from '@/lib/api/projects';

export default function SavedProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [savedProjects, setSavedProjects] = useState<ProjectWithSkills[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      router.push('/auth/login?redirectTo=/saved-projects');
      return;
    }

    if (loadedForUserRef.current === user.id && savedProjects.length > 0) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const loadSavedProjects = async () => {
      setLoading(true);
      try {
        const data = await getSavedProjects(user.id, 20);
        if (!mounted) return;
        setSavedProjects(data || []);
        loadedForUserRef.current = user.id;
      } catch (error) {
        if (!mounted) return;
        console.error('Error loading saved projects:', error);
        setSavedProjects([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSavedProjects();

    return () => {
      mounted = false;
    };
  }, [user, authLoading, router, savedProjects.length]);

  if (authLoading || loading) {
    return <Loader />;
  }

  return (
    <div className="py-14 pb-20 sm:py-16 sm:pb-24 lg:py-20 lg:pb-28">
      <Container>
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-3 text-4xl font-bold md:text-5xl">
            Saved <span className="text-gradient">Projects</span>
          </h1>
          <p className="mb-10 max-w-2xl text-gray-400 sm:mb-12">
            Projects you&apos;ve bookmarked for later
          </p>

          {savedProjects.length === 0 ? (
            <div className="glass rounded-2xl border border-white/10 p-10 text-center sm:p-12">
              <p className="mb-4 text-gray-400">No saved projects yet</p>
              <button
                onClick={() => router.push('/projects')}
                className="text-purple-400 hover:text-purple-300"
              >
                Browse projects to save
              </button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
              {savedProjects.map((project) => (
                <div key={project.id}>
                  <ProjectCard
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    skills={project.skills || []}
                    category={project.category}
                    teamSize={project.team_size}
                    applicants={0}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}