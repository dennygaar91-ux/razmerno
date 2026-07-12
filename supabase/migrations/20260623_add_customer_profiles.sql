-- Epic A / Customer Authentication Foundation
-- Customer profile aggregate (Release v1).
-- Safe to run multiple times.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

comment on table public.profiles is 'Customer profile aggregate for Release v1 auth foundation';
comment on column public.profiles.user_id is 'Supabase auth.users.id';
comment on column public.profiles.full_name is 'Customer display name';
comment on column public.profiles.email is 'Immutable via PATCH /api/profile; synced from auth on create';
comment on column public.profiles.phone is 'Optional until first order; editable via PATCH';

alter table public.profiles enable row level security;

drop policy if exists profiles_deny_all on public.profiles;
create policy profiles_deny_all on public.profiles
  for all
  using (false)
  with check (false);
