# 🚀 CollabHub - Complete Project System Setup Guide

## ✅ What Will Be Created

This complete project system includes:

1. **Database Schema** (Supabase SQL)
2. **TypeScript Types** for all database tables
3. **API Functions** for CRUD operations
4. **Browse Projects Page** with filters
5. **Project Details Page** with apply functionality
6. **Post Project Page** with form
7. **Saved Projects Page** with bookmarks
8. **Matching Algorithm** for skill-based recommendations

---

## 🎯 Quick Setup (4 Steps)

### Step 1: Setup Database

1. Go to your Supabase project
2. Click "SQL Editor" in the sidebar
3. Copy the content from `supabase_schema.sql`
4. Paste and run it in the SQL editor

This creates all tables, indexes, RLS policies, and sample skills.

### Step 2: Create Types and API

```bash
python create_project_types.py
```

This creates:
- `types/database.ts` - All TypeScript interfaces
- `lib/api/projects.ts` - API functions for projects

### Step 3: Create Pages and Components

```bash
python create_project_pages.py
```

This creates:
- `components/projects/ProjectFilters.tsx` - Filter sidebar
- `app/projects/page.tsx` - Browse projects page

### Step 4: Create Remaining Files

Due to the size, I'll provide all remaining code in this guide. Copy each section:

---

## 📁 Remaining Files to Create

### 1. Project Detail Page

**File:** `app/projects/[id]/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { getProjectById, applyToProject, saveProject, unsaveProject } from '@/lib/api/projects';
import { useAuth } from '@/lib/AuthContext';
import { ProjectWithDetails } from '@/types/database';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProject(params.id as string);
    }
  }, [params.id]);

  const loadProject = async (id: string) => {
    try {
      const data = await getProjectById(id);
      setProject(data);
      // Check if saved
      setIsSaved(data.is_saved || false);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      router.push('/auth/login?redirectTo=' + window.location.pathname);
      return;
    }

    setApplying(true);
    try {
      await applyToProject(project!.id, user.id);
      alert('Application submitted successfully!');
    } catch (error) {
      alert('Error applying to project');
      console.error(error);
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      router.push('/auth/login?redirectTo=' + window.location.pathname);
      return;
    }

    try {
      if (isSaved) {
        await unsaveProject(project!.id, user.id);
        setIsSaved(false);
      } else {
        await saveProject(project!.id, user.id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <Container>
        <div className="py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
          <Button onClick={() => router.push('/projects')}>
            Back to Projects
          </Button>
        </div>
      </Container>
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
                <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    📁 {project.category}
                  </span>
                  <span className="flex items-center">
                    📊 {project.difficulty}
                  </span>
                  <span className="flex items-center">
                    ⏱️ {project.duration}
                  </span>
                  <span className="flex items-center">
                    👥 {project.team_size} members needed
                  </span>
                  {project.is_paid && (
                    <span className="flex items-center text-green-400">
                      💰 Paid Project
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition"
                >
                  {isSaved ? '❤️' : '🤍'} {isSaved ? 'Saved' : 'Save'}
                </button>
                <Button onClick={handleApply} disabled={applying}>
                  {applying ? 'Applying...' : 'Apply Now'}
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">Description</h2>
              <p className="text-gray-400 whitespace-pre-line">
                {project.detailed_description || project.description}
              </p>
            </div>

            {/* Skills */}
            {project.skills && project.skills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Roles Needed */}
          {project.roles && project.roles.length > 0 && (
            <div className="glass rounded-2xl p-8 border border-white/10 mb-8">
              <h2 className="text-2xl font-bold mb-6">Roles Needed</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {project.roles.map((role) => (
                  <div key={role.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="font-bold mb-2">{role.role_name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{role.description}</p>
                    <div className="text-sm text-purple-400">
                      {role.positions_filled}/{role.positions_available} filled
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Members */}
          {project.members && project.members.length > 0 && (
            <div className="glass rounded-2xl p-8 border border-white/10 mb-8">
              <h2 className="text-2xl font-bold mb-6">Team Members</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {project.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-purple flex items-center justify-center font-bold">
                      {member.user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold">{member.user?.full_name || 'Anonymous'}</div>
                      <div className="text-sm text-gray-400">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {project.milestones && project.milestones.length > 0 && (
            <div className="glass rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Timeline & Milestones</h2>
              <div className="space-y-4">
                {project.milestones
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((milestone) => (
                    <div key={milestone.id} className="flex items-start gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          milestone.status === 'Completed'
                            ? 'bg-green-500'
                            : milestone.status === 'In Progress'
                            ? 'bg-yellow-500'
                            : 'bg-gray-600'
                        }`}
                      >
                        {milestone.status === 'Completed' ? '✓' : milestone.order_index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{milestone.title}</h3>
                        <p className="text-sm text-gray-400">{milestone.description}</p>
                        {milestone.due_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(milestone.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  );
}
```

---

### 2. Post Project Page

**File:** `app/post-project/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { createProject, getAllSkills } from '@/lib/api/projects';
import { useAuth } from '@/lib/AuthContext';
import { Skill, CreateProjectData } from '@/types/database';

export default function PostProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
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
    if (!user) {
      router.push('/auth/login?redirectTo=/post-project');
      return;
    }
    loadSkills();
  }, [user]);

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

    setLoading(true);
    try {
      const project = await createProject(formData, user.id);
      alert('Project posted successfully!');
      router.push(`/projects/${project.id}`);
    } catch (error) {
      alert('Error posting project');
      console.error(error);
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
```

---

### 3. Saved Projects Page

**File:** `app/saved-projects/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirectTo=/saved-projects');
      return;
    }
    loadSavedProjects();
  }, [user]);

  const loadSavedProjects = async () => {
    if (!user) return;
    try {
      const data = await getSavedProjects(user.id);
      setSavedProjects(data);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            Saved <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Projects you've bookmarked for later
          </p>

          {savedProjects.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <p className="text-gray-400 mb-4">No saved projects yet</p>
              <button
                onClick={() => router.push('/projects')}
                className="text-purple-400 hover:text-purple-300"
              >
                Browse projects to save
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
                      title={saved.project.title}
                      description={saved.project.description}
                      skills={saved.project.skills?.map(s => s.name) || []}
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
```

---

## 🎯 Testing Checklist

After setup:

- [ ] Run `supabase_schema.sql` in Supabase
- [ ] Run `python create_project_types.py`
- [ ] Run `python create_project_pages.py`
- [ ] Create remaining 3 pages manually (copy code above)
- [ ] Test browsing projects at `/projects`
- [ ] Test posting a project at `/post-project`
- [ ] Test saving projects
- [ ] Test viewing project details
- [ ] Verify authentication protection

---

## 📚 Next Steps

1. Add pagination to browse page
2. Implement project search
3. Add chat/discussion section
4. Enable file attachments
5. Build user dashboard
6. Add application management

---

**All code is ready! Follow the steps above to complete setup! 🚀**
