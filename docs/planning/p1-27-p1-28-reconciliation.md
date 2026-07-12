# P1-27 / P1-28 Product Scope Reconciliation Package

> **Date:** 2026-07-07  
> **Branch:** `task/epic-b-projects-foundation`  
> **HEAD:** `86d60f5d` (at package preparation start)  
> **Agent:** 01 Product / Planning Agent  
> **Type:** decision package — **not closure**, **not implementation**

## Purpose

Reconcile branch-local customer + operations implementation evidence against Release v1 scope boundaries for:

- **P1-27** — Customer Platform MVP Scope Reconciliation (`needs reconciliation`)
- **P1-28** — Admin MVP Scope Boundary Reconciliation (`needs reconciliation`)

**Rule:** implementation proves capability; product scope still requires explicit reconciliation and merged/main evidence before closure.

## Source of Truth Used

1. `AGENTS.md`
2. `docs/planning/current-backlog.md` (P1-27, P1-28 blocks + branch evidence)
3. `docs/planning/mvp-scope.md` (Release v1 Scope)
4. `docs/planning/accepted-backlog-decisions-v1.md` (§12 floor, §18 Release v1 layer)
5. `docs/specification/volume-07-customer-platform/README.md` (RPES VII)
6. `docs/specification/volume-08-admin-platform/README.md` (RPES VIII)
7. `docs/production/vercel-deploy-runbook.md` (§§7–11)
8. Branch implementation + tests (read-only audit)

---

## Phase 1 — Scope Inventory (branch-local)

| # | Product area | Key APIs / UI | Tests | Commits (spine) | Local / Live | Product-approved? |
|---|--------------|---------------|-------|-----------------|--------------|-------------------|
| 1 | Customer account / workspace | `GET /api/customer/workspace`, `CustomerAccountCabinet` | `test:customer-workspace`, `test:customer-account` | `8de2aa77` | Local mock; live order submit verified separately | **Release v1 yes** (RPES VII); closure **no** |
| 2 | Order ownership / submit | `POST /api/orders`, ownership columns | `test:customer-order-submit` | `0c159a5f` | Live smoke PASS post-greenfield (`RZ-20260706-7048`) | **Release v1 yes** |
| 3 | Projects / drafts | `GET/POST /api/projects`, constructor sync | `test:customer-projects`, `test:customer-project-resume` | `a4b4f45f`…`bd9c705c` | Local | **Release v1 yes** |
| 4 | Order detail / profile | `GET /api/customer/order`, `GET/PATCH /api/profile` | `test:customer-order-detail`, `test:customer-profile-edit` | `56637183`, `8d72cc88` | Local | **Release v1 yes**; email-code profile edit **gap** |
| 5 | Customer status / timeline | `mapCustomerOrderStatus`, `CustomerOrderStatusTimeline` | `test:customer-order-detail` | `23e7bb7a`, `cd2ac2c7` | Local | **Release v1 yes** (full ladder) |
| 6 | Notifications | `GET/PATCH /api/customer/notifications`, bell UI | `test:customer-notifications*` | `9a019695`…`a867de4e` | Local | **Release v1 yes** (in-app); email channel **partial** |
| 7 | Change requests | `POST /api/customer/change-request`, form UI | `test:customer-change-request*` | `a3598399`, `7a231666` | Local | **Release v1 yes** |
| 8 | Operations workspace | `GET /api/operations/workspace`, filters/counts | `test:operations-workspace*` | `782cb441`, `c5145c85`, `7f3e8172` | Local | **Release v1 yes** (RV1-E) |
| 9 | Manual review | `GET /api/operations/order`, `OperationsManualReviewView` | `test:operations-order-review`, `test:operations-manual-review-ui` | `58557e54` | Local; live readback PASS | **Release v1 yes** |
| 10 | Manual pricing | `POST /api/operations/manual-pricing-draft` | `test:operations-manual-pricing-*` | `eeff5848`, `be875ef3` | **Live verify PASS** (draft only) | **Needs product decision** on customer-facing price |
| 11 | Approve / reject | `POST /api/operations/order-decision` | `test:operations-order-decision`, contract | `94ad3d2c`…`241db432` | Local | **Release v1 yes** |
| 12 | Audit reason / history | `order_status_events`, history sections | migration-prep, decision tests | `36f8cb07`, `d503b7dd` | Local; migration not live-applied (reason col) | **Release v1 yes** (internal) |
| 13 | CR operations | `POST /api/operations/change-request-decision` | `test:operations-change-request-decision` | `4394650e` | Local | **Release v1 yes** |
| 14 | Manual payment | `POST /api/operations/payment-confirmation`, instructions UI | `test:payment-readiness-domain`, `test:manual-payment-flow-contract` | `93d8cac9`…`72e2beb0` | Local | **Release v1 yes** (manual, no provider) |
| 15 | Lifecycle completion | `POST /api/operations/order-completion` | `test:order-completion-domain`, `test:operations-order-completion` | `cd2ac2c7`…`aaef8b7e` | Local | **Release v1 yes** |
| 16 | Runbooks | `vercel-deploy-runbook.md` §§7–11 | — | `15acb0ad`…`86d60f5d` | Docs | Supporting |
| 17 | Live evidence | Greenfield schema, order submit, manual pricing | live verify scripts | `4430ae5b`, `3dfacec0` | **Partial live** | Not closure |

