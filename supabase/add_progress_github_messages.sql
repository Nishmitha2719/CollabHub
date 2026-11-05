-- =====================================================================
-- CollabHub: database setup for three new features
--   1. Progress tracking  -> table project_tasks
--   2. GitHub integration -> table project_repos
--   3. Project messaging  -> table project_messages (live updates)
--
-- Run in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- It only CREATES new tables, functions and policies. It does not change
-- or delete anything in your existing tables. Safe to run more than once.
-- (Supabase may still show its "destructive operations" warning because of
--  the "drop ... if exists" lines; those only remove objects this script
--  itself creates, so re-running works.)
-- =====================================================================


-- ---------------------------------------------------------------------
-- Helper checks used by the permission rules below
-- ---------------------------------------------------------------------

-- True if the signed-in user owns the project.
create or replace function public.is_project_owner(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.projects p
    where p.id = pid and p.owner_id = auth.uid()
  );
$$;

-- True if the signed-in user owns the project or is an active team member.
create or replace function public.is_project_member(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1 from public.projects p
      where p.id = pid and p.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.project_members m
      where m.project_id = pid
        and m.user_id = auth.uid()
        and lower(m.status) = 'active'
    );
$$;

grant execute on function public.is_project_owner(uuid) to anon, authenticated;
grant execute on function public.is_project_member(uuid) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 1. Progress tracking: tasks on each project
-- ---------------------------------------------------------------------
create table if not exists public.project_tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  description text,
  status      text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  assigned_to uuid references auth.users(id) on delete set null,
  due_date    date,
  created_by  uuid default auth.uid() references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists project_tasks_project_id_idx on public.project_tasks (project_id);

alter table public.project_tasks enable row level security;

-- Anyone can see a project's progress.
drop policy if exists "tasks_read" on public.project_tasks;
create policy "tasks_read" on public.project_tasks
  for select using (true);

-- The owner and team members can add tasks.
drop policy if exists "tasks_insert" on public.project_tasks;
create policy "tasks_insert" on public.project_tasks
  for insert with check (public.is_project_member(project_id) and created_by = auth.uid());

-- The owner and team members can update tasks (e.g. move them to Done).
drop policy if exists "tasks_update" on public.project_tasks;
create policy "tasks_update" on public.project_tasks
  for update using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));

-- The owner, or whoever created the task, can delete it.
drop policy if exists "tasks_delete" on public.project_tasks;
create policy "tasks_delete" on public.project_tasks
  for delete using (public.is_project_owner(project_id) or created_by = auth.uid());

drop trigger if exists update_project_tasks_updated_at on public.project_tasks;
create trigger update_project_tasks_updated_at
  before update on public.project_tasks
  for each row execute function update_updated_at_column();


-- ---------------------------------------------------------------------
-- 2. GitHub integration: one linked repository per project
-- ---------------------------------------------------------------------
create table if not exists public.project_repos (
  project_id     uuid primary key references public.projects(id) on delete cascade,
  repo_full_name text not null check (repo_full_name ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.project_repos enable row level security;

drop policy if exists "repos_read" on public.project_repos;
create policy "repos_read" on public.project_repos
  for select using (true);

-- Only the project owner can link, change or unlink the repository.
drop policy if exists "repos_owner_write" on public.project_repos;
create policy "repos_owner_write" on public.project_repos
  for all using (public.is_project_owner(project_id))
  with check (public.is_project_owner(project_id));

drop trigger if exists update_project_repos_updated_at on public.project_repos;
create trigger update_project_repos_updated_at
  before update on public.project_repos
  for each row execute function update_updated_at_column();


-- ---------------------------------------------------------------------
-- 3. Messaging: a chat for each project's team
-- ---------------------------------------------------------------------
create table if not exists public.project_messages (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists project_messages_project_created_idx
  on public.project_messages (project_id, created_at);

alter table public.project_messages enable row level security;

-- Only the owner and team members can read the chat.
drop policy if exists "messages_read" on public.project_messages;
create policy "messages_read" on public.project_messages
  for select using (public.is_project_member(project_id));

-- Only the owner and team members can post, and only as themselves.
drop policy if exists "messages_insert" on public.project_messages;
create policy "messages_insert" on public.project_messages
  for insert with check (public.is_project_member(project_id) and user_id = auth.uid());

-- People can delete their own messages.
drop policy if exists "messages_delete_own" on public.project_messages;
create policy "messages_delete_own" on public.project_messages
  for delete using (user_id = auth.uid());

-- Turn on live updates so new messages appear without refreshing.
do $$
begin
  alter publication supabase_realtime add table public.project_messages;
exception
  when duplicate_object then null;  -- already added
  when undefined_object then null;  -- realtime publication not present
end $$;
