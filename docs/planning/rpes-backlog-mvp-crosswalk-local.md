# RPES / Backlog MVP Crosswalk — Local Package

> **Date:** 2026-07-07  
> **Branch:** `task/epic-b-projects-foundation`  
> **HEAD at package start:** `3834c25d`  
> **Agent:** 01 Product / Planning Agent  
> **Type:** local planning / reconciliation evidence — **not closure**

---

## 1. Executive Summary

Этот пакет сводит Release v1 capabilities (RPES + accepted decisions + `mvp-scope.md`) с активными задачами `P0/P1/M8/M9` в `current-backlog.md` и с **branch-local evidence** на `task/epic-b-projects-foundation`.

**Главный вывод:** продуктовый объём Release v1 **принят** на уровне planning layer (§18 accepted decisions, `mvp-scope.md`, RPES VII/VIII). Техническая и governance-готовность **не закрыта**: reconciliation tasks `P1-25`, `P1-27`, `P1-28` остаются `needs reconciliation`; большинство RV1-A/B и production tracks — `open`; customer/operations implementation на ветке — **local-only evidence**, не merged/main closure.

**Что этот документ делает:** даёт карту RV1-A…RV1-H, task crosswalk, conflict register и локальные next packages для агентов.

**Чего не делает:** не закрывает P1-25/P1-27/P1-28; не утверждает release readiness; не меняет runtime/API/pricing/Supabase/Three.js/production.

---

## 2. Scope and Non-Scope

### In scope

- Release v1 capability map (RV1-A … RV1-H)
- Task-level crosswalk для release-critical `P0/P1/M8/M9` блоков из prompt
- Conflict register между RPES, accepted decisions, planning docs, backlog, branch evidence
- Local-only evidence notes (D-12, D-13, typecheck fix, epic-b branch)
- Recommended next **local** task packages by agent

### Out of scope

- Rewrite RPES volumes
- Runtime / API / pricing / Supabase / Three.js / production implementation
- GitHub PR / push / merge / deploy
- Visual QA PASS / live verification PASS
- Closure любых backlog tasks

---

## 3. Source Hierarchy

При конфликте — порядок (из `AGENTS.md` + §18 accepted decisions):

```text
1. AGENTS.md
2. docs/planning/current-backlog.md
3. docs/planning/accepted-backlog-decisions-v1.md
4. RPES (docs/specification/**)
5. mvp-scope.md / release-roadmap.md
6. Local branch evidence docs (this package, p1-27-p1-28-reconciliation.md, D-12/D-13/D-14)
```

**Governance note:** §18 явно разводит §12 admin floor и Release v1 Order Operations Workspace. Customer platform и Operations Workspace **входят в Release v1**, но `P1-27` / `P1-28` не закрываются documentation alignment alone.

---

## 4. Release v1 Capability Map

