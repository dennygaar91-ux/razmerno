# MVP Scope Decision Sign-off Pack

> **Date:** 2026-07-07  
> **Branch:** `task/epic-b-projects-foundation`  
> **Based on:** `docs/planning/p1-27-p1-28-reconciliation.md` (commit `95e4e988`)  
> **Agent:** 01 Product / Planning Agent  
> **Type:** product decision preparation — **not closure**, **not release readiness**

---

## 1. Executive Summary

This document converts the P1-27 / P1-28 reconciliation recommendations into **explicit product decisions** (D-01–D-16) that guide the next phase: live verification, PR preparation, cross-agent backlog work, and future MVP boundary alignment.

**Clear statements:**

- This is **not P1-27 closure**.
- This is **not P1-28 closure**.
- This is **not release readiness**.
- This is **product decision preparation** for user sign-off.

Branch-local implementation on `task/epic-b-projects-foundation` demonstrates capability; **user acceptance of this sign-off pack** is required before treating these decisions as binding for closure or release gates.

**Reconciliation alignment:** No conflicts found between this sign-off pack and `p1-27-p1-28-reconciliation.md`. D-15 is explicitly **deferred from MVP** (reconciliation allowed “implement or defer”; defer chosen here).

---

## 2. Decision Status Legend

| Status | Meaning |
|--------|---------|
| **Accepted for MVP** | In Release v1 customer/operations boundary; branch implementation aligns |
| **Deferred from MVP** | Documented Release v1 aspiration; not required for next phase gates |
| **Out of MVP** | Explicitly excluded from Release v1 |
| **Needs explicit user sign-off** | Recommendation recorded; user must accept/reject before closure |
| **Needs live verification** | Accepted in principle; M8-P1-02 / preview smoke required |
| **Needs visual QA** | Accepted in principle; M8-P1-01 / P2 visual gates required |
| **Needs cross-agent work** | Depends on another agent or backlog task |

---

## 3. Decision Register D-01–D-16

### D-01 — Lifecycle ladder in MVP

| Field | Value |
|-------|-------|
| **Question** | Is the full customer domain lifecycle ladder in MVP? |
| **Recommended decision** | Full ladder: `Проверка → Оплата → В работе → Завершено` (+ `Отмена` terminal) |
| **Status** | **Accepted for MVP** · Needs live verification · Needs visual QA · **Needs explicit user sign-off** |
| **Rationale** | RPES VII, `mvp-scope.md`, branch `mapCustomerOrderStatus` + timeline implemented |
| **Impact P1-27** | Core customer visibility scope |
| **Impact P1-28** | Ops transitions must match ladder |
| **Implementation state** | **Done** on branch (local tests PASS) |
| **Remaining work** | Preview live smoke; account/order card visual QA |
| **Closure blockers** | User sign-off; live + visual gates; merged/main evidence |

### D-02 — In-app notifications in MVP

| Field | Value |
|-------|-------|
| **Question** | Are in-app notifications (center + unread) in MVP? |
| **Recommended decision** | Yes — notification center in customer cabinet |
| **Status** | **Accepted for MVP** · Needs live verification · **Needs explicit user sign-off** |
| **Rationale** | `mvp-scope.md` notification center; branch API + UI + contract tests |
| **Impact P1-27** | Customer platform must-have |
| **Impact P1-28** | Ops events trigger in-app notifications (best-effort) |
| **Implementation state** | **Done** on branch |
| **Remaining work** | Live path verification on preview |
| **Closure blockers** | User sign-off; M8-P1-02 subset |

### D-03 — Customer change requests in MVP

| Field | Value |
|-------|-------|
| **Question** | Are customer change requests in MVP? |
| **Recommended decision** | Yes — submit in `Проверка`; ops decisions |
| **Status** | **Accepted for MVP** · **Needs explicit user sign-off** |
| **Rationale** | RPES IX + RV1-D; branch CR API/UI + ops decision flow |
| **Impact P1-27** | Customer action in review stage |
| **Impact P1-28** | CR readback + decision in workspace |
| **Implementation state** | **Done** on branch; dedicated CR status UI limited (notifications) |
| **Remaining work** | Optional UX polish for CR status display |
| **Closure blockers** | User sign-off; live smoke |

