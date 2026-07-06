-- Operations decision audit reason for order_status_events.
-- Safe to run multiple times.

alter table if exists public.order_status_events
  add column if not exists reason text;

comment on column public.order_status_events.reason is
  'Optional operator decision note, e.g. operations reject reason. Internal audit only.';