| Phase | Capability focus | Active backlog tasks | Backlog / evidence status | Local branch evidence | MVP accepted? | Crosswalk status | Conflicts / gaps |
| ----- | ---------------- | -------------------- | ------------------------- | --------------------- | ------------- | ---------------- | ---------------- |
| **RV1-A** Constructor Core | Constructor3D, state model, submit path, WebGL fallback | P0-01, P0-02, P0-05, P0-06, M8-P0-02, M8-P0-03, P1-10, P2-26A–D | P0-* open; P1-10 closed on main; M8-P0-03 open w/ branch E2E notes; P2-26D needs reconciliation | M8-P0-03 browser E2E branch-local; constructor store bridge work on branch | **Yes** (scope) | **open** + **not verified** | State ownership (M8-P0-02); visualization ownership (P2-26D); main verification for closed P1-10 vs open P0-05/06 |
| **RV1-B** Pricing & Submit Reliability | Server-authoritative price, parity, order snapshot, idempotency | P0-03, P0-13, M8-P0-01, M8-P0-04, M8-P0-05, P0-11, P0-12 | P0-03/13 open; M8-P0-01 needs reconciliation; M8-P0-04/05 closed on main; P0-11/12 closed | Branch pricing attribution in orders API (local); idempotency on main | **Yes** (scope) | **open** + **conflict** | Pricing SoT ambiguity (RAR-002); parity closure not verified |
| **RV1-C** Customer Platform | Auth, drafts/projects, cabinet, order card | P1-27 | `needs reconciliation` | Extensive branch impl + tests (epic A/B); D-13 local PARTIAL | **Yes** (scope) | **conflict** + **not verified** | Gaps: cancellation request, email-code profile, Approval View; no merged/main inventory |
| **RV1-D** Orders Lifecycle | Domain statuses, RZM numbering, CR, locks, audit | P1-28, M9-P1-02, P2-09 | P1-28 needs reconciliation; M9-P1-02 open; P2-09 open (blocked on P1-28) | Status ladder + CR + audit on branch; `order_status_events.reason` migration not live | **Yes** (scope) | **open** + **not verified** | P2-09 deferred; live audit migration gap (D-12) |
| **RV1-E** Operations Workspace | Queue, manual review, manual pricing, decisions | P1-28, P2-09, P2-25 | P1-28 needs reconciliation; P2-25 open | Operations workspace + review + pricing draft + decisions on branch; live manual pricing draft PASS (local evidence) | **Yes** (scope) | **not verified** | Approval View gap; visual QA open; branch ≠ closure |
| **RV1-F** Production Handoff | JSON snapshot, manual B3D, preview storage | P1-11A/B, P1-23, P1-24, Golden Snapshots, Export Failure Contract, БАЗИС Boundary Lock | All open / open-blocked | `production_export` at submit on branch; no auto B3D (correct) | **Yes** (scope) | **open** + **blocked** | Golden snapshots scope unset; HDF/edge reconciliation open |
| **RV1-G** Payments & Notifications | Manual payment, in-app + email notifications | P1-28, M8-P0-04, M9-P1-02, M9-P1-03 (adj.) | Manual payment impl branch-local; M8-P0-04 closed; email retry deferred | Payment confirmation + notification inserts branch-local | **Yes** (scope) | **not verified** | Email partial; no online payment (out of MVP) |
| **RV1-H** Release Candidate | QA gate, live verification, visual gate | M8-P1-01, M8-P1-02, M8-P1-05, M9-P1-01, P1-21, P2-20, P2-21, Live Provider | Gates open; P1-21 closed as matrix doc | D-12 PASS subset local; D-13 local PARTIAL; preview blocked (Vercel deploy-phase); Fast CI typecheck:api PASS, WebGL E2E fail | **Yes** (scope) | **open** + **blocked** | No preview URL; M8-P1-02 not PASS; human visual approval pending |

---

## 5. Active Task Crosswalk

### Constructor / Visualization

| Task | Release phase | Backlog status | Accepted decision link | Current evidence | Crosswalk status | Conflict / Gap | Recommended local next action |
| ---- | ------------- | -------------- | ---------------------- | ---------------- | ---------------- | -------------- | ----------------------------- |
| P0-01 | RV1-A | open | §6 Constructor3D active path | Governance traceability only | open | Architecture guard closed (P0-18) but unified arch still open | Read-only architecture inventory; no UX changes |
| P0-02 | RV1-A | open | §6 state ownership doc required | Branch narrowed legacy dep cleanup; M8-P0-02 open | open | RAR-003; contract doc incomplete | Draft/finish state ownership contract (docs-only) |
| P0-05 | RV1-A | open | §7 WebGL usable | Open on main | open | Stability vs closed P1-10 E2E | Scoped stability audit; no layout change |
| P0-06 | RV1-A | open | §7 full SVG/2D fallback | Open; related P1-10 closed | not verified | Fallback UX vs P2-26B visual open | Keep fallback behavior; defer visual pass |
| M8-P0-02 | RV1-A | open | §6 ownership contract | Branch partial cleanup noted in backlog | open | Docs + tests closure on main missing | Local contract doc alignment with backlog |
| M8-P0-03 | RV1-A | open | §7 fallback readiness | Branch E2E 10/10 noted; status still open | not verified | No main/GitHub QA closure | Re-run scoped E2E locally; record evidence only |
| P1-10 | RV1-A | closed | §7 fallback | Closed on main | accepted | CI WebGL E2E failed on branch push (2026-07-07) — **evidence conflict** | Infra agent: triage CI WebGL on branch without scope creep |
| P2-26A | RV1-A | open | §6 no 3D labels | Open | open | Visual pass not done | Local screenshot capture only when preview available |
| P2-26B | RV1-A | open | §7 2D visual preview | Open | open | Depends M8-P1-01 | Defer until preview deploy unblocked |
| P2-26C | RV1-A | open | §6 desktop-first | Open | open | Camera framing not verified | Three.js agent: read-only framing audit |
| P2-26D | RV1-A | needs reconciliation | §6 active vs legacy | RAR-010 | conflict | Active/legacy map incomplete | Docs-only ownership map (no runtime) |

