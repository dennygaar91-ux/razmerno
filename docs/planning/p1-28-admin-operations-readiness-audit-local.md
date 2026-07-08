# P1-28 Admin / Operations Closure Readiness Audit — Local Package

> **Date:** 2026-07-07  
> **Branch:** `task/epic-b-projects-foundation`  
> **HEAD at audit start:** `347c552a`  
> **Agent:** 01 Product / Planning Agent  
> **Type:** local closure-readiness audit — **not closure**, **not release readiness**

---

## 1. Executive Summary

This audit evaluates **P1-28 — Admin MVP Scope Boundary Reconciliation** against RPES VIII, accepted decisions §12/§18, `mvp-scope-decision-signoff.md` (D-04–D-16 user sign-off 2026-07-07), and branch-local Operations Workspace evidence on `task/epic-b-projects-foundation`.

**Finding:** Release v1 **Order Operations Workspace** capabilities for the **signed local MVP boundary** are **largely implemented and tested** on the branch. **D-12 local live verification PASS** covers the full operations path (workspace → review → pricing draft → approve → CR decision → payment → completion) on `localhost:3004`. **`order_status_events.reason` migration applied** and audit writes verified in D-12. **Visual evidence is PARTIAL** (D-13 local); **preview visual QA BLOCKED**. **Security follow-up:** `order_status_events` RLS **disabled** on live Supabase.

**Verdict:**

```text
P1-28 Local Readiness: PARTIAL
P1-28 Closure Status: needs reconciliation, not closure
```

**Why P1-28 must remain `needs reconciliation`:** branch-local implementation + D-12 local subset + user sign-off on boundary do **not** satisfy closure rules (no human visual approval, M8-P1-02 not PASS, preview gate blocked, RLS security follow-up open, Approval View deferred per D-07, branch evidence ≠ closure inventory — **this task does not use merge/GitHub workflow as next action**).

---

## 2. Scope and Non-Scope

### In scope

- Admin / Operations capability inventory (32 items)
- Audit of P1-28 / operations evidence blocks in `current-backlog.md`
- Alignment with signed decisions D-04, D-05, D-06, D-07, D-08, D-09, D-10, D-11, D-12, D-13, D-14, D-15
- Security / RLS / release blocker notes
- Gap register and 10 recommended local-only next tasks

### Out of scope

- Runtime / API / Supabase / Vercel changes
- Visual QA or live verification execution
- GitHub PR / push / merge / deploy
- P1-27 or P1-28 closure
- Implementing P2-09, Approval View, production handoff automation, or payment provider

### Interpretation note (RV1-D / E / G)

P1-28 reconciles **§12 admin floor** vs **Release v1 Operations Workspace** (§18). Signed boundary (D-08): **Workspace implemented set on branch** is the local MVP target; legacy `/admin` dashboard is secondary reuse, not primary ops surface.

---

## 3. Source Hierarchy

```text
AGENTS.md
→ current-backlog.md (P1-28 + operations evidence)
→ accepted-backlog-decisions-v1.md (§12, §18)
→ rpes-backlog-mvp-crosswalk-local.md
→ mvp-scope-decision-signoff.md
→ p1-27-p1-28-reconciliation.md
→ p1-27-customer-platform-readiness-audit-local.md (adjacent customer triggers)
→ D-12 / D-13 / D-14 planning docs
→ RPES VIII
→ branch implementation + tests
```

No governance conflict detected that would **change P1-28 scope** without explicit user decision.

---

## 4. Admin / Operations Capability Inventory