### D-04 — Manual payment confirmation in MVP

| Field | Value |
|-------|-------|
| **Question** | Is manual payment confirmation (no provider) in MVP? |
| **Recommended decision** | Yes — `Оплата → В работе`; customer instructions block |
| **Status** | **Accepted for MVP** · Needs live verification · **Needs explicit user sign-off** |
| **Rationale** | RV1-G; online payment out of scope |
| **Impact P1-27** | Payment instructions + status transition visibility |
| **Impact P1-28** | `POST /api/operations/payment-confirmation` |
| **Implementation state** | **Done** on branch |
| **Remaining work** | Live ops payment smoke on preview |
| **Closure blockers** | User sign-off; live verification |

### D-05 — Order completion in MVP

| Field | Value |
|-------|-------|
| **Question** | Is order completion (`В работе → Завершено`) in MVP? |
| **Recommended decision** | Yes |
| **Status** | **Accepted for MVP** · Needs live verification · **Needs explicit user sign-off** |
| **Rationale** | RPES VII terminal state; branch completion API + customer timeline |
| **Impact P1-27** | Customer sees `Завершено` |
| **Impact P1-28** | `POST /api/operations/order-completion` |
| **Implementation state** | **Done** on branch |
| **Remaining work** | Live completion smoke |
| **Closure blockers** | User sign-off; live verification |

### D-06 — Manual pricing draft scope

| Field | Value |
|-------|-------|
| **Question** | Is manual pricing draft customer-visible or internal-only? |
| **Recommended decision** | **Internal-only (operations)** — draft does not change customer-facing price |
| **Status** | **Accepted for MVP** (as internal-only) · **Needs explicit user sign-off** |
| **Rationale** | Matches current impl; avoids silent customer price change |
| **Impact P1-27** | Customer sees stored submit snapshot only |
| **Impact P1-28** | Manual pricing draft R/W in review |
| **Implementation state** | **Done** on branch; live draft verify PASS |
| **Remaining work** | Document in runbook; no customer price mutation |
| **Closure blockers** | User sign-off; D-07 linkage |

### D-07 — Customer final price update policy

| Field | Value |
|-------|-------|
| **Question** | May manual pricing update customer `total_price` without approval? |
| **Recommended decision** | **No** — never without customer **Approval View** |
| **Status** | **Deferred from MVP** (Approval View) · **Needs explicit user sign-off** |
| **Rationale** | `mvp-scope.md`: price growth after submit requires customer approval |
| **Impact P1-27** | No Approval View UI on branch |
| **Impact P1-28** | Price changes remain draft-only until Approval View exists |
| **Implementation state** | **Not implemented** (correct per deferral) |
| **Remaining work** | Future task: Approval View or explicit narrow scope exception |
| **Closure blockers** | User sign-off on deferral; blocks full RPES pricing-approval parity |

### D-08 — Minimal Operations/Admin MVP scope

| Field | Value |
|-------|-------|
| **Question** | §12 minimal floor vs Release v1 Operations Workspace? |
| **Recommended decision** | **Release v1 Operations Workspace** (implemented set on branch) |
| **Status** | **Accepted for MVP** · **Needs explicit user sign-off** |
| **Rationale** | `accepted-backlog-decisions-v1.md` §18 over §12 floor |
| **Impact P1-27** | Indirect (ops enables customer lifecycle) |
| **Impact P1-28** | Defines admin boundary for reconciliation |
| **Implementation state** | **Mostly done** on branch (`/operations` primary) |
| **Remaining work** | Canonical routing note; dashboard metrics deferred |
| **Closure blockers** | User sign-off; P1-28 reconciliation |

