# Project Reconciliation Report v1 — Размерно

Дата: 2026-06-16

Роль: Architecture & Backlog Reconciliation Agent

Статус: documentation/planning reconciliation only

Scope: анализ planning / QA / API / pricing / constructor / audit documentation и обновление `docs/planning/current-backlog.md`. Код, pricing, constructor, API, Three.js, UI, production runtime и tests не изменялись.

---

## 1. Executive Summary

Цель сверки — привести planning layer к фактическому состоянию репозитория после закрытия части P0-блоков.

Главный вывод: репозиторий подтверждает закрытие API / Checkout / Supabase contract layer и dependency recovery layer, но не подтверждает закрытие всех задач, перечисленных во входном контексте как completed.

Подтверждённо закрыты:

- P0-09 QA Fast CI Gate;
- P0-10 Coverage & Thresholds as baseline;
- P0-11 API Order Flow Tests;
- P0-12 Checkout Submit Tests;
- P0-14 Supabase Contract Tests;
- P0-15 CI/CD & Vercel Failure Investigation as investigation + preventive controls;
- P0-19 Dependency Layer Recovery Verification.

Не подтверждены как закрытые по текущему repository evidence:

- P0-13 Pricing Golden Fixtures & Parity;
- P0-16 Constructor Reset Contract Resolution;
- P0-17 Constructor Smoke Test Stabilization.

Причина: в доступных документах есть прямые указания, что эти задачи остаются открытыми или не подтверждены closure evidence. Поэтому они не были закрыты в backlog.

Следующий критический блок: **Constructor Reset Contract + Constructor State Stabilization before Constructor3D / WebGL Fallback**.

Обоснование: WebGL fallback, Constructor3D interactions, checkout UX и material parity зависят от стабильной constructor state model и тестового reset contract. Пока P0-16/P0-17 открыты, начинать крупный Constructor3D scope рискованно.

---

## 2. Closed Work Verification

### P0-09 QA Fast CI Gate — closed

`docs/qa/test-infrastructure-report-v1.md` фиксирует, что workflow `.github/workflows/qa.yml` усилен blocking fast CI gate: install, infrastructure check, typecheck, API typecheck, build, active tests, coverage snapshot и architecture checks.

Evidence:

- report status: `COMPLETED / infrastructure-only`;
- Fast CI gate содержит active constructor, pricing, delivery, geometry и production export smoke tests;
- документ явно закрывает P0-09.

### P0-10 Coverage & Thresholds — closed as baseline

`docs/qa/test-infrastructure-report-v1.md` фиксирует baseline coverage snapshot через V8 coverage и coverage artifact.

Ограничение: это baseline, не final production-grade coverage. Upgrade до Istanbul/LCOV остаётся P1-17.

### P0-11 API Order Flow Tests — closed

`docs/api/api-contract-completion-report-v1.md` фиксирует completed / passing workflow confirmed.

Evidence:

- QA run `27574702631`;
- conclusion `success`;
- `npm run test:checkout-submit-hook` включён в Fast active tests;
- покрыты API order flow success/failure, persistence, notification branches, validation and cooldown/rate-limit contract.

### P0-12 Checkout Submit Tests — closed

Тот же API completion report фиксирует checkout submit contract coverage:

- active Constructor3D submit source contract;
- customer validation;
- delivery and assembly validation;
- API success/failure;
- idempotency key;
- cooldown/no-reset guard.

### P0-14 Supabase Contract Tests — closed

API completion report фиксирует Supabase contract coverage:

- deterministic env-missing repository behavior;
- insert mapping;
- client IP hashing;
- schema/static migration contract;
- admin order mapping;
- status event mapping.

Ограничение: это deterministic contract tests, а не live Supabase integration/RLS validation.

### P0-15 CI/CD & Vercel Failure Investigation — closed as investigation + preventive controls

`docs/qa/test-infrastructure-report-v1.md` фиксирует preventive controls, но также указывает, что точная Vercel ошибка не подтверждена из-за отсутствия доступа к Vercel logs.

### P0-19 Dependency Layer Recovery Verification — closed

`docs/api/api-contract-completion-report-v1.md` фиксирует root cause: Node 20 + Supabase Realtime/WebSocket runtime mismatch. Fix: QA runtime moved to Node 22. Final workflow run `27574702631` passed.

---

## 3. Current Backlog State

### P0 open

- P0-01 Unified Constructor Architecture.
- P0-02 Constructor State Model Stabilization.
- P0-03 Pricing Engine Validation.
- P0-05 Three.js Stability.
- P0-06 WebGL / 2D Fallback.
- P0-13 Pricing Golden Fixtures & Parity.
- P0-16 Constructor Reset Contract Resolution.
- P0-17 Constructor Smoke Test Stabilization.
- P0-18 Constructor3D Architecture Guard Implementation.

### P0 in progress

- P0-07 Documentation Sync.

### P0 closed

