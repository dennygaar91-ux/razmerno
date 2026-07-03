-- Epic B / Customer Projects Foundation
-- Server-side saved constructor configuration (Project != Order).
-- Safe to run multiple times.

create table if not exists public.constructor_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Проект',
  snapshot jsonb not null,
  furniture_type text not null,
  preview_path text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists constructor_projects_user_id_idx
  on public.constructor_projects (user_id);

create index if not exists constructor_projects_user_active_idx
  on public.constructor_projects (user_id)
  where archived_at is null;

comment on table public.constructor_projects is 'Authenticated customer projects (saved constructor configuration)';
comment on column public.constructor_projects.snapshot is 'Versioned constructor configuration snapshot JSON';
comment on column public.constructor_projects.furniture_type is 'Constructor furniture key/label for listing';
comment on column public.constructor_projects.preview_path is 'Optional preview asset path';
comment on column public.constructor_projects.archived_at is 'Soft archive timestamp; null means active project';

alter table public.constructor_projects enable row level security;

drop policy if exists constructor_projects_deny_all on public.constructor_projects;
create policy constructor_projects_deny_all on public.constructor_projects
  for all
  using (false)
  with check (false);
