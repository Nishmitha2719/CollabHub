import os

# Create directories
directories = [
    r'e:\CollabHub\components\shared',
    r'e:\CollabHub\app\about',
    r'e:\CollabHub\app\profile\[id]',
]

for directory in directories:
    os.makedirs(directory, exist_ok=True)
    print(f'Created: {directory}')

# Create LoginPrompt component
login_prompt_content = """'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  redirectTo?: string;
}

export default function LoginPrompt({ 
  isOpen, 
  onClose, 
  message = 'You need to be logged in to perform this action.',
  redirectTo 
}: LoginPromptProps) {
  const router = useRouter();

  const handleLogin = () => {
    const loginUrl = redirectTo 
      ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/auth/login';
    router.push(loginUrl);
  };

  const handleSignup = () => {
    const signupUrl = redirectTo 
      ? `/auth/signup?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/auth/signup';
    router.push(signupUrl);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center py-4">
        <div className="text-5xl mb-4">🔐</div>
        <h3 className="text-xl font-bold mb-2">Login Required</h3>
        <p className="text-gray-400 mb-6">{message}</p>
        
        <div className="flex flex-col gap-3">
          <Button onClick={handleLogin} className="w-full">
            Log In
          </Button>
          <Button onClick={handleSignup} variant="outline" className="w-full">
            Sign Up
          </Button>
          <button 
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
"""

# Create SkillTag component
skill_tag_content = """'use client';

import { motion } from 'framer-motion';

interface SkillTagProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary';
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

const variantClasses = {
  default: 'bg-white/5 border-white/10 text-gray-300',
  primary: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
  secondary: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
};

export default function SkillTag({ name, size = 'md', variant = 'default', onClick }: SkillTagProps) {
  const Component = onClick ? motion.button : motion.span;
  
  return (
    <Component
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`
        inline-flex items-center rounded-full border
        font-medium transition-all
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${onClick ? 'cursor-pointer hover:bg-white/10' : ''}
      `}
    >
      {name}
    </Component>
  );
}
"""

# Create ProfileCard component
profile_card_content = """'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import SkillTag from '@/components/shared/SkillTag';

interface ProfileCardProps {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  projectCount?: number;
  rating?: number;
}

export default function ProfileCard({ 
  id, 
  name, 
  avatar, 
  bio, 
  skills = [], 
  projectCount = 0,
  rating = 0 
}: ProfileCardProps) {
  return (
    <Link href={`/profile/${id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="glass rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer"
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0">
            {avatar ? (
              <Image src={avatar} alt={name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-gradient transition-all">
              {name}
            </h3>
            {bio && (
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                {bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <span>🚀 {projectCount} projects</span>
              {rating > 0 && (
                <span>⭐ {rating.toFixed(1)}</span>
              )}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 3).map((skill, idx) => (
                  <SkillTag key={idx} name={skill} size="sm" />
                ))}
                {skills.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{skills.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
"""

# Write component files
files = [
    (r'e:\CollabHub\components\shared\LoginPrompt.tsx', login_prompt_content),
    (r'e:\CollabHub\components\shared\SkillTag.tsx', skill_tag_content),
    (r'e:\CollabHub\components\shared\ProfileCard.tsx', profile_card_content),
]

for filepath, content in files:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Created: {filepath}')

print('\nAll component files created successfully!')