### D-09 — Production handoff boundary

| Field | Value |
|-------|-------|
| **Question** | Is automated production handoff in MVP? |
| **Recommended decision** | **Out of MVP** — manual B3D; JSON at submit only |
| **Status** | **Out of MVP** |
| **Rationale** | `mvp-scope.md`; `production_export` not mutated in status flows |
| **Impact P1-27** | Customer does not see production handoff automation |
| **Impact P1-28** | Ops does not auto-handoff to Basis |
| **Implementation state** | Correctly absent |
| **Remaining work** | None for MVP boundary |
| **Closure blockers** | None if accepted |

### D-10 — Admin editor boundary

| Field | Value |
|-------|-------|
| **Question** | Is per-panel/hole admin editor (P2-09) in MVP? |
| **Recommended decision** | **Out of MVP** |
| **Status** | **Out of MVP** |
| **Rationale** | P2-09 blocked on P1-28; `mvp-scope.md` excludes complex production editor |
| **Impact P1-27** | None |
| **Impact P1-28** | Do not expand before reconciliation closes |
| **Implementation state** | Not implemented |
| **Remaining work** | P2-09 after P1-28 |
| **Closure blockers** | None if accepted |

### D-11 — Email/push boundary

| Field | Value |
|-------|-------|
| **Question** | Which notification channels in MVP? |
| **Recommended decision** | **In-app accepted**; **email** for core events where already wired; **push/SMS out** |
| **Status** | **Partially accepted** · Needs cross-agent work (M9-P1-03) · **Needs explicit user sign-off** |
| **Rationale** | `mvp-scope.md` email + notification center; retry queue deferred |
| **Impact P1-27** | In-app done; email partial at submit |
| **Impact P1-28** | Ops triggers in-app; email parity incomplete |
| **Implementation state** | In-app **done**; email **partial**; retry **not done** |
| **Remaining work** | M9-P1-03 email retry queue (04 API agent) |
| **Closure blockers** | User sign-off; exit criteria email reliability |

### D-12 — Live verification before PR/release

| Field | Value |
|-------|-------|
| **Question** | What live verification before PR-ready / release? |
| **Recommended decision** | **Required** — preview: order submit + ops decisions + payment + completion + pricing draft readback |
| **Status** | **Needs live verification** · **Needs explicit user sign-off** |
| **Rationale** | M8-P1-02 release gate; partial greenfield evidence exists |
| **Impact P1-27** | Full customer path on staging |
| **Impact P1-28** | Full ops path on staging |
| **Implementation state** | Partial (greenfield + manual pricing live PASS) |
| **Remaining work** | Push → preview deploy → runbook §§3–6 + live scripts |
| **Closure blockers** | M8-P1-02 not closed |

### D-13 — Visual QA before release

| Field | Value |
|-------|-------|
| **Question** | What visual QA before public release? |
| **Recommended decision** | **Required** — constructor + checkout + account + operations |
| **Status** | **Needs visual QA** · **Needs explicit user sign-off** |
| **Rationale** | `mvp-scope.md` exit criteria §8; M8-P1-01 open |
| **Impact P1-27** | Cabinet, order card, auth gate |
| **Impact P1-28** | Operations workspace, manual review (P2-25) |
| **Implementation state** | Not verified visually |
| **Remaining work** | M8-P1-01 execution; P2-20/21 |
| **Closure blockers** | Human visual approval |

### D-14 — Branch split / review strategy

| Field | Value |
|-------|-------|
| **Question** | Monolith PR vs split? |
| **Recommended decision** | **Split** into logical review units: (1) customer platform (2) operations (3) docs/live evidence |
| **Status** | **Accepted for MVP** (process) · **Needs explicit user sign-off** |
| **Rationale** | Mixed branch history; reviewability |
| **Impact P1-27** | Customer PR scope clarity |
| **Impact P1-28** | Operations PR scope clarity |
| **Implementation state** | N/A — process decision |
| **Remaining work** | Cherry-pick/rebase plan before push |
| **Closure blockers** | None for scope; affects merge safety |