- P0-09 QA Fast CI Gate.
- P0-10 Coverage & Thresholds as baseline.
- P0-11 API Order Flow Tests.
- P0-12 Checkout Submit Tests.
- P0-14 Supabase Contract Tests.
- P0-15 CI/CD & Vercel Failure Investigation as investigation + preventive controls.
- P0-19 Dependency Layer Recovery Verification.

### P0 duplicate / partially covered

- P0-04 Checkout Reliability — contract-scope closed by P0-11/P0-12; browser UX/E2E scope remains in P1-05/P1-09.
- P0-08 Testing Foundation — baseline covered by P0-09/P0-10/P0-11/P0-12/P0-14/P0-19; advanced QA work remains P1.

### P1 open

- P1-01 Constructor3D UX Completion.
- P1-02 Material System.
- P1-03 3D Furniture Details.
- P1-04 Warning / Error System.
- P1-05 Checkout UX Completion.
- P1-06 Legacy Constructor Cleanup Plan.
- P1-08 Design System Stabilization.
- P1-09 Constructor3D Submit E2E.
- P1-10 WebGL Fallback E2E.
- P1-11 Production Golden Snapshots.
- P1-12 Admin API & Integration Tests.
- P1-13 Material / Texture Parity Tests.
- P1-14 Nightly QA Workflow.
- P1-15 Release QA Workflow.
- P1-16 Package Scripts Ownership / Fast-Medium-Heavy Test Separation.
- P1-17 Istanbul / LCOV Coverage Upgrade.
- P1-18 Deployment Validation Layer.
- P1-19 Test Quarantine System.
- P1-20 Constructor Advanced / Scene State Contract Cleanup.
- P1-21 Reset Action Separation.

### P1 duplicate / partially covered

- P1-07 CI/CD Quality Gates — fast gate covered by P0-09/P0-19; remaining release/deploy scope is P1-14/P1-15/P1-18.

---

## 4. Obsolete Items

No active backlog item was fully marked obsolete during this reconciliation.

Reason: most items still represent valid work, but several changed status to duplicate / partially covered rather than obsolete.

Candidates not marked obsolete:

- P0-04 Checkout Reliability: not obsolete because checkout UX/E2E risk remains, but not as separate P0 contract task.
- P0-08 Testing Foundation: not obsolete because advanced QA foundation remains, but base layer is already covered.
- P1-07 CI/CD Quality Gates: not obsolete because release/deploy readiness remains, but it is better represented by more specific tasks.

---

## 5. Duplicate Items

### P0-04 Checkout Reliability

Duplicate / partially covered by:

- P0-11 API Order Flow Tests;
- P0-12 Checkout Submit Tests;
- P1-05 Checkout UX Completion;
- P1-09 Constructor3D Submit E2E.

Decision: do not run P0-04 as a separate task.

### P0-08 Testing Foundation

Duplicate / partially covered by:

- P0-09 QA Fast CI Gate;
- P0-10 Coverage & Thresholds;
- P0-11 API Order Flow Tests;
- P0-12 Checkout Submit Tests;
- P0-14 Supabase Contract Tests;
- P0-19 Dependency Layer Recovery Verification;
- P1-14 Nightly QA Workflow;
- P1-15 Release QA Workflow;
- P1-16 Package Scripts Ownership;
- P1-17 Istanbul / LCOV Coverage Upgrade;
- P1-19 Test Quarantine System.

Decision: do not run P0-08 as a broad task. Use specific follow-up tasks only.

### P1-07 CI/CD Quality Gates

Duplicate / partially covered by:

- P0-09 QA Fast CI Gate;
- P0-19 Dependency Layer Recovery Verification;
- P1-14 Nightly QA Workflow;
- P1-15 Release QA Workflow;
- P1-18 Deployment Validation Layer.

Decision: do not run P1-07 as a broad task.

---

## 6. Updated Priority Matrix

### P0 — must resolve before next large development phase

1. P0-16 Constructor Reset Contract Resolution.
2. P0-17 Constructor Smoke Test Stabilization.
3. P0-02 Constructor State Model Stabilization.
4. P0-18 Constructor3D Architecture Guard Implementation.
5. P0-13 Pricing Golden Fixtures & Parity.
6. P0-03 Pricing Engine Validation.
7. P0-05 Three.js Stability.
8. P0-06 WebGL / 2D Fallback.
9. P0-01 Unified Constructor Architecture.
10. P0-07 Documentation Sync.

Notes:

- P0-16/P0-17 move to the top because the latest repository evidence says they are not closed.
- P0-13 remains P0 because pricing audit shows client/server divergence risk.
- P0-05/P0-06 remain critical, but should not start as a major rewrite before constructor state/reset contract is stable.

### P1 — required for quality MVP

1. Constructor3D UX Completion.
2. Material System.
3. Warning / Error System.
4. Checkout UX Completion.
5. Constructor3D Submit E2E.
6. WebGL Fallback E2E.
7. Material / Texture Parity Tests.
8. Nightly QA Workflow.
9. Release QA Workflow.
10. Package Scripts Ownership / Fast-Medium-Heavy Test Separation.
11. Istanbul / LCOV Coverage Upgrade.
12. Deployment Validation Layer.
13. Test Quarantine System.
14. Legacy Constructor Cleanup Plan.
15. Design System Stabilization.
16. 3D Furniture Details.
17. Constructor Advanced / Scene State Contract Cleanup.
18. Reset Action Separation.

