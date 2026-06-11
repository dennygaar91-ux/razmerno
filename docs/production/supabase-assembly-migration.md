# Supabase migration — order assembly fields

## Зачем

Stage 2 добавляет toggle «Заказать сборку» в checkout. Чтобы production API мог сохранять заявки, таблица `public.orders` должна иметь assembly-поля.

## Файл миграции

`supabase/migrations/20260526_add_order_assembly_fields.sql`

## Что добавляется

- `assembly_enabled boolean not null default false`
- `assembly_price integer not null default 0`
- `assembly_rate numeric(5,4) not null default 0`
- `assembly_base_price integer not null default 0`

## Как применять вручную в Supabase

1. Открыть Supabase Dashboard.
2. Перейти в SQL Editor.
3. Вставить содержимое файла миграции.
4. Выполнить SQL.
5. Проверить, что в `public.orders` появились поля.

## Важно

Миграция безопасна для повторного запуска, потому что используется `add column if not exists`.
