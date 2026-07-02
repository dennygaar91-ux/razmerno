-- Stage 24 / P0-03 narrow implementation
-- Persist server-side pricing source attribution for submitted orders.
-- Safe to run multiple times.

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
