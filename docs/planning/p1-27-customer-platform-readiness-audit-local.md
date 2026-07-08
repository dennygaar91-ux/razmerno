# P1-27 Customer Platform Closure Readiness Audit — Local Package

> **Date:** 2026-07-07  
> **Branch:** `task/epic-b-projects-foundation`  
> **HEAD at audit start:** `2b96bdbb`  
> **Agent:** 01 Product / Planning Agent  
> **Type:** local closure-readiness audit — **not closure**, **not release readiness**

---

## 1. Executive Summary

This audit evaluates **P1-27 — Customer Platform MVP Scope Reconciliation** against RPES VII, accepted decisions, `mvp-scope-decision-signoff.md` (D-01–D-16 user sign-off 2026-07-07), and branch-local implementation evidence on `task/epic-b-projects-foundation`.

**Finding:** Customer Platform capabilities for the **signed local MVP boundary** are **largely implemented and tested** on the branch. **Live customer path evidence exists locally** (D-12 execution PASS on `localhost:3004`). **Visual evidence is PARTIAL** (D-13 local baseline); **preview visual QA is BLOCKED** (no stable preview URL). **Product deferrals** (D-15, D-16, D-07) are documented and user-accepted.

**Verdict:**

```text
P1-27 Local Readiness: PARTIAL
P1-27 Closure Status: needs reconciliation, not closure
```

**Why P1-27 must remain `needs reconciliation`:** branch-local implementation + docs + local live/visual subsets do **not** satisfy project closure rules (no human visual approval, no M8-P1-02 PASS, preview gate blocked, deferred items documented but full RPES parity not claimed, no binding closure inventory on merged/main per backlog policy — **this task does not use merge workflow as next action**).

---

## 2. Scope and Non-Scope

### In scope

- Customer platform capability inventory (25 items)
- Audit of P1-27 evidence blocks in `current-backlog.md`
- Alignment with signed decisions D-01, D-02, D-03, D-04, D-05, D-07, D-11, D-12, D-13, D-15, D-16
- Gap register and 10 recommended local-only next tasks

### Out of scope

- Runtime / API / Supabase / Vercel changes
- Visual QA execution
- Live verification execution
- GitHub PR / push / merge / deploy
- P1-27 or P1-28 closure
- Operations-only capabilities (referenced only where they affect customer lifecycle visibility)

---

## 3. Source Hierarchy

```text
AGENTS.md
→ current-backlog.md (P1-27)
→ accepted-backlog-decisions-v1.md (§18)
→ rpes-backlog-mvp-crosswalk-local.md
→ mvp-scope-decision-signoff.md (D-01–D-16 user sign-off)
→ p1-27-p1-28-reconciliation.md
→ D-12 / D-13 planning docs
→ RPES VII
→ branch implementation + tests
```

No governance conflict detected that would **change P1-27 scope** without explicit user decision. Signed deferrals (D-15, D-16, D-07) narrow closure claims vs full RPES VII wording — documented, not silently resolved.

---

## 4. Customer Capability Inventory

