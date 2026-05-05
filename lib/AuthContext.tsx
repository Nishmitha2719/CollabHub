'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: any }>;
  signInWithGithub: (redirectTo?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Auto-create profile on signup
      if (event === 'SIGNED_IN' && session?.user) {
        void (async () => {
          try {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', session.user.id)
              .single();

            if (!existingProfile) {
              const { error: insertError } = await supabase.from('profiles').insert([
                {
                  id: session.user.id,
                  email: session.user.email!,
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  role: 'user',
                },
              ]);

              if (insertError) {
                console.error('Failed to create profile on SIGNED_IN:', insertError);
              }
            }

            // Ensure detailed profile row exists for profile editor page.
            const { data: existingDetailedProfile, error: checkDetailedError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('id', session.user.id)
              .maybeSingle();

            if (checkDetailedError) {
              console.error('Failed checking user_profiles on SIGNED_IN:', checkDetailedError);
            }

            if (!existingDetailedProfile) {
              const { error: insertDetailedError } = await supabase.from('user_profiles').insert([
                {
                  id: session.user.id,
                  full_name:
                    session.user.user_metadata?.name ||
                    session.user.email?.split('@')[0] ||
                    'User',
                },
              ]);

              if (insertDetailedError) {
                console.error('Failed to create user_profiles on SIGNED_IN:', insertDetailedError);
              }
            }
          } catch (error) {
            console.error('Error in SIGNED_IN profile creation:', error);
          }
        })();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error('Supabase signUp error:', error);
        return { error };
      }

      // Create profile immediately after signup
      if (data.user) {
        try {
          const { error: profileError } = await supabase.from('profiles').insert([{
            id: data.user.id,
            email: data.user.email!,
            name: metadata?.name || email.split('@')[0],
            role: 'user'
          }]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't fail signup if profile creation fails - it will be created on auth state change
          }
        } catch (profileException) {
          console.error('Profile creation exception:', profileException);
          // Don't fail signup if profile creation fails
        }

        try {
          const { error: detailedProfileError } = await supabase.from('user_profiles').insert([
            {
              id: data.user.id,
              full_name: metadata?.name || email.split('@')[0],
            },
          ]);

          if (detailedProfileError && detailedProfileError.code !== '23505') {
            console.error('Detailed profile creation error:', detailedProfileError);
          }
        } catch (detailedProfileException) {
          console.error('Detailed profile creation exception:', detailedProfileException);
        }
      }

      return { error };
    } catch (exception) {
      console.error('SignUp exception:', exception);
      return { error: { message: exception instanceof Error ? exception.message : 'An unexpected error occurred' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase signIn error:', error);
      }

      return { error };
    } catch (exception) {
      console.error('SignIn exception:', exception);
      return { error: { message: exception instanceof Error ? exception.message : 'An unexpected error occurred' } };
    }
  };

  const signInWithGoogle = async (redirectTo = '/') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });
    return { error };
  };

  const signInWithGithub = async (redirectTo = '/') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } finally {
      setSession(null);
      setUser(null);
      setLoading(false);

      if (typeof window !== 'undefined') {
        const keysToRemove = Object.keys(localStorage).filter(
          (key) => key.includes('supabase.auth.token') || key.includes('-auth-token')
        );
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        const sessionKeysToRemove = Object.keys(sessionStorage).filter(
          (key) => key.includes('supabase.auth.token') || key.includes('-auth-token')
        );
        sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));
      }

      router.replace('/auth/login');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
      }

      return { error };
    } catch (exception) {
      console.error('Reset password exception:', exception);
      return { error: { message: exception instanceof Error ? exception.message : 'An unexpected error occurred' } };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithGithub,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