### P2 — production-ready depth

- Production model decomposition.
- Manufacturing rules engine.
- Basis export JSON.
- Admin orders.
- Admin production panel.
- Production revisions.
- Operation editor.
- Detailed production warnings.
- Visual regression testing.
- Cross-browser testing matrix.
- Property-based state testing.
- Vercel preview deployment smoke after deployment status.

### P3 — post-MVP

- AI assembly system.
- B2B mode.
- Kitchens.
- Automatic `.b3d` generation.
- Cinematic assembly animation.
- Deep Three.js optimization.
- CRM/logistics integration.
- Full PDF binary generation.
- Real email attachments.
- Full mobile E2E matrix.
- Automated performance budgets.

---

## 7. Recommended Next Development Block

Recommended next block: **Constructor Reset Contract + Constructor State Stabilization**.

Concrete scope for the next agent should be limited to:

1. Resolve `reset()` product contract explicitly.
2. Align implementation with the selected contract.
3. Align `constructorStore.test.ts` and `constructorFlowSmoke.test.ts` to the same semantic contract.
4. Run and prove:
   - `npm run typecheck`;
   - `npm run build`;
   - relevant constructor tests.
5. Update only the relevant constructor report/backlog status after evidence exists.

Why this block is more critical than Constructor3D or WebGL Fallback right now:

- Constructor3D interactions depend on state consistency.
- WebGL fallback depends on a stable shared state model.
- Checkout submit E2E depends on consistent no-reset / reset semantics.
- Architecture guard is useful, but its target boundary must reflect stable constructor ownership.

Alternative next block if the user intentionally wants to ignore constructor reset risk: **P0-13 Pricing Golden Fixtures & Parity**. This is also P0 because pricing audit confirms client/server divergence risk.

---

## 8. Parallelization Matrix

### Can run in parallel now

| Track | Can run now? | Conditions |
|---|---:|---|
| Documentation Sync | Yes | Must reflect repo evidence only. |
| Pricing Parity Analysis / Fixtures | Yes | Do not change production cost rules concurrently. |
| Architecture Guard Spec Review | Yes | Implementation should wait if it depends on unresolved constructor state ownership. |
| Materials content preparation | Yes | Prepare texture inventory/category docs only; do not change Three.js material pipeline. |
| QA planning for nightly/release workflows | Yes | Do not mutate package scripts in parallel with constructor test stabilization unless coordinated. |
| Production planning docs | Yes | Planning only; no production runtime changes. |

### Should not run in parallel

| Track A | Track B | Reason |
|---|---|---|
| Constructor reset/state stabilization | Constructor3D UX interaction changes | Both affect constructor behavior and tests. |
| Constructor reset/state stabilization | Checkout refactor | Checkout depends on reset/no-reset semantics. |
| Constructor state model | WebGL fallback implementation | Fallback must consume stable shared state. |
| Pricing parity | Production cost rules | High risk of changing expected totals while creating parity evidence. |
| Three.js stability | Deep visual scene rework | Visual changes can hide architecture/runtime failures. |
| Legacy constructor removal | Test migration | Must migrate/quarantine tests before deletion. |
| Global CSS cleanup | Active Constructor UI refactor | High risk of uncontrolled visual regression. |

---

## 9. Remaining Risks

1. **P0-13 contradiction with input context.** The user context says Pricing Parity Layer was completed, but repository documentation does not contain a completion report and still says P0-13 remains open.

2. **P0-16/P0-17 contradiction with input context.** The user context says these tasks were completed, but the repository contains a verification report saying they are not closed and no later completion evidence was found.

3. **Master plan is stale.** `master-development-plan-v1.md` still lists old P0/P1 groups and does not reflect the newer P0-09—P0-19 closure/partial-duplicate structure.

4. **Release roadmap is directionally useful but stale.** It still says Pricing Validation before Testing & CI/CD, while testing/API/dependency work has partially moved ahead.

5. **Documentation sync is not complete.** Updating backlog and creating this report reduces ambiguity, but full planning sync would require controlled updates to master plan and roadmap.

6. **Vercel remains only partially explained.** CI preventive controls exist, but exact Vercel failure logs are not available in the repository evidence.

7. **Supabase contract tests are deterministic, not live integration tests.** Live env/RLS validation remains later release-readiness work.

8. **Legacy constructor remains a risk.** It should not be deleted before state/test migration and architecture guard coverage.

9. **Pricing has known divergence risk.** Client may use material-specific and production-panel price paths that server recalculation does not mirror.

10. **Constructor3D / fallback work should not be launched as a broad development scope until reset/state contracts are stable.**

---

## Backlog Changes Made

Updated only:

- `docs/planning/current-backlog.md`.

Created:

- `docs/planning/project-reconciliation-report-v1.md`.

No code files were changed.

No temporary backlog files were created.

No new development scope was started.