| # | Capability | Implemented locally? | Tests? | Live evidence? | Visual evidence? | Product decision | Gap | P1-27 closure impact |
|---|------------|---------------------:|--------|----------------|------------------|------------------|-----|----------------------|
| 1 | Auth gate / customer auth foundation | implemented | tested | live-verified | visual-partial | product-accepted | D-13 auth contrast polish | Supports readiness; not closure |
| 2 | Profile read | implemented | tested | live-verified | visual-partial | product-accepted | — | Supports readiness |
| 3 | Profile edit | implemented | tested | not verified | visual-partial | deferred (D-16) | No email-code confirmation | Documented deferral; blocks full RPES parity |
| 4 | Customer cabinet / account workspace | implemented | tested | live-verified | visual-partial | product-accepted | Notifications loading in D-13 capture | Supports readiness |
| 5 | Projects list | implemented | tested | live-verified | visual-partial | product-accepted | — | Supports readiness |
| 6 | Project save (create) | implemented | tested | not verified | visual-missing | product-accepted | Constructor save UI not visually captured | Low closure impact |
| 7 | Project update (PATCH) | implemented | tested | not verified | visual-missing | product-accepted | — | Low closure impact |
| 8 | Project resume / load into constructor | implemented | tested | not verified | visual-missing | product-accepted | — | Low closure impact |
| 9 | Authenticated order submit | implemented | tested | live-verified | visual-missing | product-accepted | Checkout auth gate visual open | Core path; live OK locally |
| 10 | Order ownership (`user_id`) | implemented | tested | live-verified | not verified | product-accepted | — | Supports readiness |
| 11 | Public order number (`RZM_NNNN`) | implemented | tested | live-verified | visual-partial | product-accepted | — | Supports readiness |
| 12 | Customer order list | implemented | tested | live-verified | visual-partial | product-accepted | — | Supports readiness |
| 13 | Customer order detail | implemented | tested | live-verified | visual-missing | product-accepted | D-13 order detail pages unusable in capture | Blocks visual gate |
| 14 | Customer-safe status mapping | implemented | tested | live-verified | visual-partial | product-accepted | — | Supports readiness |
| 15 | Customer status timeline | implemented | tested | live-verified | visual-missing | product-accepted (D-01) | Not visually captured | Blocks visual gate |
| 16 | Notifications list | implemented | tested | live-verified | visual-partial | product-accepted (D-02) | D-13 loading stuck in capture | Preview re-check needed |
| 17 | Unread count / bell | implemented | tested | live-verified | visual-partial | product-accepted (D-02) | Bell visible; list loading issue in D-13 | Preview re-check needed |
| 18 | Mark-read / mark-all-read | implemented | tested | live-verified | visual-missing | product-accepted (D-02) | — | Supports readiness |
| 19 | Change request submit | implemented | tested | live-verified | visual-missing | product-accepted (D-03) | Form not isolated in D-13 | Preview re-check |
| 20 | Change request history / status | implemented | tested | live-verified | visual-missing | product-accepted (D-03) | Dedicated CR status UI limited | Minor gap |
| 21 | Payment instructions | implemented | tested | live-verified | visual-missing | product-accepted (D-04) | Not captured in D-13 | Preview re-check |
| 22 | Completion visibility (`Завершено`) | implemented | tested | live-verified | visual-missing | product-accepted (D-05) | Order detail capture failed | Preview re-check |
| 23 | Safe DTO / no internal leak | implemented | tested | live-verified | not verified | product-accepted | Dedicated customer DTO audit not exhaustive | Security follow-up local task |
| 24 | API-only / no frontend direct DB | implemented | tested | not verified | not verified | product-accepted | — | Architecture convention |
| 25 | Live D-12 customer path evidence | implemented | tested | live-verified | not verified | product-accepted (D-12) | M8-P1-02 not PASS; preview path not verified | Blocks final closure |

---

## 5. P1-27 Evidence Audit

