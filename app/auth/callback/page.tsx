'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let mounted = true;

    const completeOAuth = async () => {
      const code = searchParams.get('code');
      const redirectToParam = searchParams.get('redirectTo');
      const redirectTo =
        redirectToParam && redirectToParam.startsWith('/') && !redirectToParam.startsWith('//')
          ? redirectToParam
          : '/';

      if (!code) {
        if (mounted) {
          router.replace('/auth/login?error=missing_oauth_code');
        }
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        if (mounted) {
          router.replace(`/auth/login?error=${encodeURIComponent(error.message)}`);
        }
        return;
      }

      if (mounted) {
        router.replace(redirectTo);
      }
    };

    void completeOAuth();

    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Completing sign in...</h1>
        <p className="text-gray-400">Please wait while we verify your account.</p>
      </div>
    </div>
  );
}