### Pricing / Submit

| Task | Release phase | Backlog status | Accepted decision link | Current evidence | Crosswalk status | Conflict / Gap | Recommended local next action |
| ---- | ------------- | -------------- | ---------------------- | ---------------- | ---------------- | -------------- | ----------------------------- |
| P0-03 | RV1-B | open | §4 Supabase/runtime catalog SoT | Open; branch server pricing | conflict | RAR-002 seed fallback ambiguity | Pricing source-lock doc review only |
| P0-13 | RV1-B | open | §4 parity / rounding | Open | open | Golden fixtures incomplete | Run scoped parity tests; no formula change |
| M8-P0-01 | RV1-B | needs reconciliation | §4 pricing authority | RAR-002 | conflict | Parity closure plan unsettled | Local parity evidence matrix (docs) |
| M8-P0-04 | RV1-B | closed with evidence | §5 notification failure policy | Main merge evidence | accepted | — | None locally unless regression found |
| M8-P0-05 | RV1-B | closed with evidence | §5 idempotency Q14 | PR #92 on main | accepted | — | None |
| P0-11 | RV1-B | closed | §5 order flow | Main evidence | accepted | — | Maintain tests |
| P0-12 | RV1-B | closed | §5 checkout submit | Main evidence | accepted | — | Maintain tests |

### Customer / Operations

| Task | Release phase | Backlog status | Accepted decision link | Current evidence | Crosswalk status | Conflict / Gap | Recommended local next action |
| ---- | ------------- | -------------- | ---------------------- | ---------------- | ---------------- | -------------- | ----------------------------- |
| P1-27 | RV1-C | needs reconciliation | §18 + RPES VII | `p1-27-p1-28-reconciliation.md`; branch epic A | conflict | Impl ahead of closure; gaps: cancel request, email-code profile | Human review of reconciliation package; no closure |
| P1-28 | RV1-D/E/G | needs reconciliation | §12 floor + §18 workspace | Same package; operations on branch | conflict | Scope broader than §12; Approval View gap | Document workspace vs floor; no closure |
| M9-P1-02 | RV1-D/E | open | §18 operations hardening | Branch ops APIs local | not verified | Live path partial | Local contract tests only |
| P2-09 | RV1-D/E | open | §18 admin editor out of MVP adj. | Blocked on P1-28 | blocked | Explicitly out of current MVP impl | Do not implement; keep blocked |
| P2-25 | RV1-E | open | §9 visual QA | Open | open | Visual consistency not done | After preview URL: local ops screenshots |

### Production

