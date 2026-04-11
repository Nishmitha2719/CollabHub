'use client';

import { useState, useEffect, useRef } from 'react';
import { BsPinAngleFill } from "react-icons/bs";
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
      router.push('/auth/login?redirectTo=/saved');
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
    <div className="py-12">
      <Container>
        <div>
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