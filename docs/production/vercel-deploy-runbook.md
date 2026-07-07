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

## 7. Operations workspace — local workflow (branch foundation)

Local-only Operations workflow for `task/epic-b-projects-foundation` and future agent runs. This section is **not** merged/main closure evidence.

### Start local API runtime

1. Ensure `.env.local` exists locally with at least:
   - `SUPABASE_URL` (project root URL only, no `/rest/v1` suffix)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_API_KEY`
2. Load env **before** starting dev server. Example (PowerShell):

```powershell
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
  }
}
npx vercel dev --listen 3000
```

3. Point smoke/verify scripts to the runtime that actually has env loaded:

```bash
SMOKE_BASE_URL=http://localhost:3000
```

If port `3000` is occupied by a stale `vercel dev` started without env, either stop that process or use another port and set `SMOKE_BASE_URL` accordingly (for example `http://localhost:3001`).

### Stale runtime caveat

A stale `vercel dev` on port `3000` without `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` can return misleading `temporarily unavailable` from Operations APIs even when branch code is correct. Always verify the active runtime has env loaded (`scripts/live-manual-pricing-draft-verify.mjs` includes `checkApiRuntimeReady()` for this).

### Safe order id from prior live verification

Manual pricing live verification previously used:

```text
LIVE_VERIFY_ORDER_ID=RZ-20260706-7048
```

Use only as a safe test order when it still exists in the linked project. Do not invent orders via direct Supabase inserts.

### Decision actions scope

Approve/reject decision actions are **local branch foundation** on `task/epic-b-projects-foundation` unless explicitly live-verified later. Local tests and branch backlog evidence do **not** close P1-27 or change P1-28.

### Live migration caveat — decision audit reason

Before live decision audit with persisted reject reason, apply:

```text
supabase/migrations/20260707_add_order_status_event_reason.sql
```

This migration was prepared locally and may still be unapplied on live. Do not claim live decision-audit-with-reason PASS without migration evidence.

### Local routes and tests

- UI: `/operations`, `/operations/orders/:orderId`
- Core tests: `npm run test:operations-workspace`, `npm run test:operations-order-review`, `npm run test:operations-order-decision`, `npm run test:operations-decision-flow-contract`
- Manual pricing live verify: `npm run verify:live-manual-pricing-draft`

### Non-scope reminders

- No merge / push / PR / production deploy from local batch evidence alone
- Do not commit `.env.local`
- Do not mutate live Supabase data from agent workflows unless explicitly scoped and approved
