'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  icon?: string;
  className?: string;
}

export default function Card({ children, title, icon, className }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        'glass glass-hover rounded-xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]',
        className
      )}
    >
      {icon && (
        <div className="text-4xl mb-4">{icon}</div>
      )}
      {title && (
        <h3 className="text-xl font-bold mb-3">{title}</h3>
      )}
      <div className="text-secondary">
        {children}
      </div>
    </motion.div>
  );
}