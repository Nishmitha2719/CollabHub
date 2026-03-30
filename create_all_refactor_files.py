import os

def create_file(filepath, content):
    """Create a file with content, creating directories if needed"""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'✓ Created: {filepath}')

# Directory creation
print('Creating directories...')
dirs = [
    r'e:\CollabHub\components\shared',
    r'e:\CollabHub\app\about',
    r'e:\CollabHub\app\profile\[id]',
]
for d in dirs:
    os.makedirs(d, exist_ok=True)
    print(f'✓ Directory: {d}')

print('\nCreating shared components...')

# LoginPrompt component
create_file(r'e:\CollabHub\components\shared\LoginPrompt.tsx', """'use client';

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
""")

# SkillTag component
create_file(r'e:\CollabHub\components\shared\SkillTag.tsx', """'use client';

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
""")

# ProfileCard component
create_file(r'e:\CollabHub\components\shared\ProfileCard.tsx', """'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
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
        className="glass rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
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
""")

print('\nCreating pages...')

# About Page
create_file(r'e:\CollabHub\app\about\page.tsx', """'use client';

import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';

export default function AboutPage() {
  const features = [
    {
      icon: '🤝',
      title: 'Connect with Talented Students',
      description: 'Find passionate teammates who share your vision and complement your skills.',
    },
    {
      icon: '🚀',
      title: 'Bring Ideas to Life',
      description: 'Transform concepts into reality with the right team and resources.',
    },
    {
      icon: '🎯',
      title: 'Smart Matching',
      description: 'Our algorithm matches you with projects based on your skills and interests.',
    },
    {
      icon: '💡',
      title: 'Learn & Grow',
      description: 'Gain real-world experience while building your portfolio.',
    },
    {
      icon: '🏆',
      title: 'Showcase Success',
      description: 'Display completed projects and achievements to future employers.',
    },
    {
      icon: '🌍',
      title: 'Global Community',
      description: 'Collaborate with students from universities worldwide.',
    },
  ];

  const team = [
    {
      name: 'Alex Chen',
      role: 'Founder & CEO',
      avatar: '👨‍💻',
      bio: 'Full-stack developer passionate about connecting students.',
    },
    {
      name: 'Sarah Johnson',
      role: 'Head of Product',
      avatar: '👩‍💼',
      bio: 'Product designer with 5+ years experience in EdTech.',
    },
    {
      name: 'Mike Rodriguez',
      role: 'Lead Engineer',
      avatar: '👨‍🔧',
      bio: 'Former FAANG engineer building scalable systems.',
    },
  ];

  return (
    <div className="py-20">
      <Container>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="text-gradient">CollabHub</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            We're on a mission to revolutionize student collaboration by connecting
            talented individuals with innovative projects. Build, learn, and succeed
            together.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="glass rounded-3xl p-12 md:p-16 border border-white/10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                Every great project starts with a great team. We believe that
                students shouldn't struggle to find collaborators who share their
                passion and vision.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                CollabHub makes it effortless to discover projects, connect with
                talented peers, and build something amazing together. Whether you're
                creating the next unicorn startup or working on a class assignment,
                we're here to help you succeed.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose <span className="text-gradient">CollabHub</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Meet the <span className="text-gradient">Team</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all">
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-purple-400 mb-3">{member.role}</p>
                  <p className="text-sm text-gray-400">{member.bio}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="glass rounded-3xl p-12 md:p-16 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Collaborating?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already building amazing projects
              together. Your next breakthrough is just one connection away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/projects"
                className="px-8 py-4 bg-gradient-purple text-white font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Browse Projects
              </a>
              <a
                href="/auth/signup"
                className="px-8 py-4 glass border-2 border-purple-500 text-purple-400 font-semibold rounded-lg hover:bg-purple-500/10 transition-all"
              >
                Sign Up Free
              </a>
            </div>
          </div>
        </motion.section>
      </Container>
    </div>
  );
}
""")

# User Profile Page
create_file(r'e:\CollabHub\app\profile\[id]\page.tsx', """'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import SkillTag from '@/components/shared/SkillTag';
import ProjectCard from '@/components/home/ProjectCard';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  githubUsername?: string;
  rating: number;
  projectCount: number;
  location?: string;
  university?: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  stars: number;
  language: string;
  url: string;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      // TODO: Replace with actual API call
      // Simulate loading with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProfile: UserProfile = {
        id: userId,
        name: 'Alex Chen',
        email: 'alex@example.com',
        bio: 'Full-stack developer passionate about AI and web technologies. Always looking for exciting projects to collaborate on!',
        skills: ['React', 'TypeScript', 'Python', 'Node.js', 'Machine Learning', 'AWS'],
        githubUsername: 'alexchen',
        rating: 4.8,
        projectCount: 12,
        location: 'San Francisco, CA',
        university: 'Stanford University',
      };
      
      setProfile(mockProfile);

      // Fetch GitHub repos if username exists
      if (mockProfile.githubUsername) {
        fetchGitHubRepos(mockProfile.githubUsername);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGitHubRepos = async (username: string) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=6`);
      const data = await response.json();
      
      const formattedRepos: GitHubRepo[] = data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language,
        url: repo.html_url,
      }));
      
      setRepos(formattedRepos);
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Container className="py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-400">The user you're looking for doesn't exist.</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="py-12">
      <Container>
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 md:p-12 border border-white/10 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{profile.name}</h1>
              
              {profile.university && (
                <p className="text-purple-400 text-lg mb-2">🎓 {profile.university}</p>
              )}
              
              {profile.location && (
                <p className="text-gray-400 mb-4">📍 {profile.location}</p>
              )}

              {profile.bio && (
                <p className="text-gray-300 mb-6">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <p className="text-2xl font-bold">{profile.projectCount}</p>
                    <p className="text-sm text-gray-400">Projects</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-2xl font-bold">{profile.rating.toFixed(1)}</p>
                    <p className="text-sm text-gray-400">Rating</p>
                  </div>
                </div>
                {profile.githubUsername && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐙</span>
                    <div>
                      <a 
                        href={`https://github.com/${profile.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        @{profile.githubUsername}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">SKILLS</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, idx) => (
                      <SkillTag key={idx} name={skill} variant="primary" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* GitHub Repos */}
        {repos.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">
              GitHub <span className="text-gradient">Repositories</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.map((repo, index) => (
                <motion.a
                  key={repo.id}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="block"
                >
                  <Card className="h-full hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold group-hover:text-gradient transition-all">
                        {repo.name}
                      </h3>
                      {repo.stars > 0 && (
                        <span className="text-sm text-gray-400">
                          ⭐ {repo.stars}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {repo.description || 'No description provided'}
                    </p>
                    {repo.language && (
                      <SkillTag name={repo.language} size="sm" variant="secondary" />
                    )}
                  </Card>
                </motion.a>
              ))}
            </div>
          </motion.section>
        )}

        {/* Projects Section - Placeholder */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">
            Participated <span className="text-gradient">Projects</span>
          </h2>
          <div className="glass rounded-2xl p-12 border border-white/10 text-center">
            <p className="text-gray-400">
              Project participation history will be displayed here
            </p>
          </div>
        </motion.section>
      </Container>
    </div>
  );
}
""")

print('\n✅ All files created successfully!')
print('\nNext steps:')
print('1. Update Navbar with new routes')
print('2. Improve FloatingBubbles component')
print('3. Test all routes and functionality')
