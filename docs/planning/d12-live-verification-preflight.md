# D-12 Live Verification Plan & Preflight — Signed MVP Customer/Operations Path

> **Date:** 2026-07-07  
> **Branch:** `task/epic-b-projects-foundation`  
> **HEAD at preflight:** `5aa79d6f`  
> **Agent:** 07 Customer Platform Agent  
> **Type:** preflight / planning — **not live execution**, **not M8-P1-02 PASS**, **not closure**

## Executive Summary

| Verdict | **`blocked/needs-live-migration-approval`** |
|---------|---------------------------------------------|

Local branch and QA baseline are **ready**. Live Supabase core schema for signed MVP path is **mostly present**, but **`order_status_events.reason` is missing** on project `gxfpgulkrpmlxfeuegpg`. All operations audit writes (approve/reject, payment confirmation, order completion) insert into `order_status_events` including `reason` — **D-12 execution will fail** until migration `20260707_add_order_status_event_reason.sql` is applied with explicit user approval.

Secondary findings:

- `order_status_events` has **RLS disabled** (Supabase advisor: critical). Other MVP tables have deny-all policies. Service Role writes still work; anon exposure risk on audit table — document for infra follow-up (enable RLS + deny-all policy), not applied in this preflight.
- Vercel **production** deployment tracks **`main`** (`57f739d`), not `task/epic-b-projects-foundation`. D-12 execution should use **local `vercel dev` + `.env.local`** until branch is pushed and preview deployed (D-14).
- Existing safe test order **`RZ-20260706-7048`** (`domain_status=Проверка`, `public_order_number=RZM_0002`) is reusable after migration unblock.

---

## 1. Local Branch State

| Check | Result |
|-------|--------|
| Branch | `task/epic-b-projects-foundation` |
| HEAD | `5aa79d6f60850c1a9e76b2101bdbb76704a14aba` |
| Working tree | **clean** |
| `.env.local` | present locally, **gitignored**, not tracked |

## 2. Local QA Baseline

| Command | Result |
|---------|--------|
| `npm test` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `git diff --check` | PASS |

## 3. Supabase Readiness (read-only MCP audit)

| Item | Value |
|------|-------|
| Project ref | `gxfpgulkrpmlxfeuegpg` |
| Project URL | `https://gxfpgulkrpmlxfeuegpg.supabase.co` |

### Tables present (public)

| Table | Rows | RLS | MVP role |
|-------|-----:|-----|----------|
| `orders` | 1 | enabled, deny-all | Core |
| `profiles` | 1 | enabled, deny-all | Customer |
| `constructor_projects` | 0 | enabled, deny-all | Projects |
| `order_notifications` | 1 | enabled, deny-all | Notifications |
| `order_change_requests` | 0 | enabled, deny-all | Change requests |
| `order_manual_pricing_drafts` | 1 | enabled, deny-all | Manual pricing |
| `order_status_events` | 0 | **disabled** | Audit trail |

### Core `orders` columns (verified)

`order_id`, `domain_status`, `status`, `public_order_number`, `user_id`, `constructor_project_id`, `dimensions`, `sections`, `filling`, `materials`, `price_breakdown`, `production_export`, assembly fields — **present**.

### RPC / numbering

- `public.next_public_order_number` — **present**

### `order_status_events` columns (live)

`id`, `order_id`, `from_status`, `to_status`, `changed_by`, `created_at` — **`reason` MISSING**

### Migrations tracked on live (sample)

Greenfield + base orders + status events + ownership + notifications + change requests + manual pricing drafts — **applied**.

**Not tracked / not applied:**

```text
supabase/migrations/20260707_add_order_status_event_reason.sql
```

### RLS policies (deny-all on MVP tables)

`orders_no_public_access`, `profiles_deny_all`, `constructor_projects_deny_all`, `order_notifications_deny_all`, `order_change_requests_deny_all`, `order_manual_pricing_drafts_deny_all` — **present** (`using(false)`).

`order_status_events` — **no policies; RLS disabled**.

### Existing safe test order (non-PII identifiers only)

| Field | Value |
|-------|-------|
| `order_id` | `RZ-20260706-7048` |
| `domain_status` | `Проверка` |
| `public_order_number` | `RZM_0002` |

Suitable for full signed-MVP lifecycle smoke **after migration**.

---

## 4. Vercel / Runtime Readiness

| Item | Value |
|------|-------|
| Project name | `razmerno` |
| Project ID | `prj_gf7NNzfwtFNGctPYpyJeCYVfCQJW` |
| Team ID | `team_j6KYKmTWSuIG9STmqopTCM2p` |
| Latest production deployment | `main` @ `57f739d` — **does not include epic-b customer/ops foundation** |
| Latest preview deployments | other branches (`task/p0-05-threejs-stability`, etc.) — **not epic-b** |

