import { ReactNode } from 'react';
import Link from 'next/link';

interface CategoryCardProps {
  title: string;
  icon: ReactNode;
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
      <div className="glass p-6 cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[160px] hover:-translate-y-1 hover:scale-[1.02] transition-transform duration-300">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="text-5xl mb-4 flex items-center justify-center">{icon}</div>
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-sm text-secondary">{projectCount} projects</p>
        </div>
      </div>
    </Link>
  );
}
