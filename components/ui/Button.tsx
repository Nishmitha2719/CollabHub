'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70';
  
  const variants = {
    default: 'bg-[linear-gradient(135deg,#6d28d9,#4f46e5)] text-white shadow-[0_8px_28px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(124,58,237,0.45)]',
    outline: 'bg-[rgba(26,26,46,0.7)] border border-[var(--accent)] text-[var(--accent-soft)] hover:bg-[rgba(124,58,237,0.12)] hover:text-white',
    ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}