**Env visibility:** Vercel MCP does not expose env var names/values. Assume dashboard env required for preview/production; local execution uses `.env.local` via `scripts/load-project-env.mjs`.

### Runtime health (read-only, not invoked in preflight)

Endpoint: `GET /api/health` — reports `getServerEnvReport()` checks including `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc. Returns 503 if missing.

### Stale runtime risk (documented)

1. Port `3000` may host stale `vercel dev` without Supabase env.
2. `SMOKE_BASE_URL` must match runtime with loaded `.env.local` (historically `http://localhost:3001` worked).
3. Preflight: call `/api/health` and verify Supabase checks `present: true` before any mutating smoke.

### Safe local runtime start (execution phase only)

```powershell
# Load .env.local into process (do not commit)
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
  }
}
npx vercel dev --listen 3001
```

Set `SMOKE_BASE_URL=http://localhost:3001` for verify scripts.

---

## 5. D-12 Verification Matrix (plan only — not executed)

| # | Flow | Endpoint / UI | Mutates live? | Required env | Precondition | Expected result |
|---|------|---------------|--------------:|--------------|--------------|-----------------|
| **Customer** |
| C1 | Order submit | `POST /api/orders` | **Yes** | JWT, Supabase, Resend (optional) | Auth test user | 200, `RZ-*`, `domain_status=Проверка` |
| C2 | Order detail | `GET /api/customer/order` | No | Customer JWT | C1 or reuse order | Safe DTO, no audit leak |
| C3 | Status timeline | Customer UI / detail DTO | No | — | C2 | Full ladder stages |
| C4 | Notifications list | `GET /api/customer/notifications` | No | Customer JWT | After ops events | Rows for user |
| C5 | Unread count | `GET /api/customer/notifications/unread-count` | No | Customer JWT | C4 | Count ≥ 0 |
| C6 | Mark read | `PATCH /api/customer/notifications` | **Yes** | Customer JWT | C4 | `is_read=true` |
| C7 | Change request | `POST /api/customer/change-request` | **Yes** | Customer JWT | `domain_status=Проверка` | 200, notification |
| C8 | Payment instructions | Customer UI | No | — | `domain_status=Оплата` | Instructions visible |
| C9 | Completion visibility | Customer UI | No | — | `domain_status=Завершено` | Timeline complete |
| **Operations** |
| O1 | Workspace queue | `GET /api/operations/workspace` | No | Admin auth | — | Orders list |
| O2 | Order review | `GET /api/operations/order?orderId=` | No | Admin auth | — | Safe review DTO |
| O3 | Manual pricing draft | `POST /api/operations/manual-pricing-draft` | **Yes** | Admin auth | — | Draft saved, no `total_price` change |
| O4 | Approve | `POST /api/operations/order-decision` | **Yes** | Admin auth | `Проверка` | → `Оплата`, audit row |
| O5 | Reject | `POST /api/operations/order-decision` | **Yes** | Admin auth | `Проверка` | → `Отмена`, audit + **reason** |
| O6 | CR decision | `POST /api/operations/change-request-decision` | **Yes** | Admin auth | open CR | Status updated |
| O7 | Payment confirm | `POST /api/operations/payment-confirmation` | **Yes** | Admin auth | `Оплата` | → `В работе` |
| O8 | Order completion | `POST /api/operations/order-completion` | **Yes** | Admin auth | `В работе` | → `Завершено` |
| O9 | Decision history | Review DTO `decisionHistory` | No | Admin auth | O4–O8 | Events listed |
| **Security** |
| S1 | Customer unauth | Customer APIs | No | — | No token | 401 |
| S2 | Ops unauth | Operations APIs | No | — | No admin | 401 |
| S3 | Frontend DB | Code audit | No | — | — | No `createClient` in customer/ops UI |
| S4 | RLS deny-all | Supabase MCP | No | — | — | Deny on MVP tables |
| S5 | Service Role | Architecture | — | Server only | — | API writes only |

**Blocker:** O4–O8 and any flow writing `order_status_events.reason` — **blocked until migration applied**.

---

## 6. Safe Test Data Strategy (execution phase)

| Option | Pros | Risks | Mutates live? | Approval |
|--------|------|-------|---------------|----------|
| **A. Reuse `RZ-20260706-7048`** | Already in `Проверка`; known good | May have manual pricing draft row; lifecycle partially consumed if re-run | Yes on transitions | User OK for reuse |
| **B. Fresh order via `POST /api/orders`** | Clean full-path evidence | Needs customer JWT + Resend may fail (non-blocking) | Yes | **Recommended default** |
| C. Manual DB insert | Fast | Forbidden by project rules; bypasses API | Yes | **Do not use** |

