'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProjectCard from '@/components/home/ProjectCard';
import ProjectFilters from '@/components/projects/ProjectFilters';
import {
  getAllSkills,
  getApplicationCounts,
  getProjectsPage,
  type ProjectWithSkills,
} from '@/lib/api/projects';
import type { Skill } from '@/types/database';

const PAGE_SIZE = 12;
const CATEGORIES = ['AI/ML', 'Web Dev', 'Mobile', 'IoT', 'Blockchain', 'Cybersecurity'];

interface BrowseState {
  search: string;
  category: string;
  difficulty: string;
  duration: string;
  team: string;
  paid: boolean | undefined;
  skills: string[];
  page: number;
}

// URL keys: q, category, difficulty, duration, team, paid, skills, page
function readState(params: URLSearchParams): BrowseState {
  const rawCategory = params.get('category') || '';
  // Accept any letter case (old links used lower-case) and map to the stored value.
  const category =
    CATEGORIES.find((c) => c.toLowerCase() === rawCategory.toLowerCase()) || rawCategory;
  const paidParam = params.get('paid');
  const page = parseInt(params.get('page') || '1', 10);

  return {
    search: params.get('q') || '',
    category,
    difficulty: params.get('difficulty') || '',
    duration: params.get('duration') || '',
    team: params.get('team') || '',
    paid: paidParam === 'true' ? true : paidParam === 'false' ? false : undefined,
    skills: (params.get('skills') || '').split(',').filter(Boolean),
    page: Number.isNaN(page) || page < 1 ? 1 : page,
  };
}

export default function BrowseProjects() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();
  const current = useMemo(() => readState(new URLSearchParams(paramsKey)), [paramsKey]);

  const [searchInput, setSearchInput] = useState(current.search);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<ProjectWithSkills[]>([]);
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  // Keep the search box in sync when the URL changes (e.g. back button).
  useEffect(() => {
    setSearchInput(current.search);
  }, [current.search]);

  useEffect(() => {
    let mounted = true;
    getAllSkills().then((data) => {
      if (mounted) setSkills(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const load = async () => {
      const result = await getProjectsPage(
        {
          search: current.search || undefined,
          category: current.category || undefined,
          difficulty: current.difficulty || undefined,
          duration: current.duration || undefined,
          team_size_range: current.team || undefined,
          is_paid: current.paid,
          skills: current.skills.length > 0 ? current.skills : undefined,
          page: current.page,
        },
        PAGE_SIZE
      );
      if (!mounted) return;

      setProjects(result.projects);
      setHasMore(result.hasMore);
      setLoading(false);

      const counts = await getApplicationCounts(result.projects.map((p) => p.id));
      if (mounted) setApplicantCounts(counts);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [current]);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage = true) => {
      const next = new URLSearchParams(paramsKey);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') next.delete(key);
        else next.set(key, value);
      });
      if (resetPage && !('page' in updates)) next.delete('page');
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [paramsKey, pathname, router]
  );

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || undefined });
  };

  const handleFilterChange = (filters: {
    skills?: string[];
    difficulty?: string;
    duration?: string;
    team_size?: string;
    is_paid?: boolean;
  }) => {
    updateParams({
      skills: filters.skills && filters.skills.length > 0 ? filters.skills.join(',') : undefined,
      difficulty: filters.difficulty || undefined,
      duration: filters.duration || undefined,
      team: filters.team_size || undefined,
      paid: filters.is_paid === undefined ? undefined : String(filters.is_paid),
    });
  };

  const goToPage = (page: number) => {
    updateParams({ page: page > 1 ? String(page) : undefined }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters =
    !!current.search ||
    !!current.category ||
    !!current.difficulty ||
    !!current.duration ||
    !!current.team ||
    current.paid !== undefined ||
    current.skills.length > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside>
        <ProjectFilters
          skills={skills}
          onFilterChange={handleFilterChange}
          initialFilters={{
            skills: current.skills,
            difficulty: current.difficulty,
            duration: current.duration,
            team_size: current.team,
            is_paid: current.paid,
          }}
        />
      </aside>

      <section className="min-w-0">
        {/* Search + category */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-3">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search projects by title or description..."
              className="w-full flex-1 rounded-lg px-4 py-3"
            />
            <button
              type="submit"
              className="rounded-lg bg-[linear-gradient(135deg,#6d28d9,#4f46e5)] px-5 py-3 font-semibold text-white"
            >
              Search
            </button>
          </form>
          <select
            value={current.category}
            onChange={(e) => updateParams({ category: e.target.value || undefined })}
            className="select-dark px-4 py-3 md:w-52"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="glass rounded-2xl p-8 border border-white/10 text-center text-gray-400">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="glass rounded-2xl p-8 border border-white/10 text-center text-gray-400">
            {hasActiveFilters ? (
              <>
                <p className="mb-4">No projects match these filters.</p>
                <button
                  onClick={() => router.replace(pathname, { scroll: false })}
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Clear search and filters
                </button>
              </>
            ) : (
              'No approved projects found yet.'
            )}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id}>
                <ProjectCard
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  skills={project.skills || []}
                  category={project.category}
                  teamSize={project.team_size}
                  applicants={applicantCounts[project.id] ?? 0}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && (current.page > 1 || hasMore) && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => goToPage(current.page - 1)}
              disabled={current.page <= 1}
              className="rounded-lg border border-white/10 px-5 py-2 hover:bg-white/5 transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-400">Page {current.page}</span>
            <button
              onClick={() => goToPage(current.page + 1)}
              disabled={!hasMore}
              className="rounded-lg border border-white/10 px-5 py-2 hover:bg-white/5 transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
