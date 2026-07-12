-- Reference SQL for order_status_events audit extensions.
-- Canonical migrations:
--   supabase/migrations/20260707_add_order_status_event_reason.sql
--   supabase/migrations/20260708_enable_order_status_events_rls.sql

alter table if exists public.order_status_events
  add column if not exists reason text;

comment on column public.order_status_events.reason is
  'Optional operator decision note, e.g. operations reject reason. Internal audit only.';

alter table public.order_status_events enable row level security;

drop policy if exists order_status_events_deny_all on public.order_status_events;
create policy order_status_events_deny_all on public.order_status_events
  for all
  using (false)
  with check (false);
