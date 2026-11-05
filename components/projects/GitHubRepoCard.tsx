'use client';

import { FormEvent, useEffect, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import {
  fetchRepoSummary,
  getProjectRepo,
  parseRepoInput,
  setProjectRepo,
  type RepoCommit,
  type RepoSummary,
} from '@/lib/api/github';
import { useToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface GitHubRepoCardProps {
  projectId: string;
  isOwner: boolean;
}

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const units: Array<[number, string]> = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];
  for (const [size, label] of units) {
    const value = Math.floor(seconds / size);
    if (value >= 1) return `${value} ${label}${value !== 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export default function GitHubRepoCard({ projectId, isOwner }: GitHubRepoCardProps) {
  const { addToast } = useToast();
  const [repoName, setRepoName] = useState<string | null>(null);
  const [repo, setRepo] = useState<RepoSummary | null>(null);
  const [commits, setCommits] = useState<RepoCommit[]>([]);
  const [githubError, setGithubError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Which repository is linked to this project?
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProjectRepo(projectId).then((name) => {
      if (!mounted) return;
      setRepoName(name);
      if (!name) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [projectId]);

  // Fetch its details from GitHub.
  useEffect(() => {
    if (!repoName) {
      setRepo(null);
      setCommits([]);
      return;
    }

    let mounted = true;
    setLoading(true);
    setGithubError('');

    fetchRepoSummary(repoName).then((result) => {
      if (!mounted) return;
      if (result.ok) {
        setRepo(result.repo);
        setCommits(result.commits);
      } else {
        setRepo(null);
        setCommits([]);
        setGithubError(result.error);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [repoName]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseRepoInput(input);
    if (!parsed) {
      addToast({ message: 'Enter a repository like owner/repo or a github.com link', type: 'error' });
      return;
    }

    setSaving(true);
    const result = await setProjectRepo(projectId, parsed);
    setSaving(false);

    if (!result.success) {
      addToast({ message: result.error || 'Could not link repository', type: 'error' });
      return;
    }
    addToast({ message: 'Repository linked', type: 'success' });
    setEditing(false);
    setInput('');
    setRepoName(parsed);
  };

  const handleUnlink = async () => {
    if (!confirm('Unlink this repository from the project?')) return;
    const result = await setProjectRepo(projectId, null);
    if (!result.success) {
      addToast({ message: result.error || 'Could not unlink repository', type: 'error' });
      return;
    }
    addToast({ message: 'Repository unlinked', type: 'success' });
    setRepoName(null);
  };

  const linkForm = (
    <form onSubmit={handleSave} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="https://github.com/owner/repo or owner/repo"
        className="flex-1 rounded-lg px-4 py-3"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-[linear-gradient(135deg,#6d28d9,#4f46e5)] px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Link Repository'}
      </button>
      {editing && (
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-white/10 px-5 py-3 hover:bg-white/5"
        >
          Cancel
        </button>
      )}
    </form>
  );

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl text-white">
          <FaGithub />
        </span>
        <div>
          <h3 className="text-xl font-bold text-white">GitHub Repository</h3>
          <p className="text-sm text-gray-400">Code and recent activity for this project</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="md" />
        </div>
      ) : !repoName || editing ? (
        isOwner ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="mb-4 text-sm text-gray-300">
              {editing ? 'Link a different repository.' : 'Link your project’s public GitHub repository so the team can see recent commits.'}
            </p>
            {linkForm}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
            No repository has been linked yet.
          </div>
        )
      ) : (
        <div className="space-y-6">
          {githubError ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              <p className="font-semibold">{repoName}</p>
              <p className="mt-1">{githubError}</p>
            </div>
          ) : repo ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="text-lg font-semibold text-purple-300 hover:text-purple-200 break-all"
              >
                {repo.fullName}
              </a>
              {repo.description ? <p className="mt-2 text-gray-300">{repo.description}</p> : null}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
                <span>⭐ {repo.stars} stars</span>
                <span>🍴 {repo.forks} forks</span>
                <span>🐛 {repo.openIssues} open issues</span>
                {repo.language ? <span>💻 {repo.language}</span> : null}
                {repo.pushedAt ? <span>⏱️ Updated {timeAgo(repo.pushedAt)}</span> : null}
              </div>
            </div>
          ) : null}

          {!githubError && (
            <div>
              <h4 className="mb-3 font-semibold text-white">Recent Commits</h4>
              {commits.length === 0 ? (
                <p className="text-sm text-gray-500">No commits yet.</p>
              ) : (
                <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
                  {commits.map((commit) => (
                    <li key={commit.sha} className="bg-white/[0.03] px-4 py-3">
                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm text-gray-100 hover:text-purple-200 break-words"
                      >
                        {commit.message || '(no message)'}
                      </a>
                      <p className="mt-1 text-xs text-gray-500">
                        <span className="font-mono text-gray-400">{commit.sha}</span> · {commit.author}
                        {commit.date ? ` · ${timeAgo(commit.date)}` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {isOwner && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setInput(repoName);
                  setEditing(true);
                }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
              >
                Change repository
              </button>
              <button
                onClick={handleUnlink}
                className="rounded-lg px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                Unlink
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