| Epic / evidence group | Branch status | Tests (if cited) | Supports capability | Explicit non-scope | Supports local readiness? | Why not P1-27 closure |
|-----------------------|---------------|------------------|---------------------|--------------------|---------------------------|------------------------|
| Epic A — Customer Authentication Foundation | done (branch) | `test:customer-auth` | #1 auth, profile API base | No cabinet/orders at time | Yes | No merged/main inventory |
| Epic B — Customer Projects Foundation | done | `test:customer-projects` | #5–8 projects | No cabinet at time | Yes | Branch-only |
| Epic C — Submit Ownership Foundation | done | `test:customer-order-submit` | #9–11 submit/ownership | No cabinet UI | Yes | Live later required |
| Epic D — Customer Workspace API | done | `test:customer-workspace` | #4 workspace API | No UI | Yes | API-only evidence |
| Epic E — Customer Cabinet UI | done | `test:customer-account` | #4–5, #12 list | No order detail yet | Yes | Visual gate open |
| Epic F — Project Resume & Load | done | `test:customer-project-resume` | #8 resume | No autosave | Yes | Visual not done |
| Project Update Foundation | done | extended resume tests | #7 update | No rename/archive UI | Yes | — |
| Epic G — Customer Order Detail | done | `test:customer-order-detail` | #13 detail | No CR/timeline yet | Yes | D-13 visual gap |
| Epic H — Profile Editing | done | `test:customer-profile-edit` | #3 edit | No email-code (D-16) | Partial | Deferral documented |
| Epic I-1 — Change Request API | done | `test:customer-change-request` | #19–20 API | No UI | Yes | — |
| Epic I-2 — Change Request UI | done | `test:customer-change-request-ui` | #19–20 UI | No manager workflow | Yes | Visual partial |
| Customer Notifications API (J-1) | done | `test:customer-notifications` | #16 list | No UI initially | Yes | — |
| Epic J-2 — Notifications UI | done | `test:customer-notifications-ui` | #16 UI | No bell initially | Yes | — |
| Customer Notifications Completion | done | extended notification tests | #16–18 generation + mark-read | No email/push | Yes | D-13 loading issue |
| Customer Order Detail Status Timeline | done | order detail tests | #15 timeline | — | Yes | Not visually captured |
| Customer Notification Bell / Unread Count | done | notification tests | #17 bell | — | Yes | D-13 partial |
| Customer Payment Instructions Block | done | `test:customer-payment-instructions-ui` | #21 instructions | No provider | Yes | Visual missing |
| Payment Readiness Domain | done | `test:payment-readiness-domain` | #21 state model | Ops-focused | Yes | — |
| Customer Notification on ops events | done | contract tests | #16 triggers | Best-effort email | Yes | D-11 partial email |
| Lifecycle Completion visibility | done | completion tests | #22 completion | — | Yes | Visual missing |
| D-12 Live Verification Execution | done (local live PASS) | `verify:live-signed-mvp-path` | #25 full customer path | M8-P1-02 not PASS | **Strong local readiness** | Not closure; local runtime only |
| D-13 Local Visual QA | PARTIAL | capture script | Visual subset | Not human approval | Partial | Blocks visual gate |
| D-13 Preview Visual QA | BLOCKED | — | Preview screens | No preview URL | No | Blocks preview confirmation |
| P1-27/P1-28 Reconciliation Package | done | — | Decision register | Not closure | Yes | Awaiting human/process gates |
| mvp-scope-decision-signoff | user sign-off D-01–D-16 | — | Product boundary | Deferrals explicit | Yes | Sign-off ≠ task closure |

---

## 6. Product Decision Alignment

