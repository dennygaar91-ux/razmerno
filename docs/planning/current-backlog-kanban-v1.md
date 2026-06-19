# Current Backlog Kanban — Размерно

Source of truth: `docs/planning/current-backlog.md` on GitHub `main`.

This board is an operational view only. It does not replace the backlog and must not be used as closure evidence by itself.

## Rules

- Done requires merged PR/direct main evidence, GitHub QA success where applicable, main verification and backlog evidence.
- Open/draft PRs, branch-only tests and screenshot artifacts without visual review are not closure evidence.
- Maturity cards are planning/index cards; close the underlying backlog task or decomposed PR, not the maturity card alone.
- Risky areas require read-only audit first unless the scope is frozen and narrow: pricing, API/orders, Supabase, Constructor state/layout, Three.js, production/manufacturing, package/workflows.
- Failed broad PRs should be closed/replaced instead of patched repeatedly.

## Triage first

| Card | Status | Owner | Next decision |
|---|---|---|---|
| PR #41 Dependency recovery | open/draft/not merged | 05 Infrastructure / QA | close obsolete / replace / rebase only after evidence |
| PR #43 Pricing parity | open/draft/not merged | 03 Pricing | close obsolete or replace; newer partial evidence exists in PR #77–#79 |
| PR #51 Production Golden Snapshots | open/blocked | 07 Production + 05 QA | resolve v2/v3 scope and package script blocker |
| PR #52 API notification contracts | open | 04 API + 05 QA | replace/repair with correct duplicate-order contract |
| P0-19 Dependency Layer Recovery Verification | closed / disputed | 05 Infrastructure / QA | reconcile actual main evidence or reopen |
| P0-13 Pricing Golden Fixtures & Parity | open | 03 Pricing | finish production-panel, quote/order/stored snapshot, server-authoritative boundary |

## P0 — Critical MVP Safety

| Card | Status |
|---|---|
| P0-01 Unified Constructor Architecture | open |
| P0-02 Constructor State Model Stabilization | open |
| P0-03 Pricing Engine Validation | open |
| P0-04 Checkout Reliability | duplicate / partially covered |
| P0-05 Three.js Stability | open |
| P0-06 WebGL / 2D Fallback | open |
| P0-07 Documentation Sync | closed |
| P0-08 Testing Foundation | duplicate / partially covered |
| P0-09 QA Fast CI Gate | closed |
| P0-10 Coverage & Thresholds | closed as baseline |
| P0-11 API Order Flow Tests | closed |
| P0-12 Checkout Submit Tests | closed |
| P0-13 Pricing Golden Fixtures & Parity | open |
| P0-14 Supabase Contract Tests | closed |
| P0-15 CI/CD & Vercel Failure Investigation | closed as investigation + preventive controls |
| P0-16 Constructor Reset Contract Resolution | closed |
| P0-17 Constructor Smoke Test Stabilization | closed |
| P0-18 Constructor3D Architecture Guard Implementation | closed |
| P0-19 Dependency Layer Recovery Verification | closed / disputed |

## P1 — Quality MVP Evidence

| Card | Status |
|---|---|
| P1-09 Constructor3D Submit E2E | closed |
| P1-10 WebGL Fallback E2E | closed |
| P1-13 Material / Texture Parity | closed |
| P1-21 Release / Post-MVP Visual QA Matrix | closed |
| P1-22 Vercel Deployment Dashboard Log Verification | closed |
| API Order Notification Failure Contracts | open |
| Duplicate Submit / Payload-match Idempotency | open |
| Manager Notification Failure Policy | open |
| Production Golden Snapshots | open / blocked |
| P1-11A Resolve Production Golden Snapshot Scope | open |
| P1-11B Production v3 Golden Snapshots | open |
| P1-23 HDF Thickness Reconciliation | open |
| P1-24 Edge Banding Policy Lock | open |

## P2 — Visual QA / UX Evidence

