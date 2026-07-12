-- Canonical reference for constructor_projects (Epic B).
-- Deploy via supabase/migrations/20260703_add_constructor_projects.sql

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

alter table public.constructor_projects enable row level security;
