'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', active: pathname === '/' },
    { href: '/projects', label: 'Browse', active: pathname === '/browse' || pathname === '/projects' },
    { href: '/about', label: 'About', active: pathname === '/about' },
  ];

  const memberLinks = [
    { href: '/saved', label: 'Saved', active: pathname === '/saved' || pathname === '/saved-projects' },
    { href: '/post-project', label: 'Post Project', active: pathname === '/post-project' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      whileHover={{ y: 0 }}
      className={`sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(10,10,20,0.85)] backdrop-blur-2xl transition-all duration-300 ${
        isScrolled ? 'shadow-[0_10px_30px_rgba(0,0,0,0.35)]' : ''
      }`}
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative pb-1 text-sm font-medium transition-all duration-300 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[var(--accent)] after:shadow-[0_0_12px_rgba(124,58,237,0.9)] after:transition-all after:duration-300 hover:after:w-full ${
                  link.active
                    ? 'text-[var(--accent)] after:w-full'
                    : 'text-[#c4c4d8] hover:text-[var(--text-primary)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                {memberLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative pb-1 text-sm font-medium transition-all duration-300 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[var(--accent)] after:shadow-[0_0_12px_rgba(124,58,237,0.9)] after:transition-all after:duration-300 hover:after:w-full ${
                      link.active
                        ? 'text-[var(--accent)] after:w-full'
                        : 'text-[#c4c4d8] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
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
                    className="flex items-center space-x-2 text-[#c4c4d8] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-700 to-indigo-600 shadow-[0_0_14px_rgba(124,58,237,0.45)] flex items-center justify-center text-sm font-semibold">
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
                    <Button size="sm" className="shadow-[0_0_18px_rgba(124,58,237,0.4)]">
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