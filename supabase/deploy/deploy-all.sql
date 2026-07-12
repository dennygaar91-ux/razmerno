-- Размерно MVP — production deploy SQL
-- Apply this file in Supabase SQL Editor.
-- Safe to run multiple times because migrations are additive/idempotent.

begin;

-- 1. Assembly fields for public.orders
-- Stage 2 / Task 02
-- Add assembly fields to orders table.
-- Safe to run multiple times.

alter table if exists public.orders
  add column if not exists assembly_enabled boolean not null default false,
  add column if not exists assembly_price integer not null default 0,
  add column if not exists assembly_rate numeric(5,4) not null default 0,
  add column if not exists assembly_base_price integer not null default 0;

comment on column public.orders.assembly_enabled is 'Whether customer requested wardrobe assembly service';
comment on column public.orders.assembly_price is 'Assembly price in RUB, calculated as 10% of furniture price without delivery';
comment on column public.orders.assembly_rate is 'Assembly rate used for calculation, MVP default 0.1000';
comment on column public.orders.assembly_base_price is 'Furniture base price before delivery used to calculate assembly';


-- 2. Admin status audit trail
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


-- 3. Production export JSON for manufacturing handoff
alter table if exists public.orders
  add column if not exists production_export jsonb;

comment on column public.orders.production_export is
  'Normalized production export package generated server-side from order payload. Contains panels, drilling, hardware, edge banding and BASIS manual plan.';


-- 4. Pricing source attribution for server-resolved orders
alter table if exists public.orders
  add column if not exists catalog_source_used text,
  add column if not exists pricing_source_diagnostic text,
  add column if not exists pricing_fallback_reason text;

comment on column public.orders.catalog_source_used is
  'Effective catalog source used for server-resolved order pricing: supabase or seed_fallback';
comment on column public.orders.pricing_source_diagnostic is
  'Runtime diagnostic state from server pricing resolver: supabase_success, supabase_empty, supabase_failed, or seed_fallback';
comment on column public.orders.pricing_fallback_reason is
  'Nullable fallback reason when seed catalog is used for server pricing';

commit;

-- Manual verification after run:
-- select column_name from information_schema.columns where table_schema='public' and table_name='orders' and column_name like 'assembly_%';
-- select to_regclass('public.order_status_events');
