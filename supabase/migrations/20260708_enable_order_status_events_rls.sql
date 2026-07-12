-- Operations order status audit trail: enable RLS with deny-all policy.
-- API-only access via service role (operations/admin server paths).
-- Safe to run multiple times.

alter table public.order_status_events enable row level security;

drop policy if exists order_status_events_deny_all on public.order_status_events;
create policy order_status_events_deny_all on public.order_status_events
  for all
  using (false)
  with check (false);
