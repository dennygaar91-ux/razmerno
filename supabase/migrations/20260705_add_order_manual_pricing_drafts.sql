-- Operations Manual Pricing Write Foundation
-- Operations-only manual pricing draft persistence (API-only access).
-- Safe to run multiple times.

create table if not exists public.order_manual_pricing_drafts (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  manual_total_price integer not null check (manual_total_price > 0),
  reason text,
  status text not null default 'draft' check (status = 'draft'),
  created_by text not null default 'admin',
  updated_by text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists order_manual_pricing_drafts_order_id_idx
  on public.order_manual_pricing_drafts (order_id);

comment on table public.order_manual_pricing_drafts is 'Operations manual pricing draft rows; not customer-facing final price';
comment on column public.order_manual_pricing_drafts.order_id is 'Public order id like RZ-YYYYMMDD-0000';
comment on column public.order_manual_pricing_drafts.manual_total_price is 'Draft total price in rubles (integer)';
comment on column public.order_manual_pricing_drafts.reason is 'Optional operations note for manual pricing draft';
comment on column public.order_manual_pricing_drafts.status is 'Draft-only status for operations write foundation';

alter table public.order_manual_pricing_drafts enable row level security;

drop policy if exists order_manual_pricing_drafts_deny_all on public.order_manual_pricing_drafts;
create policy order_manual_pricing_drafts_deny_all on public.order_manual_pricing_drafts
  for all
  using (false)
  with check (false);
