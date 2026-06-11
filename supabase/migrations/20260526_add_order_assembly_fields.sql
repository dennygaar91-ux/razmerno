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
