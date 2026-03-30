'use client';

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
