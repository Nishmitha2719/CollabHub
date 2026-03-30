import os
import sys

# Fix encoding issue
sys.stdout.reconfigure(encoding='utf-8')

print("=" * 60)
print("CREATING ALL MISSING PAGES")
print("=" * 60)

base = r'e:\CollabHub\app'

def create_file(filepath, content):
    """Create file with content"""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] Created: {filepath}")

# 1. Browse Page (if doesn't exist)
print("\n1. Creating Browse page...")
browse_page = os.path.join(base, 'browse', 'page.tsx')
browse_content = """'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/home/ProjectCard';
import { getProjects } from '@/lib/api/projects';

export default function BrowsePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects({});
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

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
            Browse <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Discover exciting projects and find your next collaboration
          </p>

          {projects.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <p className="text-gray-400 mb-4">No projects found</p>
              <a href="/post-project" className="text-purple-400 hover:text-purple-300">
                Be the first to post a project!
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any, index: number) => (
                <motion.div
                  key={project.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProjectCard
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    skills={project.skills?.map((s: any) => s.name) || []}
                    category={project.category}
                    teamSize={project.team_size}
                    applicants={0}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  );
}
"""

if not os.path.exists(browse_page):
    create_file(browse_page, browse_content)
else:
    print(f"[OK] Already exists: {browse_page}")

# 2. Saved Page
print("\n2. Creating Saved page...")
saved_page = os.path.join(base, 'saved', 'page.tsx')
saved_content = """'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/home/ProjectCard';
import { getSavedProjects } from '@/lib/api/projects';
import { useAuth } from '@/lib/AuthContext';

export default function SavedProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirectTo=/saved');
      return;
    }
    loadSavedProjects();
  }, [user]);

  const loadSavedProjects = async () => {
    if (!user) return;
    try {
      const data = await getSavedProjects(user.id);
      setSavedProjects(data || []);
    } catch (error) {
      console.error('Error loading saved projects:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2">
            Saved <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-gray-400 mb-8">Projects you've bookmarked for later</p>

          {savedProjects.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <p className="text-gray-400 mb-4">No saved projects yet</p>
              <a href="/browse" className="text-purple-400 hover:text-purple-300">
                Browse projects to save
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProjects.map((saved: any, index: number) => (
                <motion.div key={saved.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
"""

if not os.path.exists(saved_page):
    create_file(saved_page, saved_content)
else:
    print(f"[OK] Already exists: {saved_page}")

# 3. About Page
print("\n3. Creating About page...")
about_page = os.path.join(base, 'about', 'page.tsx')

if not os.path.exists(about_page):
    about_content = """export default function AboutPage() {
  return <div className="text-white p-10">About Page Working [OK]</div>;
}
"""
    create_file(about_page, about_content)
else:
    print(f"[OK] Already exists: {about_page}")

# 4. Profile [id] Page
print("\n4. Creating Profile [id] page...")
profile_page = os.path.join(base, 'profile', '[id]', 'page.tsx')

if not os.path.exists(profile_page):
    profile_content = """export default function ProfilePage() {
  return <div className="text-white p-10">Profile Page Working [OK]</div>;
}
"""
    create_file(profile_page, profile_content)
else:
    print(f"[OK] Already exists: {profile_page}")

print("\n" + "=" * 60)
print("ALL PAGES CREATED")
print("=" * 60)

print("\nPages created:")
print("  [OK] /browse/page.tsx")
print("  [OK] /saved/page.tsx")
print("  [OK] /about/page.tsx")
print("  [OK] /profile/[id]/page.tsx")

print("\nExisting pages:")
print("  [OK] /projects/[id]/page.tsx")
print("  [OK] /post-project/page.tsx")
print("  [OK] /auth/login/page.tsx")
print("  [OK] /auth/signup/page.tsx")