### D-15 — Customer cancellation request

| Field | Value |
|-------|-------|
| **Question** | Is customer cancellation request in MVP? |
| **Recommended decision** | **Deferred from MVP** |
| **Status** | **Deferred from MVP** · **Needs explicit user sign-off** |
| **Rationale** | `mvp-scope.md` lists CR-style cancel; **not implemented** on branch; defer to post-MVP or follow-up task |
| **Impact P1-27** | Gap vs full RPES VII cancel semantics |
| **Impact P1-28** | No ops cancel-request workflow |
| **Implementation state** | **Not implemented** |
| **Remaining work** | New backlog task if promoted back into MVP |
| **Closure blockers** | User must accept deferral for P1-27 narrow closure |

### D-16 — Email-code profile edit confirmation

| Field | Value |
|-------|-------|
| **Question** | Is email-code confirmation required for FIO/phone edit? |
| **Recommended decision** | **Deferred from MVP** — accept simple PATCH with documented exception |
| **Status** | **Deferred from MVP** · **Needs explicit user sign-off** |
| **Rationale** | Branch has `PATCH /api/profile` without email-code; RPES VII aspirational |
| **Impact P1-27** | Security/UX gap documented |
| **Impact P1-28** | None |
| **Implementation state** | Partial (PATCH only) |
| **Remaining work** | Security review note; future email-code task |
| **Closure blockers** | User accept deferral |

---

## 4. Recommended Decisions (summary)

| ID | Recommended decision | Status |
|----|----------------------|--------|
| D-01 | Full lifecycle ladder | Accepted for MVP |
| D-02 | In-app notifications | Accepted for MVP |
| D-03 | Customer change requests | Accepted for MVP |
| D-04 | Manual payment confirmation (no provider) | Accepted for MVP |
| D-05 | Order completion | Accepted for MVP |
| D-06 | Manual pricing draft internal-only | Accepted for MVP (internal-only) |
| D-07 | No customer final price update without Approval View | Deferred from MVP |
| D-08 | Release v1 Operations Workspace | Accepted for MVP |
| D-09 | Production handoff automation | Out of MVP |
| D-10 | Admin editor (P2-09) | Out of MVP |
| D-11 | In-app + email (existing); push/SMS out | Partially accepted |
| D-12 | Live verification required before release | Needs live verification |
| D-13 | Visual QA required before release | Needs visual QA |
| D-14 | Split branch/PR logically | Accepted (process) |
| D-15 | Customer cancellation request | Deferred from MVP |
| D-16 | Email-code profile confirmation | Deferred from MVP |

**Conflict note:** None vs `p1-27-p1-28-reconciliation.md`.

---

## 5. MVP Boundary — Customer

### Accepted for MVP

- Auth gate + header login; email/password registration
- Server-side projects/drafts (max 3 active); constructor sync
- Authenticated order submit; `RZM_NNNN`; `domain_status` at submit
- Customer cabinet: projects, orders list, order detail (read-only)
- Safe status + full progress timeline
- In-app notification center + unread count + mark read
- Change request submission in `Проверка`
- Payment instructions when `Оплата`
- Lifecycle visibility through `Завершено`
- API-only access; no production JSON / audit / PII leakage to customer DTOs
- RLS deny-all; Service Role server-side

### Deferred / Out of MVP

| Item | Classification |
|------|----------------|
| Customer cancellation request (D-15) | **Deferred from MVP** |
| Email-code profile edit (D-16) | **Deferred from MVP** |
| Approval View / customer price approval (D-07) | **Deferred from MVP** |
| Online payment, OAuth | **Out of MVP** |
| Push / SMS | **Out of MVP** |
| Customer production JSON / internal audit | **Out of MVP** |
| Instant customer cancel | **Out of MVP** (defer uses request model when built) |

