'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, signInWithGithub } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectToParam = searchParams.get('redirectTo');
  const authErrorParam = searchParams.get('error');
  const redirectTo =
    redirectToParam && redirectToParam.startsWith('/') && !redirectToParam.startsWith('//')
      ? redirectToParam
      : '/';

  useEffect(() => {
    if (authErrorParam) {
      setError(decodeURIComponent(authErrorParam));
    }
  }, [authErrorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirectTo);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const { error } = await signInWithGoogle(redirectTo);
    if (error) setError(error.message);
  };

  const handleGithubSignIn = async () => {
    setError('');
    const { error } = await signInWithGithub(redirectTo);
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome <span className="text-gradient">Back</span>
            </h1>
            <p className="text-gray-400">Sign in to continue to CollabHub</p>
          </div>

          <div className="glass rounded-2xl p-8 border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="text-right">
                <Link href="/auth/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition"
              >
                <span className="mr-2"><FaGoogle /></span> Google
              </button>
              <button
                onClick={handleGithubSignIn}
                className="flex items-center justify-center px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition"
              >
                <span className="mr-2"><FaGithub /></span> GitHub
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href={`/auth/signup?redirectTo=${encodeURIComponent(redirectTo)}`} className="text-purple-400 hover:text-purple-300 font-medium">
              Sign up
            </Link>
          </p>
        </motion.div>
      </Container>
    </div>
  );
}