| Task | Release phase | Backlog status | Accepted decision link | Current evidence | Crosswalk status | Conflict / Gap | Recommended local next action |
| ---- | ------------- | -------------- | ---------------------- | ---------------- | ---------------- | -------------- | ----------------------------- |
| P1-11A | RV1-F | open | §8 no auto B3D; v3 path | Open | open | Snapshot scope unset | Production agent: scope decision doc |
| P1-11B | RV1-F | open | §8 golden snapshots | Open | blocked | Depends P1-11A | Wait for scope lock |
| P1-23 | RV1-F | open | §8 HDF 3mm | Open | open | Reconciliation with code | Read-only HDF audit |
| P1-24 | RV1-F | open | §8 edge banding | Open | open | Policy lock open | Read-only edge policy audit |
| Production Golden Snapshots | RV1-F | open / blocked | §8 PR #51 superseded | No active v3 golden set | blocked | Cannot claim production-ready | Define active snapshot list (docs) |
| Production Export Failure Contract | RV1-F | open | §8 customer must not see mfg errors | Open | open | API contract alignment | API agent read-only contract review |
| БАЗИС-Мебельщик Boundary Lock | RV1-F | open | §8 JSON only handoff | Open | accepted (boundary) | Manual B3D only — aligned | Document handoff checklist (docs) |

### QA / Release

| Task | Release phase | Backlog status | Accepted decision link | Current evidence | Crosswalk status | Conflict / Gap | Recommended local next action |
| ---- | ------------- | -------------- | ---------------------- | ---------------- | ---------------- | -------------- | ----------------------------- |
| M8-P1-01 | RV1-H | open | §9 visual closure rules | D-13 local PARTIAL | open | No human approval | Preview visual QA when URL exists |
| M8-P1-02 | RV1-H | open | §3 no branch-only closure | D-12 local PASS subset; not PASS | not verified | `reason` migration; RLS on events | Live migration approval gate (user) |
| M8-P1-05 | RV1-H | open | §18 release checklist | Open | open | RC checklist incomplete | Local checklist draft against crosswalk |
| M9-P1-01 | RV1-H | open | QA automation maturity | Open | open | Extended E2E suite | Run scoped local E2E; no CI workflow change |
| P1-21 | RV1-H | closed | §9 visual matrix | Matrix doc closed | accepted | Execution still in M8-P1-01 | Use matrix for D-13 rerun |
| P2-20 | RV1-H | open | §9 screenshots | Open | open | No screenshot suite closure | Local capture tooling only |
| P2-21 | RV1-H | open | §9 cross-browser | Open | deferred | Post-desktop gate | Defer cross-browser until M8-P1-01 partial PASS |

### Governance / Design

| Task | Release phase | Backlog status | Accepted decision link | Current evidence | Crosswalk status | Conflict / Gap | Recommended local next action |
| ---- | ------------- | -------------- | ---------------------- | ---------------- | ---------------- | -------------- | ----------------------------- |
| P1-25 | Governance | needs reconciliation | RAR-001 | **This document** | open | Crosswalk local only; not merged/main | Human review; keep needs reconciliation |
| P1-26 | Governance | needs reconciliation | §6 desktop-first vs DS mobile-first | RAR-005 | conflict | design-system README drift | DS agent: wording reconciliation doc |
| P0-19 | Governance | closed / disputed | Dependency layer | Disputed closure | conflict | Status disputed in backlog | Planning note: treat as not verified until reconciled |

---

## 6. Accepted / Open / Conflict / Not Verified Summary

### By crosswalk status (task rows above, n=37)

| Status | Count | Representative tasks |
| ------ | ----: | -------------------- |
| **accepted** | 8 | M8-P0-04, M8-P0-05, P0-11, P0-12, P1-10, P1-21, БАЗИС boundary (scope), closed notification/idempotency |
| **open** | 18 | P0-01, P0-02, P0-05, P0-13, M8-P0-02, P2-26A/B/C, P1-11A/B, P1-23/24, production contracts, M8-P1-01/05, M9-P1-01, P2-20, P1-25 |
| **conflict** | 7 | P0-03, M8-P0-01, P1-27, P1-28, P2-26D, P1-26, P0-19 |
| **not verified** | 5 | M8-P0-03, P0-06, M9-P1-02, M8-P1-02, RV1-E branch evidence |
| **blocked** | 3 | P2-09, Production Golden Snapshots, RV1-H preview deploy |
| **deferred** | 1 | P2-21 (explicitly post-desktop) |
| **out of MVP** | (scope) | Online payment, auto B3D, P2-09 editor, push/SMS — tracked in mvp-scope §«Не входит» |