| # | Capability | Implemented locally? | Tests? | Live evidence? | Visual evidence? | Product decision | Gap | P1-28 closure impact |
|---|------------|---------------------:|--------|----------------|------------------|------------------|-----|----------------------|
| 1 | Operations route `/operations` | implemented | tested | live-verified | visual-partial | product-accepted (D-08) | — | Supports readiness |
| 2 | Operations auth gate / admin authorization | implemented | tested | live-verified | visual-partial | product-accepted | D-12 negative checks | Supports readiness |
| 3 | Operations workspace queue | implemented | tested | live-verified | visual-partial | product-accepted (D-08) | D-13 API error empty state | Preview re-check |
| 4 | Workspace filters / status counts | implemented | tested | not verified | visual-missing | product-accepted | Filters not visually captured | Low |
| 5 | Order review page | implemented | tested | live-verified | visual-partial | product-accepted | D-13 loading shell only | Blocks visual gate |
| 6 | Manual review read model | implemented | tested | live-verified | visual-missing | product-accepted | Safe DTO; no full visual | Preview re-check |
| 7 | Approval summary | implemented | tested | not verified | visual-missing | product-accepted | — | Low |
| 8 | Approve decision | implemented | tested | live-verified | visual-missing | product-accepted (D-04 adj.) | — | Supports readiness |
| 9 | Reject decision | implemented | tested | live-verified | visual-missing | product-accepted | Reason required | Supports readiness |
| 10 | Decision eligibility guardrails | implemented | tested | tested | visual-missing | product-accepted | Contract tests | Supports readiness |
| 11 | Audit reason persistence | implemented | tested | live-verified | not verified | product-accepted | `reason` column live applied | Supports readiness |
| 12 | Decision history | implemented | tested | live-verified | visual-missing | product-accepted | Internal only | Supports readiness |
| 13 | Manual pricing draft read | implemented | tested | live-verified | visual-missing | product-accepted (D-06) | — | Supports readiness |
| 14 | Manual pricing draft write | implemented | tested | live-verified | visual-missing | product-accepted (D-06) | Live draft PASS | Supports readiness |
| 15 | Manual pricing internal-only boundary | implemented | tested | live-verified | not verified | product-accepted (D-06) | No customer price mutation | Supports readiness |
| 16 | Customer-facing final price not changed | implemented | tested | live-verified | not verified | product-accepted (D-07 defer) | Approval View absent | Documented deferral |
| 17 | Change request readback in operations | implemented | tested | live-verified | visual-missing | product-accepted | — | Supports readiness |
| 18 | Change request decision | implemented | tested | live-verified | visual-missing | product-accepted | — | Supports readiness |
| 19 | Manual payment confirmation | implemented | tested | live-verified | visual-missing | product-accepted (D-04) | No provider | Supports readiness |
| 20 | Order completion | implemented | tested | live-verified | visual-missing | product-accepted (D-05) | — | Supports readiness |
| 21 | Customer notifications from operations | implemented | tested | live-verified | not verified | product-accepted (D-11 partial) | Email partial | Cross-agent |
| 22 | Service Role server-side boundary | implemented | tested | live-verified | not verified | product-accepted | RLS deny-all on most tables | Supports readiness |
| 23 | No frontend direct DB access | implemented | tested | not verified | not verified | product-accepted | Convention | Architecture |
| 24 | No `production_export` mutation in status flows | implemented | tested | live-verified | not verified | product-accepted (D-09) | — | Supports readiness |
| 25 | D-12 live operations path evidence | implemented | tested | live-verified | not verified | product-accepted (D-12) | M8-P1-02 not PASS | Blocks final closure |
| 26 | Security: admin auth / wrong admin / unauth | implemented | tested | live-verified | not verified | product-accepted | D-12 401 checks | Supports readiness |
| 27 | `order_status_events.reason` live migration | implemented | tested | live-verified | not verified | product-accepted | Applied 2026-07-07 | Unblocks audit writes |
| 28 | `order_status_events` RLS disabled follow-up | gap | not verified | security-follow-up | not verified | security-follow-up | **RLS disabled on live** | **Blocks release** |
| 29 | Operations visual evidence | partial | — | visual-partial | visual-partial | product-accepted (D-13) | D-13 PARTIAL | Blocks visual gate |
| 30 | Approval View gap | gap | tested | not verified | visual-missing | deferred (D-07) | Distinct surface not built | Blocks full RPES parity |
| 31 | Admin editor / P2-09 out-of-MVP | out-of-MVP | — | — | — | out-of-MVP (D-10) | Not implemented | Correct |
| 32 | Production handoff automation out-of-MVP | out-of-MVP | tested | live-verified | — | out-of-MVP (D-09) | Correctly absent | None |

