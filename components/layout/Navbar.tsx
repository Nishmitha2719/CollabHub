'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass sticky top-0 z-50 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gradient">
              CollabHub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`transition-colors ${
                pathname === '/' ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              href="/projects"
              className={`transition-colors ${
                pathname === '/browse' || pathname === '/projects' ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Browse
            </Link>
            <Link
              href="/about"
              className={`transition-colors ${
                pathname === '/about' ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              About
            </Link>
            {user && (
              <>
                <Link
                  href="/saved"
                  className={`transition-colors ${
                    pathname === '/saved' || pathname === '/saved-projects' ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Saved
                </Link>
                <Link
                  href="/post-project"
                  className={`transition-colors ${
                    pathname === '/post-project' ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Post Project
                </Link>
              </>
            )}
          </div>

          {/* Auth Section */}
          {!loading && (
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href={`/profile/${user.id}`}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center text-sm font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline">{user.email?.split('@')[0]}</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}