### Blocked / partial evidence

| Item | Status |
|------|--------|
| Manual pricing live verify (early runs) | `blocked/partial-live-verification` (missing env) — later PASS |
| Order submit (pre-greenfield) | `blocked/needs-fix` — URL normalize fixed |
| Live MCP schema audit | `done (audit only)` |
| Greenfield reconciliation | `done (QA PASS, not closure)` |
| Manual pricing live verify (final) | `done (Live Supabase verification PASS, not closure)` |

---

## Phase 2 — P1-27 Decision Matrix

| Capability | Impl? | Tested? | Live? | In P1-27 / Release v1 scope? | Evidence | Gap / Decision |
|------------|------:|--------:|------:|------------------------------|----------|----------------|
| Customer auth / account access | Yes | Yes | Partial | **Included in MVP** | Epic A, auth tests | Merged/main inventory missing |
| Project ownership / drafts | Yes | Yes | No | **Included in MVP** | `test:customer-projects` | Preview path optional |
| Order ownership at submit | Yes | Yes | **Yes** | **Included in MVP** | greenfield smoke | — |
| Order submit (auth required) | Yes | Yes | **Yes** | **Included in MVP** | `RZ-20260706-7048` | — |
| Customer workspace (list) | Yes | Yes | No | **Included in MVP** | workspace API | — |
| Order detail (read-only) | Yes | Yes | No | **Included in MVP** | order detail card | ETA field **not verified** |
| Customer profile edit | Yes | Yes | No | **Implemented, needs product decision** | PATCH profile | RPES: email-code for FIO/phone **not implemented** |
| In-app notifications | Yes | Yes | No | **Included in MVP** | notifications API/UI | — |
| Unread count / mark read | Yes | Yes | No | **Included in MVP** | bell + tests | — |
| Status timeline (full ladder) | Yes | Yes | No | **Included in MVP** | RPES VII ladder | — |
| Change request submission | Yes | Yes | No | **Included in MVP** | only in `Проверка` | — |
| Customer view of CR status | Partial | Yes | No | **Included in MVP** | via notifications | Dedicated CR status UI **limited** |
| Payment instructions | Yes | Yes | No | **Included in MVP** | `Оплата` state | No payment link automation |
| Lifecycle completion visibility | Yes | Yes | No | **Included in MVP** | `Завершено` stage | — |
| No internal/ops data leakage | Yes | Yes | No | **Must-have** | forbidden keys tests | Ongoing contract discipline |
| No direct frontend DB | Yes | Yes | N/A | **Must-have** | API-only pattern | — |
| RLS / Service Role boundary | Yes | Tests | **Yes** (greenfield) | **Must-have** | deny-all migrations | Full live gate open (M8-P1-02) |
| Email notifications (core events) | Partial | Partial | Partial | **Included in MVP** | order submit emails | Retry queue **out** (M9-P1-03) |
| Customer cancellation request | **No** | — | — | **In Release v1 scope** | mvp-scope.md | **Gap — not implemented** |
| Approval View (customer price) | **No** | — | — | **In Release v1 scope** | mvp-scope pricing | Manual pricing draft **internal only** |
| Order card preview image | Partial | — | — | **In Release v1 scope** | projects have preview | Order card preview **not verified** |
| Email-code profile confirmation | **No** | — | — | **In Release v1 scope** | RPES VII | **Gap — simple PATCH only** |
| Visual QA (cabinet/checkout) | — | — | — | **Gate required** | P2-20/21, M8-P1-01 | **Open** |

