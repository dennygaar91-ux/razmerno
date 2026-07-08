> Derived local report. Not an active source of truth. `docs/planning/current-backlog.md` remains the active operational backlog. Use this file as historical branch-local evidence only.

# D-14 PR Strategy & Branch Review Plan — `task/epic-b-projects-foundation`

> **Date:** 2026-07-07  
> **Agent:** 01 Product / Planning Agent  
> **HEAD at analysis:** `55305edc`  
> **Base branch:** `main` @ `57f739d1` (merge-base `90792e24`)  
> **Type:** planning / review strategy — **not PR**, **not push**, **not closure**

## Executive Summary

**Recommended strategy:** **Option 2 — Single PR with logical review sections.**

The branch is large (**126 commits**, **351 files**, **+48,405 / −775** vs `main`) and contains **interleaved history** (pricing/constructor/Three.js/production foundations **plus** customer/operations MVP). Splitting or restacking PRs now would require history surgery with high regression risk. The signed MVP process (D-14) accepts **sectioned review inside one PR** as the safest path that preserves the QA-passed branch state.

---

## 1. Branch State (verified)

| Check | Result |
|-------|--------|
| Branch | `task/epic-b-projects-foundation` |
| HEAD | `55305edc` (`test: add d12 live verification evidence`) |
| Working tree | **clean** |
| QA | `npm test`, `typecheck`, `build`, `git diff --check` — **PASS** |
| D-12 live verification | **PASS** (`RZ-20260707-5271` / `RZM_0007`) |
| Push / merge / PR | **none** |

---

## 2. Branch History Summary

### Scale vs `main`

```text
Commits:  126 (main..HEAD)
Files:    351 changed
Diffstat: +48,405 / −775 lines
```

### Chronological spine (newest → oldest, selected)

| Range | Theme | Approx. commits |
|-------|--------|----------------|
| `55305edc` … `95e4e988` | D-12 live verification, migration evidence, MVP sign-off, P1-27/P1-28 reconciliation | ~7 |
| `86d60f5d` … `cd2ac2c7` | Order completion, lifecycle filters, customer read model | ~4 |
| `2b21c155` … `93d8cac9` | Manual payment confirmation, payment instructions | ~6 |
| `1d4b1a44` … `a3598399` | Change requests (customer + operations) | ~6 |
| `d7863691` … `23e7bb7a` | Notifications, status timeline, decision flow | ~8 |
| `15acb0ad` … `58557e54` | Operations workspace, decisions, manual pricing, manual review | ~15 |
| `782cb441` … `6e57d473` | Customer platform foundation (auth → notifications) | ~15 |
| `ae013f26` … `ec9de9a5` | **Mixed pre-customer history:** Three.js stability, pricing source lock, production v4, manufacturing, constructor hardening, role audits | ~65 |

### Branch naming note

Customer auth spine branched from `task/epic-a-customer-auth` (`6e57d473`). Current branch name `epic-b-projects-foundation` reflects merged epic work but **history includes earlier non–customer/ops commits** already on the branch before epic-a merge point.

### Limitation

Analysis uses local `main` @ `57f739d1`. Remote `origin/main` matches at time of analysis. No merge/rebase performed.

---

## 3. Change Classification (vs `main`)

### Group A — Customer Platform (~90 files)

**API:** `api/customer/*`, `api/profile.ts`, `api/project(s).ts`, customer `_shared` stores/auth/types, `order-submit-auth.ts`, `order-profile-autofill.ts`, `payment-readiness-domain.ts`, `customer-order-status.ts`.

**UI:** `src/shared/auth/*`, `src/shared/workspace/*`, `src/shared/projects/*`, `src/static-pages/Account*.tsx`, `src/static-pages/account/*`, header auth controls, checkout auth gate.

**Scope:** auth/account, projects, order ownership, submit, detail, status/timeline, notifications/unread/mark-read, change request (customer), payment instructions, completion visibility.

### Group B — Operations Workspace (~45 files)

