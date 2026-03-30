#!/usr/bin/env python3
"""
CollabHub - Complete Homepage Implementation
Creates all homepage sections and components
"""

import os

print("=" * 70)
print("  CollabHub - Homepage Components Setup")
print("=" * 70)
print()

# Create component files
files = {}

# 1. Floating Bubbles Background
files['components/home/FloatingBubbles.tsx'] = """'use client';

import { motion } from 'framer-motion';

export default function FloatingBubbles() {
  const bubbles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-xl"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
          }}
          animate={{
            y: ['-20%', '20%'],
            x: ['-10%', '10%'],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
"""

# 2. Project Card Component
files['components/home/ProjectCard.tsx'] = """'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface ProjectCardProps {
  title: string;
  description: string;
  skills: string[];
  matchPercentage?: number;
  category: string;
  teamSize: number;
  applicants: number;
}

export default function ProjectCard({
  title,
  description,
  skills,
  matchPercentage,
  category,
  teamSize,
  applicants,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${title.toLowerCase().replace(/ /g, '-')}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        className="glass glass-hover rounded-2xl p-6 border border-white/10 h-full cursor-pointer group relative overflow-hidden"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 group-hover:text-gradient transition-all">
                {title}
              </h3>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {category}
              </span>
            </div>
            {matchPercentage && (
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-gradient">
                  {matchPercentage}%
                </div>
                <span className="text-xs text-gray-400">Match</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
            {description}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300"
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="text-xs px-2 py-1 text-gray-400">
                +{skills.length - 4} more
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>👥 {teamSize} members needed</span>
            <span>📝 {applicants} applied</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
"""

# 3. Category Card
files['components/home/CategoryCard.tsx'] = """'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface CategoryCardProps {
  title: string;
  icon: string;
  projectCount: number;
  gradient: string;
}

export default function CategoryCard({
  title,
  icon,
  projectCount,
  gradient,
}: CategoryCardProps) {
  return (
    <Link href={`/projects?category=${title.toLowerCase()}`}>
      <motion.div
        whileHover={{ y: -5, scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={`glass rounded-2xl p-6 border border-white/10 cursor-pointer group relative overflow-hidden`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
        
        <div className="relative z-10 text-center">
          <div className="text-5xl mb-4">{icon}</div>
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-sm text-gray-400">{projectCount} projects</p>
        </div>
      </motion.div>
    </Link>
  );
}
"""

# 4. Success Story Card
files['components/home/SuccessStoryCard.tsx'] = """'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface SuccessStoryCardProps {
  title: string;
  description: string;
  team: string[];
  rating: number;
  imageUrl?: string;
}

export default function SuccessStoryCard({
  title,
  description,
  team,
  rating,
  imageUrl,
}: SuccessStoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="glass rounded-2xl overflow-hidden border border-white/10"
    >
      {imageUrl && (
        <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            🎉
          </div>
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        
        {/* Rating */}
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-600'}>
              ⭐
            </span>
          ))}
          <span className="ml-2 text-sm text-gray-400">({rating}.0)</span>
        </div>

        {/* Team */}
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-2">Team:</span>
          <div className="flex -space-x-2">
            {team.slice(0, 3).map((member, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center border-2 border-black text-xs font-semibold"
              >
                {member.charAt(0)}
              </div>
            ))}
            {team.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border-2 border-black text-xs">
                +{team.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
"""

# Create all component files
print("Creating homepage components...")
for filepath, content in files.items():
    dir_path = os.path.dirname(filepath)
    if dir_path and not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  ✓ {filepath}")

print()
print("=" * 70)
print("  ✅ Homepage Components Created!")
print("=" * 70)
print()
print("Next: Run the complete_homepage_setup.py script to create the full home page")
print()