### P1-27 classification summary

| Class | Items |
|-------|-------|
| **Included in MVP** | Auth, projects, submit, workspace, order detail, notifications, timeline, CR submit, payment instructions, completion visibility, safe read model |
| **Excluded from MVP** | Online payment, push/SMS, OAuth |
| **Implemented but needs product decision** | Profile edit without email-code; manual pricing visibility to customer |
| **Implemented but needs live verification** | Full customer path on staging/preview deploy |
| **Implemented but needs visual QA** | Account cabinet, order card, checkout auth gate |
| **Out of scope for P1-27** | Operations workspace internals, production editor |

---

## Phase 3 — P1-28 Decision Matrix

| Capability | Impl? | Tested? | Live? | In P1-28 / Release v1 scope? | Evidence | Gap / Decision |
|------------|------:|--------:|------:|------------------------------|----------|----------------|
| Operations workspace queue | Yes | Yes | Partial | **Included in MVP Admin** | `/operations` | Not legacy `/admin` dashboard |
| Queue filters / counts | Yes | Yes | No | **Included** | domain status filters | — |
| Manual review / approval summary | Yes | Yes | **Yes** (readback) | **Included** | manual review view | — |
| Manual pricing draft read | Yes | Yes | **Yes** | **Included** | operations order API | — |
| Manual pricing write | Yes | Yes | **Yes** | **Included** | live draft verify | Does not update customer `total_price` |
| Approve / reject | Yes | Yes | No | **Included** | order-decision API | — |
| Audit reason / history | Yes | Yes | No | **Included** | status events | Reason column migration **not live-applied** |
| Change request readback | Yes | Yes | No | **Included** | review DTO | — |
| Change request decision | Yes | Yes | No | **Included** | CR decision API | — |
| Manual payment confirmation | Yes | Yes | No | **Included** | payment-confirmation API | Not real payment provider |
| Order completion | Yes | Yes | No | **Included** | order-completion API | — |
| Customer notifications from ops | Yes | Yes | No | **Included** | best-effort inserts | Email parallel **partial** |
| Production handoff automation | **No** | — | — | **Explicitly out of MVP** | `production_export` untouched | Correct per scope |
| Admin / operation editor (P2-09) | **No** | — | — | **Out of MVP** | backlog blocks on P1-28 | Do not expand |
| Payment provider integration | **No** | — | — | **Out of MVP** | manual only | Correct |
| Manufacturing / БАЗИС automation | **No** | — | — | **Out of MVP** | manual B3D | Correct |
| Approval View (distinct surface) | **No** | — | — | **In Release v1 scope** | mvp-scope | **Gap — price approval UX** |
| Legacy admin dashboard | Partial | — | — | **§12 floor** | `AdminOrderDetailPage` reuse | Operations route is primary |
| Visual QA (operations UI) | — | — | — | **Gate required** | P2-25, M8-P1-01 | **Open** |
| Live verification (full ops path) | Partial | — | Partial | **Gate required** | M8-P1-02, M9-P1-02 | Not closure |

### P1-28 classification summary

| Class | Items |
|-------|-------|
| **Included in MVP Admin/Operations** | Workspace, filters, manual review, pricing draft R/W, decisions, audit, CR ops, manual payment, completion |
| **Excluded from MVP** | Online payment, production editor, auto B3D, CRM |
| **Implemented but needs product decision** | Manual pricing → customer final price; Approval View vs draft-only |
| **Implemented but needs live verification** | End-to-end ops path on preview; audit migration apply |
| **Implemented but needs visual QA** | Operations workspace, manual review screens |
| **Must remain local-only until merge** | All branch evidence |
| **Out of scope for P1-28** | P2-09 editor, automatic production handoff |