**API:** `api/operations/*`, operations `_shared` stores/review/decision/payment/completion/change-request.

**UI:** `src/operations/*`, `src/shared/operations/*`, routing in `App.tsx`.

**Scope:** queue, filters/counts, manual review, approve/reject, audit reason/history, CR decisions, manual payment confirmation, order completion.

### Group C — Manual Pricing / Live Schema (~25 files)

**Schema:** `db/order-*.sql`, `supabase/migrations/20260703*` … `20260707*`, `deploy-all.sql`.

**API/UI:** manual pricing draft store/API/UI, `order-status-events.reason` migration file.

**Live:** `scripts/live-manual-pricing-draft-verify.mjs`, `scripts/live-signed-mvp-path-verify.mjs`, `scripts/start-vercel-dev-with-env.mjs`, `load-project-env.mjs`.

**Evidence:** live migration apply (`order_status_events.reason`), D-12 preflight/execution docs.

### Group D — Product / Planning Docs (~20+ files)

- `docs/planning/p1-27-p1-28-reconciliation.md`
- `docs/planning/mvp-scope-decision-signoff.md`
- `docs/planning/d12-live-verification-preflight.md`
- `docs/planning/current-backlog.md` (evidence blocks)
- `docs/production/vercel-deploy-runbook.md` §§7–12
- Role audits, specification volumes, pricing/constructor contracts

### Group E — QA / Verification (~40 test files)

Customer/operations contract tests, live verification scripts, `package.json` test/verify scripts, browser E2E additions.

### Group F — Mixed History / Non–customer-ops (~120+ files)

**Present on branch but not D-12 MVP closure scope:**

- Production JSON v4 (`src/constructor/production/v4/*`, tests)
- Manufacturing export/specification
- Pricing source lock / server-authoritative pricing (`799b6f89`, `56e6daa1`, …)
- Three.js stability / WebGL recovery (`ae013f26`, `d3f4eb06`, …)
- Constructor3D CSS polish, state ownership, MVP E2E
- Admin order summary pricing alignment

**Review implication:** PR reviewers must treat Group F as **already on branch** — do not block customer/ops MVP review on unrelated areas unless regressions found; flag out-of-scope items explicitly in review comments.

---

## 4. PR Strategy Options

### Option 1 — Single PR (monolithic review)

| | |
|---|---|
| **Feasibility** | High — push branch, open one PR to `main` |
| **Pros** | Preserves exact QA-passed history; no cherry-pick/rebase risk; simplest ops |
| **Cons** | 126 commits / 351 files; mixed Group F history increases cognitive load |
| **Commands (when approved)** | `git push -u origin task/epic-b-projects-foundation` → `gh pr create --base main` |
| **Rollback** | Close PR; branch remains; no main mutation |

### Option 2 — Single PR + logical review sections (**recommended**)

| | |
|---|---|
| **Feasibility** | High — same as Option 1; add PR body structure + reviewer assignments |
| **Pros** | Matches D-14 sign-off; reviewers can approve by section; no history surgery |
| **Cons** | Still one large diff; requires disciplined review checklist |
| **Commands (when approved)** | Same as Option 1; PR description uses sections A–F below |
| **Rollback** | Same as Option 1 |

**Suggested review order:**

1. Group C (schema/migrations) — infra/security first  
2. Group A + B (API boundaries, ownership)  
3. Group E (tests)  
4. Group D (docs/evidence)  
5. Group F (spot-check only; note pre-existing scope)

### Option 3 — Split / stacked PRs

| | |
|---|---|
| **Feasibility** | **Low–medium** — commits and files are interdependent across groups |
| **Pros** | Smaller individual reviews; clearer ownership per PR |
| **Cons** | Requires cherry-pick/rebase or new branches; high risk of missing cross-cutting files (`api/orders.ts`, `order-domain.ts`, `App.tsx`, migrations); may break D-12 PASS parity |
| **Potential split (theoretical only)** | (1) Customer platform (2) Operations + lifecycle (3) Manual pricing + live + docs |
| **Commands (not recommended now)** | `git cherry-pick` ranges / `git rebase --onto` — **destructive, needs user approval** |
| **Rollback** | Complex; may require abandoning split branches |