---

## 5. P1-28 Evidence Audit

| Evidence group | Branch status | Tests | Supports | Explicit non-scope | Local readiness? | Why not P1-28 closure |
|----------------|---------------|-------|----------|--------------------|------------------|------------------------|
| Operations Workspace — Orders Queue | done | `test:operations-workspace*`, `782cb441` | #1–4 queue | No status mutation at first | Yes | Branch-only |
| Operations Approval View — Manual Review | done | `test:operations-order-review`, manual-review-ui | #5–7 review | No approve/write initially | Yes | Visual open |
| Manual Pricing Draft (read-only UI) | done | manual-pricing-draft-ui | #13 read UI | No write | Partial | Superseded by write |
| Manual Pricing Write | done | manual-pricing-write, live verify PASS | #14–16 write | No customer price / status change | **Yes** | Live local only |
| Manual Pricing Migration Prep | done | migration-prep tests | #14 DB alignment | No live apply in task | Yes | — |
| Live Supabase — Manual Pricing Draft | done (later) | verify script | #14 live | — | Yes | Not M8-P1-02 PASS |
| Review Decision Actions | done | order-decision tests | #8–9 approve/reject | — | Yes | — |
| Decision Audit Reason | done | migration-prep + decision tests | #11 reason | — | Yes | RLS still open |
| Decision History | done | order-review tests | #12 history | Customer-safe only | Yes | — |
| Workspace Filters / Counts / Badges | done | workspace-ui tests | #4 filters | — | Yes | Visual missing |
| Decision Eligibility Guardrails | done | order-decision tests | #10 guards | — | Yes | — |
| Decision Flow Contract | done | `test:operations-decision-flow-contract` | #8–10 E2E contract | — | **Strong** | Local tests only |
| Operations Local Runbook | done | docs | Ops workflow | P1-28 non-closure | Yes | — |
| Change Request Readback + Decision | done | CR decision tests | #17–18 | — | Yes | — |
| Manual Payment Readiness + Confirmation | done | payment-readiness, payment-confirmation, manual-payment-flow-contract | #19 | No provider | Yes | Visual missing |
| Lifecycle / Order Completion | done | order-completion tests | #20 | — | Yes | Visual missing |
| Customer notifications from ops | done | contract tests | #21 triggers | Best-effort email | Yes | D-11 partial |
| D-12 Live Verification Execution | done (local PASS) | `verify:live-signed-mvp-path` | #25 full path | M8-P1-02 not PASS | **Strong local** | Not closure gate |
| Live Migration — `reason` column | done | MCP apply | #27 | RLS not enabled | Yes | Security gap remains |
| D-13 Local Visual QA | PARTIAL | capture script | #29 visual | Not human approval | Partial | Blocks visual |
| D-13 Preview Visual QA | BLOCKED | — | Preview ops screens | No preview URL | No | Blocks preview QA |
| D-14 PR Strategy | done (planning) | — | Review process only | **Not workflow instruction** | N/A | Process ≠ closure |
| P1-27/P1-28 Reconciliation + Sign-off | done | — | D-08 boundary | Not closure | Yes | User sign-off ≠ task close |

---

## 6. Product Decision Alignment