| Decision | Customer impact | Current implementation | Status | Gap |
| -------- | --------------- | ---------------------- | ------ | --- |
| **D-01** Full lifecycle ladder | Timeline + status labels through `Завершено` | `mapCustomerOrderStatus`, `CustomerOrderStatusTimeline`, D-12 verified transitions | **Aligned** — user accepted | Visual capture incomplete |
| **D-02** In-app notifications | Center + unread + mark-read | APIs + UI + generation on submit/CR | **Aligned** — user accepted | D-13 notifications loading issue |
| **D-03** Customer change requests | Submit in `Проверка` + history | API + UI + ops decision notifications | **Aligned** — user accepted | CR status UX limited |
| **D-04** Manual payment confirmation | Payment instructions in `Оплата` | `CustomerPaymentInstructionsSection`; ops confirms | **Aligned** — user accepted | Visual not captured |
| **D-05** Order completion | Customer sees `Завершено` | Timeline + notifications; D-12 completion path | **Aligned** — user accepted | Visual not captured |
| **D-06** Manual pricing internal-only | Customer sees submit snapshot only | No customer price mutation from draft | **Aligned** — user accepted | — |
| **D-07** No final price without Approval View | No customer Approval View | Not implemented (correct per deferral) | **Deferred** — user accepted | RPES pricing-approval parity gap |
| **D-11** In-app + email partial; push/SMS out | In-app done; email at submit partial | Best-effort notifications; order emails wired | **Partially aligned** — user accepted | Email retry (M9-P1-03) out of local scope |
| **D-12** Live verification required | Full customer path on staging/preview | D-12 local PASS on `localhost:3004` | **Partially met** — local only | M8-P1-02 not PASS; preview not verified |
| **D-13** Visual QA required | Cabinet, order card, auth gate | D-13 local PARTIAL; preview BLOCKED | **Not met** | Human approval pending |
| **D-15** Cancellation request deferred | `Отменить заявку` not built | Not implemented | **Deferred** — user accepted | RPES cancel semantics gap |
| **D-16** Email-code profile deferred | PATCH profile without email-code | `PATCH /api/profile` only | **Deferred** — user accepted | Security/UX documented gap |

---

## 7. Gap Register

| Gap ID | Gap | Type | Severity | Blocks local readiness? | Blocks final closure? | Recommended local action |
| ------ | --- | ---- | -------- | ----------------------: | --------------------: | ------------------------ |
| G-01 | D-13 preview visual QA not passed | preview | High | No | **Yes** | Wait for stable preview URL; rerun capture (local script) |
| G-02 | Human visual approval missing | visual | High | No | **Yes** | Record human review checklist against P1-21 matrix (docs) |
| G-03 | Preview deployment blocked/unavailable | preview | High | Partial | **Yes** | Infra diagnosis doc only; no Vercel changes in P1-27 audit |
| G-04 | Customer cancellation request deferred (D-15) | product-deferred | Medium | No | **Yes** (full RPES) | Harden deferral note in P1-27 evidence index |
| G-05 | Email-code profile edit deferred (D-16) | product-deferred | Medium | No | **Yes** (full RPES) | Security review memo (docs-only) |
| G-06 | Customer final price / Approval View deferred (D-07) | product-deferred | Medium | No | **Yes** (price approval) | Boundary note: draft-only until Approval View |
| G-07 | Email delivery / retry partial | out-of-MVP | Medium | No | **Yes** (exit criteria) | Cross-reference M9-P1-03; no implementation here |
| G-08 | Push/SMS out of MVP | out-of-MVP | Low | No | No | None |
| G-09 | Online payment provider out of MVP | out-of-MVP | Low | No | No | None |
| G-10 | Production JSON not exposed to customer | security | Low | No | No | Maintain DTO tests |
| G-11 | D-13 order detail / notifications visual issues | visual | Medium | **Yes** (visual readiness) | **Yes** | Local reproduction on stable `vercel dev` port |
| G-12 | DTO/security exhaustive audit not done | security | Medium | Partial | **Yes** | Customer DTO leak guard audit (read-only) |
| G-13 | M8-P1-02 not PASS | live | High | No | **Yes** | D-12 local ≠ gate closure |
| G-14 | `order_status_events` RLS disabled (live) | security | High | No | **Yes** (release) | Document in customer audit; infra follow-up |
| G-15 | Branch evidence ≠ closure inventory | documentation | High | No | **Yes** | P1-27 local evidence index cleanup |

---

## 8. Local Readiness Verdict

```text
P1-27 Local Readiness: PARTIAL
P1-27 Closure Status: needs reconciliation, not closure
```

### Rationale

**PARTIAL (not READY)** because:

- Visual readiness gaps: D-13 local PARTIAL; order detail, timeline, payment instructions, change request forms not reliably captured; human approval absent.
- Preview visual QA blocked (no preview URL at last verified state).
- Deferred product items (D-15, D-16, D-07) are accepted but prevent claiming full RPES VII parity at closure.

