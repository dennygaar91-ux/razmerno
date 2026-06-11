# Production Handbook — Размерно MVP

## 1. Go-live route

Start here:

```text
GO-LIVE.md
```

## 2. Supabase

Run:

```text
supabase/deploy/deploy-all.sql
```

Details:

```text
docs/production/supabase-deploy-sql.md
```

## 3. Vercel env

Use:

```text
.env.production.example
docs/production/vercel-env-fill-guide.md
docs/production/admin-password-hash.md
```

Critical server env:

- `ADMIN_API_KEY`
- `ADMIN_PASSWORD_HASH`
- `ALLOWED_ORIGINS`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ORDER_MANAGER_EMAIL`
- `MAIL_FROM`

Critical frontend env:

- `VITE_ORDER_API_URL`
- `VITE_USE_MOCK_API=false`
- `VITE_ADMIN_LOGIN_API_URL`
- `VITE_YANDEX_METRIKA_ID`

## 4. Local checks before deploy

```bash
npm install
npm run predeploy:guard
npm run qa:stage9
npm run qa:stage8
npm run qa:stage7
npm run qa:stage6
npm run qa:all
npm run build
npm audit --audit-level=moderate
```

## 5. Deploy

See:

```text
docs/production/vercel-deploy-runbook.md
docs/production/windows-deploy-commands.md
```

## 6. Smoke

Automated:

```bash
SMOKE_BASE_URL=https://razmerno.ru ADMIN_API_KEY=<server-key> npm run smoke:deploy
```

Manual:

```text
docs/production/post-deploy-manual-smoke.md
```

## 7. Admin auth

Current flow:

1. `/admin`
2. `POST /api/admin/login`
3. `ADMIN_PASSWORD_HASH`
4. signed session token in `sessionStorage`
5. admin API with Bearer session token

Docs:

```text
docs/production/admin-auth-v2.md
```

Known limitation:

- not HttpOnly cookie;
- no RBAC;
- no Supabase Auth.

## 8. Diagnostics and support

Endpoints:

- `/api/health`
- `/api/diagnostics`
- `/api/admin/orders`
- `/api/admin/status-events`

Docs:

```text
docs/production/incident-response.md
docs/production/support-debug-toolkit.md
```

## 9. Stop deploy if

- `/api/health` reports missing env;
- order cannot be saved;
- manager email does not arrive;
- admin API is open without key/session;
- status update fails;
- frontend has fatal runtime error.

## 10. Current known debt

See:

```text
docs/architecture/zustand-migration-plan.md
```

Main items:

- migrate legacy `useConfig/context`;
- distributed Redis rate-limit;
- HttpOnly admin sessions;
- RBAC/Supabase Auth;
- real monitoring/Sentry.
