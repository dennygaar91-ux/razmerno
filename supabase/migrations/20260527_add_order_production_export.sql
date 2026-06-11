-- Stage 13: production export JSON for future manufacturing/BASIS handoff.
alter table if exists public.orders
  add column if not exists production_export jsonb;

comment on column public.orders.production_export is
  'Normalized production export package generated server-side from order payload. Contains panels, drilling, hardware, edge banding and BASIS manual plan.';
