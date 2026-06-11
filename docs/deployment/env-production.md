# Production environment variables

## Required server env

```txt
ORDER_MANAGER_EMAIL=
RESEND_API_KEY=
MAIL_FROM=
ALLOWED_ORIGINS=https://razmerno.ru
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Required client env

```txt
VITE_YM_ID=
```

## Optional env

```txt
VITE_FORCE_SVG_VIEWER=0
VITE_ENABLE_PRODUCTION_DEBUG=0
VITE_ANALYTICS_DEBUG=0
```

## Production preflight

Local mode only verifies that the script exists:

```bash
npm run check:production-env
```

Strict production mode verifies values:

```bash
CHECK_ENV_MODE=production npm run check:production-env
```

## Rules

- `ALLOWED_ORIGINS` must include `https://razmerno.ru`.
- `MAIL_FROM` must not fallback to `onboarding@resend.dev`.
- `VITE_USE_MOCK_API` must not be enabled in production.
- Supabase service role key must exist only in server-side Vercel env, never in frontend code.