*Note: phases can carry multiple statuses; task counts are mutually assigned primary crosswalk status.*

### Release v1 scope acceptance

| Layer | Verdict |
| ----- | ------- |
| RPES + mvp-scope Release v1 capabilities | **accepted** as product target |
| Implementation closure on merged/main | **not verified** for RV1-C/D/E/G/H |
| Branch `task/epic-b-projects-foundation` | **local evidence only** |

---

## 7. Conflict Register

| Conflict ID | Type | Source A | Source B | Problem | Risk | Recommended local resolution |
| ----------- | ---- | -------- | -------- | ------- | ---- | ---------------------------- |
| CX-001 | scope conflict | accepted §12 admin floor | mvp-scope RV1-E Workspace | §12 minimal vs full Operations Workspace | Scope creep or under-delivery | Use §18: workspace is extension; document in P1-28 package (done); await human sign-off |
| CX-002 | evidence conflict | P1-10 closed on main | Fast CI WebGL E2E fail on branch (2026-07-07) | Closed task vs failing gate on active branch | False release confidence | Infra: isolate branch CI failure; do not reopen P1-10 without evidence |
| CX-003 | status conflict | RPES VII customer platform | P1-27 needs reconciliation | RPES promises vs closure state | Over-claiming customer MVP | Keep P1-27 open; use p1-27-p1-28 package gaps list |
| CX-004 | scope conflict | mvp-scope cancellation request | Branch impl | Cancel flow not implemented | Release v1 exit criteria gap | Track as explicit follow-up task or defer with decision |
| CX-005 | scope conflict | mvp-scope Approval View | Branch manual pricing internal-only | Price growth approval UX missing | Pricing trust / legal | Product decision D-06/D-07 already drafted |
| CX-006 | evidence conflict | Branch ops/customer tests PASS | No merged/main + no preview URL | Local ≠ deployable | D-13 preview blocked | Fix preview deploy (infra); rerun visual QA |
| CX-007 | naming conflict | Legacy task id P1-25 | Priority note P0 planning | Same id, dual priority framing | Execution order confusion | Treat P1-25 as P0 planning priority; status unchanged |
| CX-008 | obsolete-doc conflict | design-system mobile-first | accepted §6 desktop-first | P1-26 open | Wrong UX decisions | P1-26 docs reconciliation (local) |
| CX-009 | evidence conflict | role-audit RAR-002 | M8-P0-01 needs reconciliation | Pricing SoT unsettled | Price drift | pricing-source-of-truth-lock doc (existing) |
| CX-010 | not verified | D-12 local PASS | `order_status_events.reason` missing live | Audit writes may fail live | Broken ops audit on live | User-approved migration before live ops |
| CX-011 | not verified | D-13 local PARTIAL | M8-P1-01 open | No human visual approval | Release gate blocked | Complete preview visual QA |
| CX-012 | status conflict | P0-19 closed/disputed | Backlog dispute note | Dependency recovery unclear | Wrong dependency assumptions | Mark not verified in crosswalk until reconciled |

---

## 8. Local-Only Evidence Notes

| Evidence doc / event | Branch | Claim | Closure? |
| -------------------- | ------ | ----- | -------- |
| `p1-27-p1-28-reconciliation.md` | epic-b | Scope inventory + decision register D-01…D-16 | **No** |
| `d12-live-verification-preflight.md` | epic-b | Local signed path QA; live blocked on migration | **No** |
| `d13-local-visual-qa-baseline.md` | epic-b | PARTIAL local screenshots | **No** |
| `d13-preview-visual-qa-pr-111.md` | epic-b | BLOCKED — no preview URL | **No** |
| `d14-pr-strategy.md` | epic-b | Draft PR #111 strategy | **No** |
| Vercel Fast CI typecheck:api | `25b1b236` | PASS on GitHub Actions | **No** (gate overall still fails WebGL E2E) |
| Vercel preview deploy | `dpl_5PESiXLJuGVNCVyXvvpsq57t1rPg` | Build OK; deploy-phase Error | **No** |
| `mvp-scope-decision-signoff.md` | local | Decision signoff artifact | **No** unless human approved |

