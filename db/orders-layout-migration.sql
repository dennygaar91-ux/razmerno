-- Stage 4 / Task 08 — add layout payload to orders.
alter table public.orders
add column if not exists layout jsonb;
