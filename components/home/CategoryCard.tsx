'use client';

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
