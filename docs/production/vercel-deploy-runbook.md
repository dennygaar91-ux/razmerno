# Vercel deploy runbook — Размерно MVP

## 1. Apply Supabase migrations first

Run in Supabase SQL Editor:

1. `supabase/migrations/20260526_add_order_assembly_fields.sql`
2. `supabase/migrations/20260526_add_order_status_events.sql`

## 2. Configure Vercel env

Required server env:

```env
ADMIN_API_KEY=<long random secret min 24 chars>
ALLOWED_ORIGINS=https://razmerno.ru
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
ORDER_MANAGER_EMAIL=...
MAIL_FROM=...
```

Required frontend env:

```env
VITE_ORDER_API_URL=/api/orders
VITE_USE_MOCK_API=false
ADMIN_PASSWORD_HASH=<temporary server-side admin password hash hash>
VITE_YANDEX_METRIKA_ID=<counter id>
```

Optional:

```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
VITE_ADMIN_ORDERS_API_URL=/api/admin/orders
VITE_ADMIN_ORDER_STATUS_API_URL=/api/admin/order-status
VITE_ADMIN_STATUS_EVENTS_API_URL=/api/admin/status-events
```

## 3. Local verification before push/deploy

```bash
npm install
npm run predeploy:guard
npm run qa:stage4
npm run qa:all
npm run build
npm audit --audit-level=moderate
```

## 4. Deploy

Preferred:

```bash
git add .
git commit -m "Production deploy foundation"
git push origin main
```

Vercel should deploy from `main`.

## 5. Post-deploy smoke

```bash
SMOKE_BASE_URL=https://razmerno.ru ADMIN_API_KEY=<server-admin-key> npm run smoke:deploy
```

## 6. Manual smoke

- Open `https://razmerno.ru/api/health`.
- Create test order without delivery/assembly.
- Create test order with MKAD delivery.
- Create test order with outside MKAD delivery and distance.
- Create test order with assembly.
- Open `/admin`.
- Load orders.
- Change status.
- Verify status event appears.

## Rollback

If deploy breaks:

1. Revert latest commit.
2. Push revert to `main`.
3. Keep Supabase migrations; they are additive and safe.
4. Disable admin access by removing/rotating `ADMIN_API_KEY`.