---

## 5. Recommended PR Strategy

```text
Use ONE PR from task/epic-b-projects-foundation → main
with LOGICAL REVIEW SECTIONS (Option 2).

Do NOT split or rewrite history before merge unless maintainers
explicitly require it AND accept re-verification (D-12 + full QA).
```

### Pre-push checklist (execution task — not this task)

1. Confirm `main` is up to date (read-only `git fetch`; merge only when approved).
2. Optional: `git merge main` or rebase — **separate approved task**; re-run full QA + D-12 if conflict resolution touches API/schema.
3. `git push -u origin task/epic-b-projects-foundation`
4. Create PR with draft below.
5. Request reviewers by section (Product, Engineering, QA, Security).
6. **Do not** mark P1-27/P1-28 closed on PR open.
7. After merge: D-13 Visual QA on preview/production; then reconsider P1-27/P1-28 on `main` evidence.

### Live / deploy notes

- Vercel production currently tracks `main` — **does not include this branch**.
- After PR merge: preview deploy or production deploy is **separate approved step**.
- Live migrations already applied on staging project `gxfpgulkrpmlxfeuegpg` include customer/ops tables + `order_status_events.reason` — verify `main` migration parity before prod.

---

## 6. PR Description Draft (do not create PR yet)

```markdown
## Summary

Introduces signed MVP Customer Platform + Operations Workspace foundation on top of existing constructor/pricing/production work already present on this branch.

- Customer: auth, projects, order ownership, workspace, order detail, status timeline, notifications, change requests, payment instructions, completion visibility.
- Operations: workspace queue/filters, manual review, approve/reject with audit reason, manual pricing drafts, change request decisions, manual payment confirmation, order completion.
- Live verification: D-12 signed MVP path PASS on Supabase `gxfpgulkrpmlxfeuegpg` (safe test order `RZ-20260707-5271` / `RZM_0007`).
- Docs: P1-27/P1-28 reconciliation, MVP scope sign-off (D-01–D-16), D-12 preflight/execution evidence.

**Not release readiness.** P1-27/P1-28 remain `needs reconciliation`. D-13 Visual QA pending.

## Product Scope

Signed per `docs/planning/mvp-scope-decision-signoff.md`:
- In MVP: customer + operations flows, in-app notifications, manual payment, lifecycle to `Завершено`.
- Deferred: D-07 Approval View, D-15 cancellation request, D-16 email-code profile.
- Out of MVP: D-09, D-10; push/SMS (D-11 partial).

## Customer Platform Changes

- API routes under `/api/customer/*`, `/api/profile`, `/api/projects`, order submit ownership.
- Account UI, order detail, status timeline, notifications bell, change request form, payment instructions.
- Frontend API-only; no direct Supabase DB access from customer UI.

## Operations / Admin Changes

- API routes under `/api/operations/*` (admin auth required).
- Operations workspace UI, manual review, decision history, manual pricing draft, payment confirmation, order completion.
- Service Role server-side writes; deny-all RLS on MVP tables (except noted follow-up).

## Manual Pricing / Live Schema

- `order_manual_pricing_drafts` migration + API/UI.
- `order_status_events.reason` migration (applied live 2026-07-07).
- Live verify scripts: `npm run verify:live-manual-pricing-draft`, `npm run verify:live-signed-mvp-path`.

## D-12 Live Verification Evidence

- Runtime: local `vercel dev` + `.env.local` (`http://localhost:3004`).
- Full path: submit → CR → manual pricing → approve → payment confirm → complete → notifications/mark-read.
- Audit events verified with `reason` column.
- See `docs/planning/current-backlog.md` D-12 execution block.

## QA

- `npm test` PASS
- `npm run typecheck` PASS
- `npm run build` PASS
- D-12 live verification PASS (branch-local evidence)

## Security Follow-ups

- **`order_status_events` RLS disabled** on live — track before release (enable RLS + deny-all).
- Admin auth via `ADMIN_API_KEY` / session; customer JWT via Supabase Auth.
- No PII in API error logs (contract tests).

## Out of Scope (also on branch — review separately)

- Production JSON v4, manufacturing export, Three.js polish, pricing source lock commits pre-dating customer epic.
- Do not treat this PR as closing P1-27/P1-28 or M8-P1-02.

## Closure Status

- P1-27: `needs reconciliation` — **not closed by this PR alone**
- P1-28: `needs reconciliation` — **not closed by this PR alone**
- D-13 Visual QA: **required after merge**
- No production deploy performed in verification tasks

## Reviewer Checklist

### Product
- [ ] MVP scope D-01–D-16 reflected; deferred items not shipped as MVP
- [ ] Customer/admin boundaries match sign-off
- [ ] Lifecycle ladder: На проверке → Ожидает оплаты → В работе → Завершено

### Engineering
- [ ] API-only frontend; Service Role server-side only
- [ ] Customer ownership enforced on customer endpoints
- [ ] Operations endpoints require admin auth
- [ ] No production_export / audit leak in customer DTOs
- [ ] Migrations idempotent and documented in `deploy-all.sql`

### QA
- [ ] CI/local `npm test` green
- [ ] D-12 evidence reviewed (not re-run required for merge if unchanged)
- [ ] D-13 visual QA scheduled post-merge

### Security
- [ ] RLS deny-all on orders/profiles/notifications/CR/manual pricing
- [ ] `order_status_events` RLS follow-up ticket acknowledged
- [ ] No secrets in repo; `.env.local` not committed
```

---

## 7. Reviewer Checklist (standalone)

### Product reviewer

- [ ] `mvp-scope-decision-signoff.md` user sign-off honored
- [ ] Deferred/out-of-scope items not presented as shipped MVP
- [ ] Customer sees safe status DTO only (no audit/production JSON)
- [ ] Operations manual payment/completion matches signed process

### Engineering reviewer

- [ ] `api/orders.ts` ownership + submit auth boundaries
- [ ] Customer UUID vs business `RZ-*` id usage consistent
- [ ] Operations decision/payment/completion write `order_status_events` with `reason`
- [ ] Manual pricing draft does not mutate customer `total_price` unintentionally
- [ ] Tests cover contract flows (`tests/customer-*`, `tests/operations-*`)

### QA reviewer

- [ ] `npm test` / typecheck / build PASS on branch
- [ ] D-12 report: all steps `ok: true`
- [ ] D-13 visual QA plan exists post-merge
- [ ] Live verify scripts documented in runbook

### Security reviewer

- [ ] Admin API key not exposed to browser bundle
- [ ] Customer JWT validation via `verifyCustomerAccessToken`
- [ ] RLS deny-all policies on MVP tables (live MCP evidence)
- [ ] **`order_status_events` RLS disabled** — release blocker follow-up
- [ ] Resend/email failures non-blocking per policy (order still succeeds)

---

## 8. Risks & Follow-ups

| Risk | Mitigation |
|------|------------|
| Large mixed PR (Group F history) | Sectioned review; explicit out-of-scope list in PR body |
| Merge conflicts with `main` | Dedicated merge task; full QA + optional D-12 re-run |
| `order_status_events` RLS disabled | Separate infra migration approval before release |
| No Vercel preview of branch yet | Push branch → preview deploy before D-13 |
| P1-27/P1-28 premature closure | PR template states not closure; backlog unchanged until `main` evidence |
| Live schema ahead of `main` | Document applied migrations; ensure `deploy-all.sql` parity on merge |

---

## 9. References

- `docs/planning/mvp-scope-decision-signoff.md` (D-14 accepted as process)
- `docs/planning/p1-27-p1-28-reconciliation.md`
- `docs/planning/d12-live-verification-preflight.md`
- `docs/production/vercel-deploy-runbook.md`

---

*Planning artifact only. No push, merge, PR, or deploy performed.*
