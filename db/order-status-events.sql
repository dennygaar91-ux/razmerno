-- Reference SQL for order_status_events audit extensions.
-- Canonical migration: supabase/migrations/20260707_add_order_status_event_reason.sql

alter table if exists public.order_status_events
  add column if not exists reason text;

comment on column public.order_status_events.reason is
  'Optional operator decision note, e.g. operations reject reason. Internal audit only.';
