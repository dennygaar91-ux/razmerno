-- Customer Notifications API Foundation
-- In-cabinet notification records for authenticated customers (API-only access).
-- Safe to run multiple times.

create table if not exists public.order_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  type text not null check (
    type in ('order_created', 'order_updated', 'change_request', 'system')
  ),
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists order_notifications_user_created_idx
  on public.order_notifications (user_id, created_at desc);

create index if not exists order_notifications_user_id_idx
  on public.order_notifications (user_id);

comment on table public.order_notifications is 'Customer-facing notification feed rows';
comment on column public.order_notifications.order_id is 'Optional related order reference';
comment on column public.order_notifications.type is 'Notification category for customer cabinet';
comment on column public.order_notifications.is_read is 'Read state for future customer UI';

alter table public.order_notifications enable row level security;

drop policy if exists order_notifications_deny_all on public.order_notifications;
create policy order_notifications_deny_all on public.order_notifications
  for all
  using (false)
  with check (false);
