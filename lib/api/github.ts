import { supabase } from '../supabaseClient';

export interface RepoSummary {
  fullName: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  defaultBranch: string;
  pushedAt: string | null;
}

export interface RepoCommit {
  sha: string;
  message: string;
  author: string;
  date: string | null;
  url: string;
}

const REPO_NAME_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

/**
 * Accepts "owner/repo" or any GitHub URL such as
 * https://github.com/owner/repo, .../repo.git or .../repo/tree/main
 * and returns "owner/repo", or null if it isn't a valid repository.
 */
export function parseRepoInput(input: string): string | null {
  let value = input.trim();
  if (!value) return null;

  value = value.replace(/^git@github\.com:/i, '');
  value = value.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '');
  value = value.replace(/[?#].*$/, '');

  const [owner, rawRepo] = value.split('/').filter(Boolean);
  if (!owner || !rawRepo) return null;

  const repo = rawRepo.replace(/\.git$/i, '');
  const fullName = `${owner}/${repo}`;
  return REPO_NAME_PATTERN.test(fullName) ? fullName : null;
}

export async function getProjectRepo(projectId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('project_repos')
      .select('repo_full_name')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) throw error;
    return (data as any)?.repo_full_name ?? null;
  } catch (error) {
    console.error('Error fetching linked repository:', error);
    return null;
  }
}

/** Link (or change) the project's repository. Pass null to unlink. Owner only. */
export async function setProjectRepo(
  projectId: string,
  repoFullName: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    if (repoFullName === null) {
      const { error } = await supabase.from('project_repos').delete().eq('project_id', projectId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    if (!REPO_NAME_PATTERN.test(repoFullName)) {
      return { success: false, error: 'Enter a repository like owner/repo or a github.com link' };
    }

    const { error } = await supabase
      .from('project_repos')
      .upsert({ project_id: projectId, repo_full_name: repoFullName }, { onConflict: 'project_id' });

    if (error) {
      if (error.message?.toLowerCase().includes('row-level security')) {
        return { success: false, error: 'Only the project owner can link a repository' };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('Error saving linked repository:', error);
    return { success: false, error: 'Could not save repository' };
  }
}

function githubError(status: number, headers: Headers): string {
  if (status === 404) return 'Repository not found. It may be private or the name may be wrong.';
  if (status === 403 && headers.get('x-ratelimit-remaining') === '0') {
    const reset = Number(headers.get('x-ratelimit-reset'));
    const when = reset ? ` Try again after ${new Date(reset * 1000).toLocaleTimeString()}.` : '';
    return `GitHub's hourly limit for this network has been reached.${when}`;
  }
  return `GitHub returned an error (${status}).`;
}

/** Public repository details and its latest commits, read from the GitHub API. */
export async function fetchRepoSummary(
  repoFullName: string,
  commitCount = 5
): Promise<{ ok: true; repo: RepoSummary; commits: RepoCommit[] } | { ok: false; error: string }> {
  const headers = { Accept: 'application/vnd.github+json' };

  try {
    const repoResponse = await fetch(`https://api.github.com/repos/${repoFullName}`, { headers });
    if (!repoResponse.ok) {
      return { ok: false, error: githubError(repoResponse.status, repoResponse.headers) };
    }
    const repoData: any = await repoResponse.json();

    const repo: RepoSummary = {
      fullName: repoData.full_name,
      url: repoData.html_url,
      description: repoData.description ?? null,
      stars: repoData.stargazers_count ?? 0,
      forks: repoData.forks_count ?? 0,
      openIssues: repoData.open_issues_count ?? 0,
      language: repoData.language ?? null,
      defaultBranch: repoData.default_branch ?? 'main',
      pushedAt: repoData.pushed_at ?? null,
    };

    let commits: RepoCommit[] = [];
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/commits?per_page=${commitCount}`,
      { headers }
    );
    // An empty repository returns 409; just show no commits in that case.
    if (commitsResponse.ok) {
      const commitData: any[] = await commitsResponse.json();
      commits = commitData.map((item) => ({
        sha: String(item.sha || '').slice(0, 7),
        message: String(item.commit?.message || '').split('\n')[0],
        author: item.author?.login || item.commit?.author?.name || 'Unknown',
        date: item.commit?.author?.date ?? null,
        url: item.html_url,
      }));
    }

    return { ok: true, repo, commits };
  } catch (error) {
    console.error('Error contacting GitHub:', error);
    return { ok: false, error: 'Could not reach GitHub. Check your connection and try again.' };
  }
}
