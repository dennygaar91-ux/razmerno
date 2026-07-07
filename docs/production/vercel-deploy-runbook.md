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

## 8. Customer platform — local workflow (branch foundation)

Local-only customer-facing workflow connected to Operations decisions on `task/epic-b-projects-foundation`. This section is **not** merged/main closure evidence.

### Customer order status model

Customer APIs expose safe `status` DTO (not raw `domain_status`):

| Internal `domain_status` | Customer label |
| --- | --- |
| `Проверка` | `На проверке` |
| `Оплата` | `Ожидает оплаты` |
| `Отмена` | `Отменён` |

Order detail UI shows `CustomerOrderStatusTimeline` with description and next-step copy only.

### Operations decision effect

When `POST /api/operations/order-decision` succeeds:

- approve → customer status `Ожидает оплаты`, notification `Заявка проверена`;
- reject → customer status `Отменён`, notification `Заявка отменена`;
- internal audit reason from Operations is **not** exposed to customer notifications or order status DTO.

### Customer notifications

- Stored in `order_notifications` via server-side Service Role only;
- list: `GET /api/customer/notifications`;
- unread count: `GET /api/customer/notifications/unread-count`;
- mark read: existing read/read-all endpoints;
- no email/push in this local foundation unless separately implemented and verified.

### Header unread indicator

Authenticated header shows bell link to `/account#account-notifications-title` with unread badge from unread-count API.

### Local verification commands

```bash
npm run test:customer-order-detail
npm run test:customer-notifications
npm run test:customer-notifications-ui
npm run test:customer-decision-notification-contract
npm run test:operations-order-decision
```

### Local-only caveats

- Decision notifications are local branch foundation unless explicitly live-verified later;
- P1-27 / P1-28 are not closed by this local work;
- live verification remains separate and is not implied by local tests alone;
- `.env.local` must remain local/uncommitted.

## 9. Change request workflow — local foundation (branch)

Local-only customer ↔ operations change request flow on `task/epic-b-projects-foundation`. Not merged/main closure.

### Customer API / UI

- `POST /api/customer/change-request` — ownership + message validation; allowed only when `domain_status === Проверка`;
- `GET /api/customer/change-requests?orderId=` — safe history for owned order;
- order detail UI shows form only when `changeRequestAllowed` from order detail API;
- ineligible copy: `Изменения недоступны для текущего статуса заявки`.

### Operations readback / decisions

- `GET /api/operations/order` includes safe `changeRequests` (newest-first);
- `POST /api/operations/change-request-decision` transitions: `submitted|reviewed` → `reviewed|resolved|rejected`;
- manual review UI: `OperationsChangeRequestsSection` with decision actions and reload after success.

### Customer notifications

- submit creates `change_request` notification (existing);
- decision creates `order_updated` notification (`Запрос рассмотрен` / `Изменения приняты` / `Отклонён`);
- unread count via `GET /api/customer/notifications/unread-count`;
- no email/push in this foundation.

### Local verification commands

```bash
npm run test:customer-change-request
npm run test:customer-change-request-ui
npm run test:operations-order-review
npm run test:operations-change-request-decision
npm run test:customer-change-request-contract
```

### Local-only caveats

- frontend uses API only; Service Role server-side only; RLS deny-all unchanged;
- no payment/production/customer final price mutation in this foundation;
- P1-27 / P1-28 not closed; live migration apply not implied; `.env.local` remains local.

## 10. Manual payment workflow — local foundation (branch)

Local-only manual payment readiness on `task/epic-b-projects-foundation`. Not merged/main closure. **No real money is processed.**

### Customer payment instructions

- order detail shows `CustomerPaymentInstructionsSection` when `paymentState === awaiting_manual_confirmation` (`domain_status === Оплата`);
- copy: verified / awaiting payment / manager contact;
- no payment button, card input, or payment provider link.

### Operations manual payment confirmation

- `POST /api/operations/payment-confirmation` — admin auth; allowed only when `domain_status === Оплата`;
- transition: `Оплата` → `В работе` (RPES VII lifecycle); audit `operations:payment_confirm`;
- optional internal note stored in `order_status_events.reason` (not exposed to customer);
- manual review UI: `OperationsPaymentConfirmationSection`.

### Customer notifications

- payment confirmation creates `order_updated` notification (`Оплата подтверждена`);
- unread count via `GET /api/customer/notifications/unread-count`;
- no email/push in this foundation.

### Local verification commands

```bash
npm run test:payment-readiness-domain
npm run test:customer-payment-instructions-ui
npm run test:operations-payment-confirmation
npm run test:manual-payment-flow-contract
```

### Local-only caveats

- no payment provider / webhook / card credentials;
- no `total_price` / `production_export` mutation;
- no production handoff automation;
- frontend API-only; Service Role server-side only; RLS deny-all unchanged;
- P1-27 / P1-28 not closed; live verification separate; `.env.local` remains local.

## 11. Order lifecycle completion — local foundation (branch)

Local-only RV1-D lifecycle extension on `task/epic-b-projects-foundation`. Not merged/main closure.

### Customer lifecycle read model

- `mapCustomerOrderStatus` stages: `in_progress` (`В работе`), `completed` (`Завершено`);
- `CustomerOrderStatusTimeline` shows full ladder: На проверке → Ожидает оплаты → В работе → Завершено;
- cancelled branch unchanged.

### Operations workspace filters

- workspace filters include `В работе` and `Завершено` with counts;
- badge tones: `in_progress`, `completed`.

### Operations order completion

- `POST /api/operations/order-completion` — admin auth; allowed only when `domain_status === В работе`;
- transition: `В работе` → `Завершено` (RPES VII lifecycle); audit `operations:order_complete`;
- manual review UI: `OperationsOrderCompletionSection`;
- customer notification: `Заказ завершён`.

### Local verification commands

```bash
npm run test:order-completion-domain
npm run test:customer-order-detail
npm run test:operations-workspace-ui
npm run test:operations-order-completion
npm run test:operations-manual-review-ui
```

### Local-only caveats

- no production handoff automation;
- no `total_price` / `production_export` mutation;
- frontend API-only; Service Role server-side only; RLS deny-all unchanged;
- P1-27 / P1-28 not closed; live verification separate; `.env.local` remains local.