| Card | Status |
|---|---|
| P2-20 Visual Regression Screenshot Suite | open |
| P2-21 Cross-browser / Device Visual QA Execution | open |
| P2-26 Vercel Visual QA Findings Implementation Follow-ups | open |
| P2-26A Scene Overlay Marker Density Pass | open |
| P2-26B WebGL Fallback Visual Layout Pass | open |
| P2-26C Scene Framing / Camera Fit Pass | open |
| P2-22 Accessibility / Focus Visual Pass | open |
| TASK 08-UX-01 Stepper Readability / VQA-003 Closure | open |
| P2-23 Checkout Trust-state Visual Hardening | open |
| P2-24 Footer / Legal Trust Hardening | open |
| P2-25 Admin Visual Consistency Pass | open |
| TASK 08-UX-04 Admin Visual Consistency / VQA-010 | open |
| TASK 08-UX-05 Accessibility / Focus Visual Pass | open |
| TASK 08-UX-06 Visual Regression / Cross-browser Device Coverage | open |
| TASK 08-UX-07 Design-system Inventory / Token Cleanup | open |

## P2 — API / Production / QA Readiness

| Card | Status |
|---|---|
| Live Provider / Supabase Order Flow Verification | open |
| P2-07 Drilling Coordinate Standard | open |
| P2-08 Supplier Hardware Catalog | open |
| P2-09 Admin Operation Editor | open |
| Production Export Failure Contract with API | open |
| БАЗИС-Мебельщик Boundary Lock | open |
| QA Release Maturity Matrix | closed |

## P3 — Post-MVP Visual Polish

| Card | Status |
|---|---|
| P3-10 Advanced Design Token Cleanup | open |
| P3-11 Rich Loading / Skeleton / Motion Layer | open |
| P3-12 Landing Conversion Visual Polish | open |

## Maturity index — 8/10

| Card | Status | Suggested agent |
|---|---|---|
| M8-P0-01 Pricing parity closure plan | open | 03 Pricing |
| M8-P1-01 Visual QA execution gate | open | 08 UX/UI |
| M8-P0-02 Constructor state ownership contract | open | 02 Constructor |
| M8-P0-03 Three.js runtime stability and fallback readiness | open | 06 Three.js |
| M8-P0-04 Notification failure policy | open | 04 API |
| M8-P0-05 Duplicate submit and idempotency policy | open | 04 API |
| M8-P1-02 Live provider and Supabase persistence verification | open | 05 Infrastructure / QA |
| M8-P1-03 PII and logging audit | open | 04 API |
| M8-P1-04 Vercel post-deploy verification | open | 05 Infrastructure / QA |
| M8-P1-05 MVP release candidate checklist | open | 01 Product / Planning |

## Maturity index — 9/10

| Card | Status | Suggested agent |
|---|---|---|
| M9-P1-01 Automated E2E release suite | open | 05 Infrastructure / QA |
| M9-P1-02 Admin and manager workflow hardening | open | 04 API |
| M9-P1-03 Email retry and failure queue | open | 04 API |
| M9-P1-04 Observability integration | open | 05 Infrastructure / QA |
| M9-P1-05 Security hardening pass | open | 05 Infrastructure / QA |
| M9-P1-06 Supabase backup, restore and migration runbook | open | 05 Infrastructure / QA |
| M9-P1-07 Performance baseline | open | 06 Three.js |
| M9-P1-08 Cross-browser and device QA | open | 08 UX/UI |
| M9-P1-09 Production and manufacturing validation | open | 07 Production |
| M9-P1-10 Release and rollback process | open | 05 Infrastructure / QA |

## Maturity index — 10/10

| Card | Status | Suggested agent |
|---|---|---|
| M10-P2-01 Full visual regression system | open | 05 Infrastructure / QA |
| M10-P2-02 Accessibility audit | open | 08 UX/UI |
| M10-P2-03 Advanced observability and SLO | open | 05 Infrastructure / QA |
| M10-P2-04 Incident response playbook | open | 01 Product / Planning |
| M10-P2-05 Data lifecycle and compliance | open | 04 API |
| M10-P2-06 Manufacturing depth roadmap | open | 07 Production |
| M10-P2-07 Architecture decomposition and legacy removal | open | 02 Constructor |
| M10-P2-08 Load and stress testing | open | 05 Infrastructure / QA |
| M10-P2-09 Customer support operations | open | 01 Product / Planning |
| M10-P3-01 Post-MVP product roadmap | open | 01 Product / Planning |

## Suggested execution order

1. Docs-only triage/reconciliation of stale PRs #41, #43, #51, #52.
2. P0-13 final pricing parity closure work.
3. API/order reliability: notification failure, manager failure and duplicate submit policy.
4. Constructor/Three.js stability and state ownership audit.
5. Visual QA execution and focused UI/scene fixes with fresh screenshots.
6. Live provider/Supabase verification and MVP release candidate checklist.