---

## Phase 4 — Scope Risks

| Risk | Impact | Recommendation | Blocks closure? |
|------|--------|----------------|----------------:|
| Branch evidence mistaken for closure | High | Label all evidence `not closure`; require merged/main | **Yes** |
| Large mixed branch (pricing/3D/customer) | High | Split PRs by domain before review | **Yes** (for safe merge) |
| Scope broader than §12 minimal admin | Medium | Accept as Release v1 Workspace per §18; document floor vs workspace | **Yes** (P1-28) |
| Manual pricing ≠ customer final price | High | Product decision D-06/D-07 before release | **Yes** |
| Manual payment ≠ real provider | Low | Accept for Release v1; document in runbook | No (if accepted) |
| No production handoff automation | Low | Explicitly out of scope | No |
| Email/push incomplete | Medium | In-app OK for foundation; email retry = M9-P1-03 | **Yes** (exit criteria) |
| Live verification partial | High | Complete M8-P1-02 on preview deploy | **Yes** |
| Visual QA open | High | M8-P1-01 before public release | **Yes** |
| P1-27/P1-28 open | High | User sign-off on this package | **Yes** |
| No remote branch / no push | Medium | Push when ready to avoid local loss | No (process) |
| Gaps: cancellation request, Approval View, email-code profile | Medium | Track as follow-up or narrow Release v1 claim | **Yes** (full RPES parity) |

---

## Phase 5 — Decision Register

| ID | Decision | Options | **Recommended** | Rationale | P1-27 / P1-28 | Impl exists? | More work? |
|----|----------|---------|---------------|-----------|---------------|--------------|------------|
| **D-01** | Customer lifecycle ladder in MVP? | Full ladder / shortened | **Full ladder** | RPES VII + mvp-scope + branch impl | Both | Yes | Live + visual only |
| **D-02** | In-app notifications in MVP? | Yes / defer | **Yes** | mvp-scope notification center | P1-27 | Yes | Email parity |
| **D-03** | Customer change requests in MVP? | Yes / defer | **Yes** | RPES IX + branch impl | Both | Yes | CR status UX polish |
| **D-04** | Manual payment confirmation in MVP? | Yes / defer | **Yes** | RV1-G, no online payment | P1-28 | Yes | Live smoke |
| **D-05** | Order completion in MVP? | Yes / defer | **Yes** | RPES VII terminal state | Both | Yes | — |
| **D-06** | Manual pricing draft scope | Internal-only / customer-visible draft | **Internal-only (MVP)** | Matches current impl; avoids silent price change | P1-28 | Yes | Approval View if customer-visible |
| **D-07** | Should manual pricing update customer final price? | Never without approval / auto-update | **Never without customer Approval View** | mvp-scope: growth needs approval | P1-28 | No auto-update | Build Approval View or defer price changes |
| **D-08** | Minimal Operations/Admin MVP | §12 floor only / full Workspace | **Release v1 Workspace (implemented set)** | §18 reconciles floor + workspace | P1-28 | Mostly yes | Dashboard metrics deferred |
| **D-09** | Production handoff in MVP? | Automated / manual | **Manual (out of automation)** | mvp-scope, B3D manual | P1-28 | JSON at submit | No auto handoff |
| **D-10** | Admin editor in MVP? | In / out | **Out** | P2-09 blocked on P1-28 | P1-28 | No | — |
| **D-11** | Email/push in MVP? | Email+in-app / in-app only | **Email + in-app; no push/SMS** | mvp-scope | P1-27 | Partial email | M9-P1-03 retry |
| **D-12** | Live verification before PR-ready? | Full M8-P1-02 / subset | **Order submit + ops decisions + pricing draft on preview** | Release gate | Both | Partial | Staging deploy |
| **D-13** | Visual QA required? | Full matrix / constructor only | **Constructor + checkout + account + operations** | Exit criteria §8 | Both | No | M8-P1-01 |
| **D-14** | Split branch before PR? | Monolith PR / split | **Split: (1) customer platform (2) operations (3) docs/live** | Reviewability | Both | N/A | Rebase/cherry-pick plan |
| **D-15** | Customer cancellation request | Implement / defer Release v1 | **Implement or explicitly defer in P1-27 closure** | mvp-scope requires CR-style cancel | P1-27 | **No** | New task if in |
| **D-16** | Email-code profile edit | Implement / accept simple PATCH for MVP | **Defer email-code; document exception** | Branch has PATCH only | P1-27 | Partial | Security review |