| Decision | Admin/Operations impact | Current implementation | Status | Gap |
| -------- | ------------------------- | ---------------------- | ------ | --- |
| **D-04** Manual payment confirmation | Ops `Оплата` → `В работе`; customer instructions | API + UI + D-12 verified | **Aligned** — user accepted | Visual not captured |
| **D-05** Order completion | Ops `В работе` → `Завершено` | API + UI + D-12 | **Aligned** — user accepted | Visual not captured |
| **D-06** Manual pricing internal-only | Draft R/W; no customer `total_price` change | Store + validation + live draft | **Aligned** — user accepted | — |
| **D-07** No final price without Approval View | No Approval View surface | Not implemented (correct) | **Deferred** — user accepted | RPES price-approval UX gap |
| **D-08** Release v1 Operations Workspace | `/operations` primary; full workspace set | Implemented on branch | **Aligned** — user accepted | §12 floor vs workspace documented |
| **D-09** Production handoff out of MVP | No auto B3D / handoff in status flows | `production_export` untouched | **Out of MVP** — user accepted | — |
| **D-10** Admin editor out of MVP | P2-09 not built | Not implemented | **Out of MVP** — user accepted | — |
| **D-11** In-app + email partial | Ops triggers in-app notifications | Best-effort inserts | **Partially aligned** | Email retry M9-P1-03 |
| **D-12** Live verification required | Full ops path on staging/preview | D-12 local PASS | **Partially met** — local only | M8-P1-02 not PASS |
| **D-13** Visual QA required | Operations workspace + manual review (P2-25) | D-13 local PARTIAL | **Not met** | Human approval pending |
| **D-14** Logical review sections | Process for reviewability | D-14 doc exists | **Process only** — not closure | — |
| **D-15** Cancellation deferred | No ops cancel-request workflow | Not implemented | **Deferred** — customer-side | Indirect ops impact |

---

## 7. Gap Register

| Gap ID | Gap | Type | Severity | Blocks local readiness? | Blocks final closure? | Recommended local action |
| ------ | --- | ---- | -------- | ----------------------: | --------------------: | ------------------------ |
| G-01 | D-13 preview visual QA not passed | preview | High | No | **Yes** | Rerun ops captures when preview URL exists |
| G-02 | Human visual approval missing | visual | High | No | **Yes** | P2-25 checklist vs P1-21 matrix (docs) |
| G-03 | Preview deployment blocked/unavailable | preview | High | Partial | **Yes** | Document blocker; no Vercel work in this task |
| G-04 | `order_status_events` RLS disabled | security | **Critical** | No | **Yes** (release) | RLS local migration plan doc (no apply without approval) |
| G-05 | Approval View / customer final price deferred (D-07) | product-deferred | Medium | No | **Yes** (full RPES) | Approval View deferral note hardening |
| G-06 | P2-09 Admin editor out of MVP | out-of-MVP | Low | No | No | Boundary note in evidence index |
| G-07 | Production handoff automation out of MVP | out-of-MVP | Low | No | No | Handoff out-of-MVP boundary note |
| G-08 | Real payment provider out of MVP | out-of-MVP | Low | No | No | Runbook reference only |
| G-09 | CRM / dashboard metrics deferred | operations-scope | Low | No | No | Document workspace queue as sufficient |
| G-10 | Email retry queue partial (M9-P1-03) | out-of-MVP | Medium | No | **Yes** (exit criteria) | Cross-reference only |
| G-11 | Operations mixed RU/EN copy (D-13) | visual | Low | No | Partial | RU/EN copy inventory (docs) |
| G-12 | Operations workspace API/loading (D-13) | visual | Medium | **Yes** (visual) | **Yes** | Local reproduction on stable port |
| G-13 | Operations review loading-only capture | visual | Medium | **Yes** (visual) | **Yes** | Manual review fixture capture script |
| G-14 | Branch evidence ≠ closure | documentation | High | No | **Yes** | P1-28 local evidence index cleanup |
| G-15 | M8-P1-02 not final closure | live | High | No | **Yes** | D-12 local ≠ gate PASS |

---

## 8. Local Readiness Verdict

```text
P1-28 Local Readiness: PARTIAL
P1-28 Closure Status: needs reconciliation, not closure
```

### Rationale

**PARTIAL (not READY)** because:

