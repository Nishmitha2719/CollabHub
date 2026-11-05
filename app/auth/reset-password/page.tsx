'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Loader from '@/components/ui/Loader';
import { supabase } from '@/lib/supabaseClient';

type Status = 'checking' | 'ready' | 'invalid' | 'done';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    // Implicit flow: supabase-js reads the tokens from the URL hash and fires this event.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        setStatus('ready');
      }
    });

    const init = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const linkError =
        searchParams.get('error_description') || hashParams.get('error_description');

      if (linkError) {
        if (mounted) {
          setError(linkError.replace(/\+/g, ' '));
          setStatus('invalid');
        }
        return;
      }

      // PKCE flow: the link carries ?code=...
      const code = searchParams.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!mounted) return;
        if (exchangeError) {
          setError(exchangeError.message);
          setStatus('invalid');
        } else {
          setStatus('ready');
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session) {
        setStatus('ready');
      } else {
        // Give the client a moment to process the hash before giving up.
        timeoutId = setTimeout(() => {
          if (mounted) setStatus((s) => (s === 'checking' ? 'invalid' : s));
        }, 3000);
      }
    };

    void init();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      listener.subscription.unsubscribe();
    };
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setStatus('done');
    setTimeout(() => router.replace('/'), 2000);
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
              Set a New <span className="text-gradient">Password</span>
            </h1>
            <p className="text-gray-400">Choose a new password for your account</p>
          </div>

          <div className="glass rounded-2xl p-8 border border-white/10">
            {status === 'checking' && (
              <p className="text-center text-gray-400">Verifying your reset link...</p>
            )}

            {status === 'invalid' && (
              <div className="text-center space-y-4">
                <p className="text-red-400">
                  {error || 'This reset link is invalid or has expired.'}
                </p>
                <Link href="/auth/forgot-password">
                  <Button className="w-full mt-2">Request a New Link</Button>
                </Link>
              </div>
            )}

            {status === 'done' && (
              <div className="text-center space-y-4">
                <div className="text-5xl">✅</div>
                <h3 className="text-xl font-semibold">Password updated</h3>
                <p className="text-gray-400">Taking you to the home page...</p>
              </div>
            )}

            {status === 'ready' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder="••••••••"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </Container>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