**Recommended default (execution task):**

```text
Create one fresh safe test order through POST /api/orders with contract-test auth path,
or reuse RZ-20260706-7048 only if user approves reuse after migration apply.
```

**Cleanup policy:** Keep test orders in staging; no automatic delete. Document order ids in backlog evidence only (no PII).

---

## 7. Migration Gap Assessment

### Required before D-12 execution

| Migration | Live status | Impact if missing |
|-----------|-------------|-------------------|
| `20260707_add_order_status_event_reason.sql` | **NOT applied** | All `order_status_events` inserts with `reason` field fail |

### Apply instructions (user approval required — do not run in preflight)

```sql
-- From supabase/migrations/20260707_add_order_status_event_reason.sql
alter table if exists public.order_status_events
  add column if not exists reason text;
```

Apply via Supabase dashboard SQL or `apply_migration` MCP **only after explicit user approval**.

**Rollback:** `alter table public.order_status_events drop column if exists reason;` (only if no production dependency).

### Follow-up (not blocking column add)

- Enable RLS on `order_status_events` + deny-all policy (align with repo contract). Separate infra approval.

If migration applied: D-12 execution can proceed **without other schema changes**.

---

## 8. D-12 Execution Plan (next task)

**Task name:** `D-12 Live Verification Execution — Signed MVP Path`

| Step | Action | Mutates? | Evidence |
|------|--------|----------|----------|
| 0 | User approves migration `20260707` | Yes (schema) | Migration record |
| 1 | Load `.env.local`; start `vercel dev` on fixed port | No | `/api/health` 200, Supabase checks present |
| 2 | Set `SMOKE_BASE_URL`, `ADMIN_API_KEY`, verify env script | No | env presence report |
| 3 | `POST /api/orders` (or reuse order) | Yes | order id |
| 4 | `GET /api/customer/order` | No | safe status DTO |
| 5 | `GET /api/operations/workspace` | No | queue contains order |
| 6 | `GET /api/operations/order` | No | review DTO |
| 7 | `POST /api/operations/manual-pricing-draft` | Yes | draft readback |
| 8 | `POST /api/operations/order-decision` approve | Yes | `Оплата` |
| 9 | Customer notifications + unread | No/Yes | notification rows |
| 10 | `POST /api/customer/change-request` (if still `Проверка` — use separate order or earlier step) | Yes | CR row |
| 11 | `POST /api/operations/change-request-decision` | Yes | CR resolved |
| 12 | `POST /api/operations/payment-confirmation` | Yes | `В работе` |
| 13 | `POST /api/operations/order-completion` | Yes | `Завершено` |
| 14 | Customer detail + timeline readback | No | ladder complete |
| 15 | `PATCH` mark-read + unread count | Yes/No | bell flow |
| 16 | Security: 401 without auth | No | status codes |
| 17 | `npm test` + typecheck + build | No | QA PASS |
| 18 | Backlog evidence block | No | not closure |
| 19 | Docs-only commit | No | commit hash |

**Note:** Steps 8–13 ordering follows signed lifecycle; change request (10–11) requires `Проверка` — use **two orders** or submit CR before approve on a dedicated test order.

### Suggested script extensions (future)

- Extend `scripts/live-manual-pricing-draft-verify.mjs` pattern into `scripts/live-signed-mvp-path-verify.mjs` (execution task, not this preflight).

---

## 9. Blockers & Required Approvals

| ID | Blocker | Severity | Required approval |
|----|---------|----------|-------------------|
| B1 | Missing `order_status_events.reason` | **Critical** | Live migration apply |
| B2 | `order_status_events` RLS disabled | High (security) | Infra policy migration (follow-up) |
| B3 | Branch not on Vercel preview | Medium | Push + preview deploy OR local-only live |
| B4 | `.env.local` not in agent/runtime by default | Medium | User provides env to execution runtime |
| B5 | Production Vercel lacks epic-b APIs | High for prod smoke | Use local/preview only |

**M8-P1-02:** not marked PASS. **P1-27 / P1-28:** unchanged.

---

## 10. References

- `docs/planning/mvp-scope-decision-signoff.md` (D-12 required before release)
- `docs/production/vercel-deploy-runbook.md` §12
- `scripts/live-manual-pricing-draft-verify.mjs`
- `scripts/load-project-env.mjs`
- Previous live evidence: greenfield reconciliation, `RZ-20260706-7048`, manual pricing live PASS

---

*Read-only preflight. No live data mutated. No migrations applied.*
