'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface ProjectCardProps {
  id?: string;
  title: string;
  description: string;
  skills: string[];
  matchPercentage?: number;
  category: string;
  teamSize: number;
  applicants: number;
}

export default function ProjectCard({
  id,
  title,
  description,
  skills,
  matchPercentage,
  category,
  teamSize,
  applicants,
}: ProjectCardProps) {
  // Use id if available, otherwise fallback to slug from title
  const projectUrl = id ? `/projects/${id}` : `/projects/${title.toLowerCase().replace(/ /g, '-')}`;
  
  return (
    <Link href={projectUrl}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        className="glass rounded-2xl p-6 border border-white/10 h-full cursor-pointer group relative overflow-hidden hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300"
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
