#!/usr/bin/env python3
"""
CollabHub - Create All Project Pages and Components
Part 2: Browse, Details, Post, Saved Projects pages
"""

import os

print("=" * 70)
print("  CollabHub - Creating Project Pages & Components")
print("=" * 70)
print()

files = {}

# 1. Project Filter Sidebar Component
files['components/projects/ProjectFilters.tsx'] = """'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ProjectFiltersProps {
  onFilterChange: (filters: any) => void;
  skills: Array<{ id: string; name: string; category: string }>;
}

export default function ProjectFilters({ onFilterChange, skills }: ProjectFiltersProps) {
  const [filters, setFilters] = useState({
    skills: [] as string[],
    difficulty: '',
    duration: '',
    team_size: '',
    is_paid: undefined as boolean | undefined,
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleSkill = (skillId: string) => {
    const newSkills = filters.skills.includes(skillId)
      ? filters.skills.filter(id => id !== skillId)
      : [...filters.skills, skillId];
    handleFilterChange('skills', newSkills);
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div className="glass rounded-2xl p-6 border border-white/10 sticky top-20">
      <h3 className="text-xl font-bold mb-6">Filters</h3>

      {/* Skills */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Skills</h4>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category}>
              <p className="text-sm text-gray-400 mb-2">{category}</p>
              <div className="space-y-2">
                {categorySkills.map(skill => (
                  <label key={skill.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.skills.includes(skill.id)}
                      onChange={() => toggleSkill(skill.id)}
                      className="mr-2 rounded bg-white/5 border-white/10"
                    />
                    <span className="text-sm">{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Difficulty</h4>
        <select
          value={filters.difficulty}
          onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Duration</h4>
        <select
          value={filters.duration}
          onChange={(e) => handleFilterChange('duration', e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Any Duration</option>
          <option value="1-2 weeks">1-2 weeks</option>
          <option value="3-4 weeks">3-4 weeks</option>
          <option value="1-2 months">1-2 months</option>
          <option value="2-3 months">2-3 months</option>
          <option value="3+ months">3+ months</option>
        </select>
      </div>

      {/* Team Size */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Team Size</h4>
        <select
          value={filters.team_size}
          onChange={(e) => handleFilterChange('team_size', e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Any Size</option>
          <option value="2-3">2-3 members</option>
          <option value="4-5">4-5 members</option>
          <option value="6+">6+ members</option>
        </select>
      </div>

      {/* Paid/Unpaid */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Compensation</h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={filters.is_paid === undefined}
              onChange={() => handleFilterChange('is_paid', undefined)}
              className="mr-2"
            />
            <span className="text-sm">All Projects</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={filters.is_paid === true}
              onChange={() => handleFilterChange('is_paid', true)}
              className="mr-2"
            />
            <span className="text-sm">Paid Only</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={filters.is_paid === false}
              onChange={() => handleFilterChange('is_paid', false)}
              className="mr-2"
            />
            <span className="text-sm">Unpaid Only</span>
          </label>
        </div>
      </div>

      <button
        onClick={() => {
          setFilters({
            skills: [],
            difficulty: '',
            duration: '',
            team_size: '',
            is_paid: undefined,
          });
          onFilterChange({});
        }}
        className="w-full px-4 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition"
      >
        Clear All Filters
      </button>
    </div>
  );
}
"""

# 2. Browse Projects Page
files['app/projects/page.tsx'] = """'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/home/ProjectCard';
import ProjectFilters from '@/components/projects/ProjectFilters';
import { getProjects, getAllSkills, getUserSkills } from '@/lib/api/projects';
import { useAuth } from '@/lib/AuthContext';
import { Project, Skill, UserSkill } from '@/types/database';

export default function BrowseProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadSkills();
    if (user) loadUserSkills();
  }, [user]);

  useEffect(() => {
    loadProjects();
  }, [filters, search]);

  const loadSkills = async () => {
    try {
      const data = await getAllSkills();
      setSkills(data);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const loadUserSkills = async () => {
    if (!user) return;
    try {
      const data = await getUserSkills(user.id);
      setUserSkills(data);
    } catch (error) {
      console.error('Error loading user skills:', error);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { projects: data } = await getProjects({ ...filters, search });
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            Browse <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-gray-400">
            Find exciting projects to join and collaborate on
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProjectFilters
              skills={skills}
              onFilterChange={setFilters}
            />
          </div>

          {/* Projects Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center border border-white/10">
                <p className="text-gray-400 mb-4">No projects found matching your criteria</p>
                <button
                  onClick={() => {
                    setFilters({});
                    setSearch('');
                  }}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProjectCard
                      title={project.title}
                      description={project.description}
                      skills={[]} // Add skills from project_skills
                      category={project.category}
                      teamSize={project.team_size}
                      applicants={0} // Add from applications count
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
"""

# Create all files
for filepath, content in files.items():
    dir_path = os.path.dirname(filepath)
    if dir_path and not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  ✓ {filepath}")

print()
print("=" * 70)
print("  ✅ Browse Page Components Created!")
print("=" * 70)
print()
print("Continue with create_project_details.py for project detail page...")
print()