- Visual readiness: D-13 local PARTIAL; workspace error state and review loading shells; no human approval; preview blocked.
- Security: `order_status_events` RLS disabled on live — release blocker documented, not fixed in this audit.
- Product: D-07 Approval View deferred; D-15 cancellation deferred (indirect ops boundary).
- Closure gates: M8-P1-02 not PASS; branch evidence only.

**PARTIAL (not BLOCKED)** because:

- Core operations APIs, UI routes, contract tests, and D-12 local live path PASS exist.
- User sign-off on Operations/Admin MVP boundary (D-08 and related) recorded.
- `reason` migration applied; audit writes verified in D-12.

---

## 9. Recommended Next Local Tasks

Exactly **10** local-only tasks for P1-28 follow-up:

1. **Operations DTO leak guard audit** — read-only scan of `api/operations/*` and `operations-order-review` safe DTO vs forbidden keys; extend tests if gaps (docs/tests only).
2. **Operations admin auth guard audit** — document session vs API-key paths, 401/403 matrix from existing tests (docs only).
3. **`order_status_events` RLS local migration plan** — draft deny-all RLS policy + approval gate doc; **no live apply** without user approval.
4. **Operations mixed RU/EN copy inventory** — list EN strings from D-13 findings; product decision memo (docs only).
5. **Operations workspace loading/API visual reproduction locally** — throttled capture on stable `vercel dev` port; document 502 vs product defect.
6. **Manual review visual fixture/capture script** — safe `RZ-*` order IDs per lifecycle stage for read-only screenshots (docs/script).
7. **Approval View deferral note hardening** — trace D-06 + D-07 in P1-28 evidence index (docs only).
8. **Production handoff out-of-MVP boundary note** — confirm no status-flow mutation of `production_export` (read-only code audit + doc).
9. **Manual pricing internal-only boundary audit** — re-verify write path does not touch customer `total_price` / breakdown (read-only + existing tests).
10. **P1-28 local evidence index cleanup** — epic→capability→test→live→visual mapping consolidated (docs only).

**Invalid next actions:** push, PR, merge, deploy, release closure, P1-28 status → closed.

---

## 10. Closure Guardrails

This audit:

- **Does not close P1-28**
- **Does not close P1-27**
- **Does not claim release readiness**
- **Does not change runtime, API, Supabase, or Vercel**
- **Does not execute visual QA or live verification**
- **Does not use GitHub/PR/merge workflow as next step**

Acceptable uses: local planning, human boundary review, prioritizing visual/security follow-ups before any future closure discussion.

---

## 11. Remaining Questions

1. Is **RLS on `order_status_events`** a hard gate before any preview ops QA, or parallel security track?
2. Does user accept **D-13 local PARTIAL** for operations screens as sufficient for **local** sign-off separate from preview?
3. Should **legacy `/admin`** routes be explicitly marked deprecated in planning docs for P1-28 closure narrative?
4. Is **M9-P1-02** (manager workflow hardening) required before P1-28 moves toward closure, or parallel?
5. When preview deploy unblocks, is **single D-13 preview pass** enough for operations + customer, or split by agent?

---

## References

- `docs/planning/current-backlog.md` (P1-28 + operations evidence)
- `docs/planning/p1-27-p1-28-reconciliation.md`
- `docs/planning/mvp-scope-decision-signoff.md`
- `docs/planning/p1-27-customer-platform-readiness-audit-local.md`
- `docs/planning/rpes-backlog-mvp-crosswalk-local.md`
- `docs/planning/d12-live-verification-preflight.md` + D-12 execution evidence
- `docs/planning/d13-local-visual-qa-baseline.md`
- `docs/planning/d13-preview-visual-qa-pr-111.md`
- `docs/planning/d14-pr-strategy.md` (planning context only)
- RPES VIII (`docs/specification/volume-08-admin-platform/`)

---

*Prepared on `task/epic-b-projects-foundation` @ `347c552a`. Local planning evidence only. Not closure.*