---

## Phase 6 — Recommended MVP Boundaries

### Recommended P1-27 Customer MVP Boundary

**Must-have in MVP (accept branch implementation as target):**

- Auth gate + header login; email/password registration
- Projects/drafts (server-side, max 3 active)
- Authenticated order submit with `RZM_NNNN` + `domain_status`
- Customer cabinet: projects list, orders list, order detail card
- Safe customer status + progress timeline (full ladder)
- In-app notification center + unread indicator
- Change request submission in `Проверка`
- Payment instructions in `Оплата`
- Read-only order detail without production/audit leakage
- API-only; RLS deny-all

**Explicitly out of MVP:**

- Online payment, OAuth, push/SMS
- Customer direct order edit / instant cancel
- Production JSON / internal audit exposure

**Implemented but not required for MVP closure evidence alone:**

- Full lifecycle completion visibility (helps but needs merge/main)

**Requires product decision:**

- Profile edit without email-code (D-16)
- Customer cancellation request (D-15)
- Manual pricing visibility (D-06/D-07)
- Order card preview / ETA completeness

**Requires live verification:**

- Full customer path on preview/staging (M8-P1-02)

**Requires visual QA:**

- Account cabinet, order detail, auth gate (M8-P1-01, P2-20/21)

### Recommended P1-28 Admin / Operations MVP Boundary

**Must-have in MVP (accept branch implementation as target):**

- Order Operations Workspace: queue, filters, counts, order detail review
- Manual review: approve/reject with audit reason + history
- Manual pricing draft read/write (internal, no customer price mutation)
- Change request readback + manager decisions
- Manual payment confirmation (`Оплата` → `В работе`)
- Order completion (`В работе` → `Завершено`)
- Customer notifications triggered by operations events (in-app)
- Service Role server-side; no production_export mutation in status flows

**Explicitly out of MVP:**

- Payment provider / webhooks
- Production editor (P2-09)
- Automatic B3D / БАЗИС handoff
- Manager manual JSON editing
- CRM features

**Implemented but not required for closure alone:**

- Entire branch-local ops foundation (needs merge/main)

**Requires product decision:**

- Approval View for price increases (D-07)
- Workspace vs legacy admin routing canonical URL

**Requires live verification:**

- Ops decision + payment + completion smoke on preview
- `order_status_events.reason` migration apply if needed

**Requires visual QA:**

- Operations workspace + manual review (P2-25)

---

## Phase 7 — Closure Blockers (unchanged status)

| Task | Status after this package | Action |
|------|---------------------------|--------|
| P1-27 | **`needs reconciliation`** | User approves recommended boundary + gaps |
| P1-28 | **`needs reconciliation`** | User approves Workspace scope vs §12 floor |

**This document does not close P1-27 or P1-28.**

---

## Recommended Next Action

1. **User review** of Decision Register (D-01–D-16) — especially D-06, D-07, D-15, D-16.
2. On approval: update `accepted-backlog-decisions-v1.md` or formal scope note (separate planning task).
3. **Live verification path:** push branch → preview deploy → M8-P1-02 subset.
4. **Do not merge** until visual QA plan scheduled and gap tasks (cancellation, Approval View) are accepted or deferred in writing.

---

## Appendix — Commit spine reference (customer + operations)

Chronological from `a4b4f45f` to `86d60f5d` (58 commits). See handoff report or `git log --reverse a4b4f45f..HEAD`.

---

*Prepared locally on `task/epic-b-projects-foundation`. Not merged/main closure evidence.*