### Requires verification

- **Live:** full customer path on preview (M8-P1-02) — submit → cabinet → order detail → notifications
- **Visual QA:** account cabinet, order detail card, checkout auth gate (M8-P1-01, P2-20/21)
- **Cross-agent:** email retry reliability (M9-P1-03) for exit criteria

---

## 6. MVP Boundary — Operations/Admin

### Accepted for MVP

- Order Operations Workspace: queue, domain filters/counts, order detail route
- Manual review + approval summary
- Approve/reject with audit reason + decision history
- Manual pricing draft read/write (**internal-only**, D-06)
- Change request readback + manager decisions
- Manual payment confirmation (`Оплата` → `В работе`)
- Order completion (`В работе` → `Завершено`)
- In-app customer notifications on ops events (best-effort)
- Service Role server-side; status flows do not mutate `production_export`

### Deferred / Out of MVP

| Item | Classification |
|------|----------------|
| Production handoff automation (D-09) | **Out of MVP** |
| Admin / operation editor P2-09 (D-10) | **Out of MVP** |
| БАЗИС / automatic B3D | **Out of MVP** |
| Real payment provider / webhooks | **Out of MVP** |
| CRM / sales pipeline | **Out of MVP** |
| Manager manual JSON editing | **Out of MVP** |
| Customer final price update without Approval View (D-07) | **Deferred from MVP** |
| Full admin dashboard metrics | **Deferred** (workspace queue sufficient for MVP) |

### Requires verification

- **Live:** ops decision → payment → completion smoke on preview; `order_status_events.reason` migration apply if required
- **Visual QA:** operations workspace + manual review (P2-25, M8-P1-01)
- **Cross-agent:** M9-P1-02 manager workflow hardening closure evidence on merged/main

---

## 7. Closure Rules

### P1-27 may only move toward closure after:

1. **User accepts** customer MVP boundary (this sign-off pack or updated accepted decisions).
2. **Live verification passes** for core customer path (M8-P1-02 subset).
3. **Visual QA passes** where required (M8-P1-01, P2-20/21).
4. **Branch/PR/merge evidence** exists per project policy (merged/main inventory).
5. Deferred items (D-15, D-16, D-07) are **explicitly accepted** as deferrals or scheduled as follow-up tasks.

**P1-27 remains `needs reconciliation` until all above are satisfied.**

### P1-28 may only move toward closure after:

1. **User accepts** Operations/Admin MVP boundary (Workspace vs §12 floor).
2. **Live verification passes** for core ops path on preview/staging.
3. **Visual QA passes** for operations UI (P2-25).
4. **Admin boundary** documented and accepted (no P2-09 scope creep).
5. **Branch/PR/merge evidence** exists per project policy.

**P1-28 remains `needs reconciliation` until all above are satisfied.**

This document **does not close** P1-27 or P1-28.

---

## 8. Next Recommended Path

1. **User reviews and accepts/rejects D-01–D-16** (especially D-07, D-11, D-15, D-16 deferrals).
2. If accepted, record in `accepted-backlog-decisions-v1.md` or user-written scope note (separate planning task).
3. **Prepare live verification path:** push branch (when approved) → preview deploy → runbook §§3–6 + M8-P1-02 subset.
4. **Prepare PR/review strategy** per D-14 (split or sectioned review).
5. **Schedule visual QA** per D-13 before any public release claim.
6. **Only then** revisit P1-27 / P1-28 closure on merged/main evidence.

---

## References

- `docs/planning/p1-27-p1-28-reconciliation.md`
- `docs/planning/mvp-scope.md`
- `docs/planning/current-backlog.md` (P1-27, P1-28)
- `docs/production/vercel-deploy-runbook.md` (§§7–11)
- RPES VII / VIII

---

*Prepared on `task/epic-b-projects-foundation`. Branch-local decision package. Not merged/main closure evidence.*
