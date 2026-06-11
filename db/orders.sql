-- Размерно — MVP orders storage schema for Supabase/Postgres.
-- PII is stored in DB for MVP without app-level encryption, but must not be logged or stored in localStorage.
-- Access should be restricted through Supabase RLS/service role only.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  status text not null default 'new',
  source text not null default 'configurator',

  product_type text not null,
  dimensions jsonb not null,
  sections integer not null,
  filling jsonb not null,
  layout jsonb,
  materials jsonb not null,
  style jsonb not null,
  price_breakdown jsonb not null,
  total_price integer not null,

  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  customer_comment text,

  delivery_enabled boolean not null default false,
  delivery_address text,
  delivery_price integer not null default 0,

  consent jsonb not null,
  config_version text,
  utm jsonb not null default '{}'::jsonb,

  manager_email_status text not null default 'pending',
  customer_email_status text not null default 'pending',
  manager_email_error text,
  customer_email_error text,

  user_agent text,
  client_ip_hash text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_product_type_idx on public.orders (product_type);

alter table public.orders enable row level security;

-- No public client access by default.
-- Vercel API should use SUPABASE_SERVICE_ROLE_KEY server-side.
drop policy if exists "orders_no_public_access" on public.orders;
create policy "orders_no_public_access"
on public.orders
for all
using (false)
with check (false);
