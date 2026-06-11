# Supabase deploy SQL

## One-file deploy

Use:

`supabase/deploy/deploy-all.sql`

## Как применить

1. Открыть Supabase Dashboard.
2. Перейти в SQL Editor.
3. Открыть файл `supabase/deploy/deploy-all.sql`.
4. Скопировать весь SQL.
5. Выполнить.
6. Проверить, что:
   - в `public.orders` появились `assembly_*` поля;
   - появилась таблица `public.order_status_events`.

## Verification SQL

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'orders'
  and column_name like 'assembly_%';

select to_regclass('public.order_status_events');
```

## Важно

Файл безопасен для повторного запуска.
