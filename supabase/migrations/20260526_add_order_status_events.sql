-- Stage 3 / Task 05
-- Add audit trail for admin order status changes.
-- Safe to run multiple times.

create table if not exists public.order_status_events (
  id bigserial primary key,
  order_id text not null,
  from_status text,
  to_status text not null,
  changed_by text not null default 'admin',
  created_at timestamptz not null default now()
);

create index if not exists order_status_events_order_id_idx
  on public.order_status_events(order_id);

comment on table public.order_status_events is 'Audit trail for admin order status changes';
comment on column public.order_status_events.order_id is 'Public order id like RZ-YYYYMMDD-0000';
comment on column public.order_status_events.from_status is 'Previous order status, if known';
comment on column public.order_status_events.to_status is 'New order status';
comment on column public.order_status_events.changed_by is 'Actor label for MVP audit trail';