**Rule:** branch evidence supports planning and QA prep only. It does **not** close P1-27, P1-28, or P1-25.

---

## 9. Recommended Next Local Task Packages

### 01 Product / Planning Agent

1. Human review of this crosswalk + `p1-27-p1-28-reconciliation.md` decision register (D-01…D-16).
2. Narrow or confirm open gaps: cancellation request, Approval View, email-code profile (local decision memo only).
3. Update P1-25 evidence on branch after review; keep status `needs reconciliation` until merged/main crosswalk.

### 03 Pricing Agent

1. Read-only audit: branch `server-price` / attribution vs accepted §4 SoT (no formula changes).
2. Local parity matrix for quote → order → stored snapshot (scoped tests only).
3. Document remaining M8-P0-01 / P0-13 gaps without closing tasks.

### 05 Infra / QA Agent

1. Diagnose Vercel preview deploy-phase failure (`Deploying outputs...`) on branch — logs only.
2. Triage Fast CI P1-10 WebGL E2E failure on branch without disabling checks.
3. Prepare local expanded `typecheck:api` script note for Windows glob limitation (docs-only).

### 06 Three.js / Visualization Agent

1. Read-only P2-26D active vs legacy ownership map draft (docs).
2. Confirm M8-P0-03 branch E2E still passes locally after latest API typings fix.
3. Defer P2-26A/B/C visual passes until preview URL exists.

### 07 Production / Manufacturing Agent

1. P1-11A scope decision draft: which v3 golden scenarios are in Release v1.
2. Read-only HDF (P1-23) and edge banding (P1-24) vs accepted §8.
3. Production Export Failure Contract — read-only API/customer boundary check.

### 08 UX / Design System Agent

1. P1-26 local reconciliation: desktop-first wording vs `docs/design-system/**` (docs only).
2. Rerun D-13 preview visual QA when preview URL unblocked (not in this task).
3. Map P2-25 ops screens to P1-21 matrix rows.

### 07 Customer Platform / API Agent

1. Maintain API typing parity for Vercel per-route checks (completed locally; verify on next preview).
2. Read-only contract audit: customer safe DTO vs operations leakage (tests only).
3. Document `order_status_events` RLS + `reason` migration as live blockers for D-12 full PASS.

---

## 10. Closure Guardrails

Do **not** treat as closure:

- This crosswalk document
- Branch-only tests / QA PASS
- Draft PR #111
- D-12 local subset PASS
- D-13 local PARTIAL
- typecheck:api CI PASS alone (full Fast CI may still fail)
- Documentation alignment with RPES / mvp-scope

**P1-25, P1-27, P1-28** remain `needs reconciliation` until merged/main evidence + explicit human/product sign-off per backlog rules.

**Release v1 exit criteria** (`mvp-scope.md` §Exit criteria) — **not met** on branch evidence alone.

---

## 11. Remaining Questions

1. **Approval View:** in Release v1 mandatory for launch or deferred with documented exception?
2. **Customer cancellation request:** implement on branch or explicitly defer in P1-27 closure?
3. **Email-code profile edit:** accept PATCH-only exception for Release v1?
4. **Manual pricing → customer price:** internal draft only until Approval View exists?
5. **Preview deploy failure:** infra root cause for `Deploying outputs` — separate infra task?
6. **P0-19:** reconcile disputed closure or re-open formally?
7. **Crosswalk promotion:** when to copy this package to merged/main planning path (post-split PRs per D-14)?

---

*End of local package. Not closure. Not release readiness.*