**PARTIAL (not BLOCKED)** because:

- Core customer APIs, UI routes, and tests exist on branch.
- D-12 local live verification PASS covers customer submit → detail → notifications → status transitions.
- User sign-off on MVP boundary (D-01–D-16) recorded in `mvp-scope-decision-signoff.md`.

**Closure remains impossible** until: human visual approval (D-13), live gate (M8-P1-02), and project closure evidence rules are satisfied — **without treating GitHub/merge as this task's next action**.

---

## 9. Recommended Next Local Tasks

Exactly **10** local-only tasks for P1-27 follow-up:

1. **Customer DTO leak guard audit** — read-only scan of `api/customer/*` + `customer-order-detail` mappers vs forbidden keys; extend test list if gaps found (docs + tests only).
2. **Customer order detail visual issue reproduction locally** — rerun `capture:d13-local-visual-qa` focused on `/account/order/:id` with throttled API waits on stable port.
3. **Notifications loading issue reproduction locally** — isolate `GET /api/customer/notifications` + unread-count under light load; document whether 502 is runtime-only.
4. **Customer auth gate contrast fix proposal** — docs-only UX note for D13-V-01 (no CSS commit unless separate visual task).
5. **Customer account responsive capture rerun** — `D13_ALL_VIEWPORTS=1` for authenticated workspace when runtime stable.
6. **Customer order state fixture capture script** — docs/script to list safe read-only order IDs per `domain_status` for visual capture (no data mutation).
7. **Customer cancellation request deferral note hardening** — add explicit P1-27 cross-reference in sign-off / audit index (docs only).
8. **Email-code profile edit deferral note hardening** — security exception paragraph for D-16 in customer readiness index (docs only).
9. **Customer final price / Approval View boundary note** — single-page decision traceability D-06 + D-07 for customer-facing price display (docs only).
10. **P1-27 local evidence index cleanup** — consolidate epic→capability→test→live→visual mapping in one index section (docs only).

**Invalid next actions for this track:** push, PR, merge, deploy, release closure, P1-27 status change to closed.

---

## 10. Closure Guardrails

This audit:

- **Does not close P1-27**
- **Does not close P1-28**
- **Does not claim release readiness**
- **Does not change runtime, API, Supabase, or Vercel**
- **Does not execute visual QA or live verification**
- **Does not use GitHub/PR/merge workflow as next step**

Acceptable uses of this document:

- Guide local planning and agent handoffs
- Inform human review of customer MVP boundary
- Prioritize local visual/live follow-ups before any future closure discussion

---

## 11. Remaining Questions

1. Is **PARTIAL** local readiness sufficient to proceed with **local-only** visual re-capture, or must preview URL exist first?
2. Should **D-15** cancellation deferral be promoted to a numbered follow-up backlog task on branch docs?
3. Does user accept **D-13 local PARTIAL** as sufficient for **local** sign-off, separate from public release?
4. Should customer **order card preview image** (mvp-scope) be tracked as P1-27 gap or P2 visual task?
5. When preview deploy unblocks, is **D-13 preview** the single customer visual gate, or split by screen family?

---

## References

- `docs/planning/current-backlog.md` (P1-27 evidence blocks)
- `docs/planning/p1-27-p1-28-reconciliation.md`
- `docs/planning/mvp-scope-decision-signoff.md`
- `docs/planning/rpes-backlog-mvp-crosswalk-local.md`
- `docs/planning/d12-live-verification-preflight.md` + D-12 execution evidence in backlog
- `docs/planning/d13-local-visual-qa-baseline.md`
- `docs/planning/d13-preview-visual-qa-pr-111.md`
- RPES VII (`docs/specification/volume-07-customer-platform/`)

---

*Prepared on `task/epic-b-projects-foundation` @ `2b96bdbb`. Local planning evidence only. Not closure.*
