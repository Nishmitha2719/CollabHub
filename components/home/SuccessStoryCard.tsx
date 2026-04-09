"use client";

import { motion } from 'framer-motion';
import { FaRegStar } from "react-icons/fa";

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
      className="glass rounded-2xl overflow-hidden"
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
        <p className="text-secondary text-sm mb-4">{description}</p>
        
        {/* Rating */}
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-700"}>
              <FaRegStar />
            </span>
          ))}
          <span className="ml-2 text-sm text-secondary">({rating}.0)</span>
        </div>

        {/* Team */}
        <div className="flex items-center">
          <span className="text-sm text-secondary mr-2">Team:</span>
          <div className="flex -space-x-2">
            {team.slice(0, 3).map((member, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-700 to-indigo-600 flex items-center justify-center border-2 border-[var(--bg-base)] text-xs font-semibold"
              >
                {member.charAt(0)}
              </div>
            ))}
            {team.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border-2 border-[var(--bg-base)] text-xs">
                +{team.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
