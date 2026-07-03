-- Epic C / Submit Ownership Foundation (reference deploy SQL)
-- See supabase/migrations/20260703_add_order_ownership_foundation.sql

alter table public.orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;

alter table public.orders
  add column if not exists public_order_number text;

alter table public.orders
  add column if not exists domain_status text;

alter table public.orders
  add column if not exists constructor_project_id uuid references public.constructor_projects (id) on delete set null;

create unique index if not exists orders_public_order_number_key
  on public.orders (public_order_number)
  where public_order_number is not null;

create index if not exists orders_user_id_idx on public.orders (user_id);

create sequence if not exists public.public_order_number_seq start with 1 increment by 1;

create or replace function public.next_public_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  seq_value bigint;
begin
  select nextval('public.public_order_number_seq') into seq_value;
  return 'RZM_' || lpad(seq_value::text, 4, '0');
end;
$$;
