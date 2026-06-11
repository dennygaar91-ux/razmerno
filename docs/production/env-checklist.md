# Production env checklist

## Обязательные переменные для Vercel API

```env
ALLOWED_ORIGINS=https://razmerno.ru
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
ORDER_MANAGER_EMAIL=...
MAIL_FROM=...
```

## Frontend env

```env
VITE_ORDER_API_URL=/api/orders
VITE_USE_MOCK_API=false
ADMIN_PASSWORD_HASH=<admin login password>
VITE_YANDEX_METRIKA_ID=<counter id>
```

## Optional hardening

```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## Проверка перед запуском

1. `ALLOWED_ORIGINS` содержит `https://razmerno.ru`.
2. Mock API выключен: `VITE_USE_MOCK_API=false`.
3. Supabase service role key задан только в Vercel server env.
4. Resend domain подтверждён.
5. `MAIL_FROM` использует подтверждённый домен.
6. `ORDER_MANAGER_EMAIL` указывает на почту менеджера.
7. `ADMIN_PASSWORD_HASH` задан, но это временная защита.
8. `VITE_YANDEX_METRIKA_ID` задан перед включением аналитики.
