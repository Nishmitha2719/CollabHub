'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Project, UserProfile } from '@/types/database';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [editData, setEditData] = useState({
    full_name: '',
    bio: '',
    college: '',
    location: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
  });

  const loadProfile = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError('');

      const [{ data: profileData, error: profileError }, { data: projectData, error: projectsError }] =
        await Promise.all([
          supabase.from('user_profiles').select('*').eq('id', id).maybeSingle(),
          supabase.from('projects').select('*').eq('owner_id', id).order('created_at', { ascending: false }).limit(8),
        ]);

      if (profileError) throw profileError;
      if (projectsError) throw projectsError;

      setProfile(
        ((profileData as UserProfile | null) || {
          id,
          full_name: user?.user_metadata?.name || user?.email?.split('@')[0],
          created_at: '',
          updated_at: '',
        }) as UserProfile
      );
      const baseProfile = (profileData as UserProfile | null) || null;
      setEditData({
        full_name: baseProfile?.full_name || user?.user_metadata?.name || '',
        bio: baseProfile?.bio || '',
        college: baseProfile?.college || '',
        location: baseProfile?.location || '',
        github_url: baseProfile?.github_url || '',
        linkedin_url: baseProfile?.linkedin_url || '',
        portfolio_url: baseProfile?.portfolio_url || '',
      });
      setProjects((projectData || []) as Project[]);
    } catch (err: any) {
      setError(err?.message || 'Unable to load profile right now.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(`/auth/login?redirectTo=/profile/${params.id as string}`);
      return;
    }

    loadProfile(params.id as string);
  }, [authLoading, user, params.id, router, loadProfile]);

  const isOwnProfile = user?.id === (params.id as string);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isOwnProfile) return;

    setSaving(true);
    setSaveMessage('');
    try {
      const payload = {
        id: user.id,
        ...editData,
        updated_at: new Date().toISOString(),
      };

      const { data, error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .single();

      if (upsertError) throw upsertError;
      setProfile(data as UserProfile);
      setSaveMessage('Profile updated successfully.');
    } catch (err: any) {
      setSaveMessage(err?.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Container>
        <div className="py-12 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => loadProfile(params.id as string)}
            className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition"
          >
            Try Again
          </button>
        </div>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <div className="py-12 text-center text-gray-400">Profile not found.</div>
      </Container>
    );
  }

  return (
    <div className="py-12">
      <Container>
        <div className="glass rounded-2xl p-8 border border-white/10 mb-8">
          <h1 className="text-3xl font-bold mb-2">{profile.full_name || user?.email?.split('@')[0] || 'My Profile'}</h1>
          <p className="text-gray-400 mb-4">{user?.email}</p>
          {profile.bio ? <p className="text-gray-300 mb-4">{profile.bio}</p> : null}
          <div className="flex flex-wrap gap-3 text-sm text-gray-400">
            {profile.college ? <span>College: {profile.college}</span> : null}
            {profile.location ? <span>Location: {profile.location}</span> : null}
          </div>
        </div>

        {isOwnProfile ? (
          <div className="glass rounded-2xl p-8 border border-white/10 mb-8">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <input
                type="text"
                value={editData.full_name}
                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                placeholder="Full name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
              />
              <textarea
                rows={4}
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                placeholder="Short bio"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
              />
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={editData.college}
                  onChange={(e) => setEditData({ ...editData, college: e.target.value })}
                  placeholder="College"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
                />
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  placeholder="Location"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="url"
                  value={editData.github_url}
                  onChange={(e) => setEditData({ ...editData, github_url: e.target.value })}
                  placeholder="GitHub URL"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
                />
                <input
                  type="url"
                  value={editData.linkedin_url}
                  onChange={(e) => setEditData({ ...editData, linkedin_url: e.target.value })}
                  placeholder="LinkedIn URL"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
                />
                <input
                  type="url"
                  value={editData.portfolio_url}
                  onChange={(e) => setEditData({ ...editData, portfolio_url: e.target.value })}
                  placeholder="Portfolio URL"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
                {saveMessage ? <span className="text-sm text-gray-300">{saveMessage}</span> : null}
              </div>
            </form>
          </div>
        ) : null}

        <div className="glass rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-4">Projects Posted</h2>
          {projects.length === 0 ? (
            <p className="text-gray-400">
              No projects posted yet. <Link href="/post-project" className="text-purple-400 hover:text-purple-300">Post your first project</Link>.
            </p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
                >
                  <div className="font-semibold">{project.title}</div>
                  <div className="text-sm text-gray-400">{project.category} - {project.status}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
