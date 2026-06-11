# Vercel env fill guide

## Где задавать

Vercel Dashboard → Project → Settings → Environment Variables → Production.

## Server-only variables

Эти значения не должны попадать в frontend.

| Variable | Где взять | Пример / правило |
|---|---|---|
| `ADMIN_API_KEY` | сгенерировать вручную | длинный случайный ключ минимум 24 символа |
| `ALLOWED_ORIGINS` | фиксированно | `https://razmerno.ru` |
| `VERCEL_ALLOWED_ORIGINS` | фиксированно | `https://razmerno.ru` |
| `SUPABASE_URL` | Supabase → Project Settings → API | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | service_role key, не anon |
| `RESEND_API_KEY` | Resend → API Keys | secret key |
| `ORDER_MANAGER_EMAIL` | твоя почта менеджера | email, куда приходят заявки |
| `MAIL_FROM` | Resend verified domain | например `Размерно <orders@razmerno.ru>` |
| `UPSTASH_REDIS_REST_URL` | Upstash, опционально | можно оставить пустым |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash, опционально | можно оставить пустым |

## Frontend variables

Эти переменные попадают в bundle, не хранить секреты.

| Variable | Значение |
|---|---|
| `VITE_ORDER_API_URL` | `/api/orders` |
| `VITE_USE_MOCK_API` | `false` |
| `ADMIN_PASSWORD_HASH` | временный frontend key для открытия `/admin` |
| `VITE_YANDEX_METRIKA_ID` | id счётчика Яндекс.Метрики |
| `VITE_ADMIN_ORDERS_API_URL` | опционально `/api/admin/orders` |
| `VITE_ADMIN_ORDER_STATUS_API_URL` | опционально `/api/admin/order-status` |
| `VITE_ADMIN_STATUS_EVENTS_API_URL` | опционально `/api/admin/status-events` |

## Как сгенерировать ADMIN_API_KEY в PowerShell

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

## Важно

- `ADMIN_API_KEY` и `ADMIN_PASSWORD_HASH` должны быть разными.
- `SUPABASE_SERVICE_ROLE_KEY` нельзя вставлять в frontend переменные.
- `VITE_*` значения видны пользователю в браузере.
- После смены env нужно сделать redeploy в Vercel.
