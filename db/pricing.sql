-- Размерно — pricing catalog schema.
-- Source price list: "Прайс-лист для дилеров до 01.04.26.xlsx"
-- Business rule for MVP: every imported dealer price is multiplied by 1.30.
-- Store both source_price and retail_price so we can audit markup later.

create table if not exists public.price_import_batches (
  id uuid primary key default gen_random_uuid(),
  source_file_name text not null,
  source_file_date text,
  markup_multiplier numeric(8,4) not null default 1.3000,
  status text not null default 'draft',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.price_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.price_import_batches(id) on delete set null,

  item_type text not null,
  producer text,
  brand text,
  collection text,
  article text,
  name text not null,
  decor_name text,
  texture text,
  category text,

  thickness_mm numeric(10,2),
  width_mm numeric(10,2),
  length_mm numeric(10,2),

  unit text not null,
  source_price numeric(14,2) not null,
  markup_multiplier numeric(8,4) not null default 1.3000,
  retail_price numeric(14,2) generated always as (round(source_price * markup_multiplier, 2)) stored,
  currency text not null default 'RUB',
  vat_included boolean not null default true,

  availability_status text,
  source_sheet text not null,
  source_row integer,
  source_note text,

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists price_items_type_idx on public.price_items (item_type);
create index if not exists price_items_producer_idx on public.price_items (producer);
create index if not exists price_items_article_idx on public.price_items (article);
create index if not exists price_items_active_idx on public.price_items (is_active);
create index if not exists price_items_source_idx on public.price_items (source_sheet, source_row);

alter table public.price_import_batches enable row level security;
alter table public.price_items enable row level security;

drop policy if exists "price_import_batches_no_public_write" on public.price_import_batches;
create policy "price_import_batches_no_public_write"
on public.price_import_batches
for all
using (false)
with check (false);

drop policy if exists "price_items_no_public_write" on public.price_items;
create policy "price_items_no_public_write"
on public.price_items
for all
using (false)
with check (false);
