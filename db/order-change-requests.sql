-- Epic I-1 / Customer Change Request API Foundation (reference deploy SQL)
-- See supabase/migrations/20260703_add_order_change_requests.sql

create table if not exists public.order_change_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  request_type text not null check (
    request_type in ('dimensions', 'materials', 'configuration', 'delivery', 'other')
  ),
  message text not null,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists order_change_requests_user_created_idx
  on public.order_change_requests (user_id, created_at desc);

create index if not exists order_change_requests_order_created_idx
  on public.order_change_requests (order_id, created_at desc);

create index if not exists order_change_requests_order_user_idx
  on public.order_change_requests (order_id, user_id);

alter table public.order_change_requests enable row level security;

drop policy if exists order_change_requests_deny_all on public.order_change_requests;
create policy order_change_requests_deny_all on public.order_change_requests
  for all
  using (false)
  with check (false);
