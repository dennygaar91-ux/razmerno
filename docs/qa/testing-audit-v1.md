# Testing Audit v1 — Размерно

Статус: COMPLETED / audit-only.  
Дата: 2026-06-14.  
Роль: QA Lead.  
Итерация: v1 full completion after `qa-command-map-v1` and `legacy-test-ownership-v1`.

## 0. Scope and constraints

Этот документ завершает полный QA-аудит проекта в рамках роли QA Lead.

Не изменялись:

- runtime code;
- UI;
- Constructor / Constructor3D;
- Pricing;
- Three.js;
- Checkout;
- Production;
- Admin;
- API/Supabase;
- tests;
- package scripts;
- CI workflow.

Разрешённое действие: чтение кода, тестов, npm scripts, CI/CD конфигурации и создание/обновление audit-документов.

Важно: фактический локальный запуск `npm`, Playwright, Supabase и deploy smoke из этой среды не выполнялся. Проверки выполнены как repository audit через GitHub: чтение файлов, scripts, workflow, статусов commit и code search.

## 1. Executive Summary

Проект имеет широкую тестовую базу, но она фрагментирована между active Constructor3D, legacy quarantine, pricing, production, browser smoke, admin/deploy checks и historical stage guards.

Сильные стороны:

- есть active tests для `constructorStore`, constructor payload, production preview, draft, flow, Three adapter/safety;
- есть pricing tests для catalog, engine, delivery, runtime catalog и final smoke;
- есть production tests для geometry, production export, manufacturing rules, BASIS JSON и email attachments;
- есть Playwright specs для legacy/current configurator и active Constructor3D;
- есть отдельный `typecheck:api`;
- есть GitHub Actions workflow с `npm ci`, typecheck, API typecheck, build и архитектурными checks.

Критические проблемы:

1. GitHub Actions workflow не запускает основной набор unit/integration/E2E/smoke tests.
2. Нет coverage tool, coverage report и coverage thresholds.
3. Нет required test quality gate для active MVP.
4. Vercel status на последнем проверенном commit — failure, при этом GitHub workflow-runs для commit не обнаружены.
5. API/Supabase/order flow покрыты в основном source/type/static checks, а не direct handler/integration tests.
6. Checkout active submit flow не имеет dedicated mocked success/error tests.
7. Pricing lacks golden fixtures and server/client parity tests.
8. Legacy tests ещё нельзя удалять: они являются test-backed quarantine.

Итоговая оценка QA readiness: **частично готово для контролируемой разработки, не готово как production-grade quality gate**.

## 2. Sources reviewed

Изучены обязательные документы:

- `docs/planning/README.md`;
- `docs/planning/master-development-plan-v1.md`;
- `docs/planning/current-backlog.md`;
- `docs/planning/mvp-scope.md`;
- `docs/planning/architecture-decisions.md`;
- `docs/planning/agent-workflow.md`;
- `docs/planning/parallelization-rules.md`;
- `docs/planning/release-roadmap.md`;
- `docs/audit/documentation-audit-v1.md`;
- `docs/audit/architecture-audit-v1.md`;
- `docs/audit/legacy-inventory-v1.md`;
- `docs/audit/guard-audit-v1.md`;
- `docs/qa/qa-command-map-v1.md`;
- `docs/qa/legacy-test-ownership-v1.md`.

Изучены технические источники:

- `package.json`;
- `.github/workflows/qa.yml`;
- `playwright.config.ts`;
- `tests/browser/configurator.spec.ts`;
- `tests/browser/configurator3d.spec.ts`;
- `tests/*.test.ts` key tests;
- `src/static-pages/constructor/**/*.test.ts`;
- `src/pricing/**/*.test.ts`;
- `src/configurator/**/*.test.ts` legacy tests;
- `api/orders.ts`;
- `api/health.ts`;
- `api/_shared/**` relevant files;
- Supabase helper/deploy guard scripts;
- production geometry/export tests.

## 3. Test Inventory

### 3.1 Active Constructor / Constructor3D tests

| File / command | Type | Covers | Status |
|---|---|---|---|
| `src/static-pages/constructor/store/constructorStore.test.ts` / `test:constructor-store` | Unit / state integration | dimensions clamp, sections, compartments, reset, materials, validation, furniture defaults, layout widths/heights, filling, facade modes, scene modes, production snapshot | Active / keep |
| `src/static-pages/constructor/store/constructorDraft.test.ts` / `test:constructor-draft` | Unit | PII-free draft save/load/restore/clear | Active / keep |
| `src/static-pages/constructor/store/randomPreset.test.ts` / `test:random-preset` | Unit | random preset for wardrobe/dresser, selected section/zone, rods/drawers | Active / keep |
| `src/static-pages/constructor/store/validationAutoFix.test.ts` / `test:validation-autofix` | Unit / smoke | drawer height, wide facade, rod height autofix | Active / keep |
| `src/static-pages/constructor/adapters/constructorPayload.test.ts` / `test:constructor-payload` | Integration | constructor snapshot → layout/order payload, materials, HDF, PII-free draft | Active / keep |
| `src/static-pages/constructor/adapters/productionPreviewAdapter.test.ts` / `test:production-preview` | Integration | production preview, PII-safe preview order, materials/thicknesses, facade modes, pricing bundle, snapshot sync | Active / keep |
| `src/static-pages/constructor/constructorFlowSmoke.test.ts` / `test:constructor-flow` | Smoke / integration | step order, wizard state, checkout snapshot, order payload, draft PII exclusion, reset | Active / keep |
| `src/static-pages/constructor/constructorPiiOrderInvariants.test.ts` / `test:constructor-pii-order` | Unit / security invariant | PII/order invariants | Active / keep, not fully inspected in this pass |
| `src/static-pages/constructor/rules/zoneFilling.test.ts` / `test:zone-filling` | Unit | zone filling rules | Active / keep, not fully inspected in this pass |
| `src/static-pages/constructor/components/blueprintGeometry.test.ts` / `test:blueprint-geometry` | Unit | blueprint/2D geometry helpers | Active / keep, not fully inspected in this pass |
| `tests/browser/configurator3d.spec.ts` / `test:constructor3d-e2e` | E2E / browser smoke | active `/configurator-3d`, shell, route aliases, sizes/fill/materials/checkout validation, reset dialog, basic WCAG markers | Active / keep |
| `tests/browser/configurator3d.spec.ts` / `test:constructor3d-wcag-e2e` | E2E / WCAG smoke | same active Constructor3D spec under WCAG command name | Active but should become dedicated a11y spec later |

### 3.2 Three.js / scene tests

| File / command | Type | Covers | Status |
|---|---|---|---|
| `src/static-pages/constructor/three/threeSceneAdapter.test.ts` / `test:constructor-three` | Unit | Three model adapter: panels, drawers, rods, selected panels, facades, hardware, interaction targets, zone facades, scene mode behavior | Active / keep |
| `src/static-pages/constructor/three/threeSceneSafety.test.ts` / `test:constructor-three-safety` | Static unit / safety | lazy viewer, error boundary, quality guard, reduced motion/device hints | Active / keep |
| `src/configurator/three/threePerformance.test.ts` / `test:three-performance` | Unit / legacy performance | legacy Three performance | Legacy quarantine |
| `src/configurator/three/textureCache.test.ts` / `test:texture-cache` | Unit / legacy | legacy texture cache | Legacy quarantine |
| `src/configurator/three/threeLayoutMarkers.test.ts` / `test:three-layout-markers` | Unit / legacy | legacy layout markers | Legacy quarantine |
| `src/configurator/three/selectedCompartmentHighlight.test.ts` / `test:selected-compartment-highlight` | Unit / legacy | legacy selected compartment highlight | Legacy quarantine |
| `src/configurator/three/deferredGeometry.test.ts` / `test:deferred-geometry` | Unit / legacy | legacy deferred geometry | Legacy quarantine |

### 3.3 Pricing tests

| File / command | Type | Covers | Status |
|---|---|---|---|
| `src/pricing/catalog.test.ts` / `test:pricing-catalog` | Unit | catalog seed counts, price item lookup, +30% markup, service price, cheapest edge item | Active / keep |
| `src/pricing/engine.test.ts` / `test:pricing-engine` | Unit | catalog price non-zero breakdown, drawers increase total | Active / keep |
| `src/pricing/delivery.test.ts` / `test:delivery` | Unit | no delivery, MKAD 6000, outside MKAD +50 ₽/км, address validation | Active / keep |
| `src/pricing/breakdown.test.ts` / `test:pricing-breakdown` | Unit | extended price rows positive | Active / keep |
| `src/pricing/runtimeCatalog.test.ts` / `test:runtime-catalog` | Integration / fallback | runtime price store seed fallback without Supabase env | Active / keep |
| `src/pricing/finalPricingSmoke.test.ts` / `test:pricing-final` | Smoke | catalog size, realistic total, delivery total, no delivery zero | Active / keep |
| `scripts/check-price-integrity.mjs` / `check:price-integrity` | Static/data guard | price seed integrity | Active guard |
| `scripts/build-price-seed.mjs` / `build:price-seed` | Utility | builds price seed | Utility, not a test assertion by itself |

Missing: pricing golden fixtures, server/client parity, policy-specific regression test for exact-price rules.

### 3.4 Checkout / order tests

| File / command | Type | Covers | Status |
|---|---|---|---|
| `tests/checkout-payload.test.ts` / `test:checkout-payload` | Integration | legacy checkout payload total/delivery/assembly/source | Legacy/transitional, keep until active replacement |
| `tests/checkout-submit-hook.test.ts` / `test:checkout-submit-hook` | Static unit | legacy submit hook exists, delegates payload, validates customer/delivery/assembly | Legacy/transitional, active replacement missing |
| `src/static-pages/constructor/adapters/constructorPayload.test.ts` | Integration | active constructor order payload | Active partial coverage |
| `src/static-pages/constructor/constructorFlowSmoke.test.ts` | Smoke / integration | active checkout snapshot to order payload | Active partial coverage |
| `tests/browser/configurator3d.spec.ts` | E2E | checkout controls and required-field validation | Active partial coverage |

Missing: active `useConstructorSubmit` tests, mocked API success/error E2E, API handler branch tests.

### 3.5 Production / geometry tests

| File / command | Type | Covers | Status |
|---|---|---|---|
| `tests/geometry.test.ts` / `test:geometry` | Unit / production integration | wardrobe/dresser/nightstand panels, hardware, drilling, totals, Basis plan | Active / keep |
| `src/constructor/geometry/buildContext.test.ts` / `test:geometry-build-context` | Unit | geometry build context | Active / keep, not fully inspected |
| `src/constructor/geometry/layoutGeometry.test.ts` / `test:layout-geometry` | Unit | layout geometry | Active / keep, not fully inspected |
| `src/constructor/geometry/layoutDrawersGeometry.test.ts` / `test:layout-drawers-geometry` | Unit | drawer geometry | Active / keep, not fully inspected |
| `src/constructor/geometry/layoutRodGeometry.test.ts` / `test:layout-rod-geometry` | Unit | rod geometry | Active / keep, not fully inspected |
| `src/constructor/geometry/finalThreeLayoutSmoke.test.ts` / `test:three-final` | Smoke | final Three layout geometry | Active / keep, not fully inspected |
| `tests/production-export.test.ts` / `test:production-export` | Integration | production export schema, panels, edge banding, Basis plan, validation | Active / keep |
| `tests/manufacturing-rules.test.ts` / `test:manufacturing-rules` | Integration | factory profile, rules, auto repairs, validation, revisions, hidden client complexity | Active / keep |
| `tests/basis-json-documents.test.ts` / `test:basis-documents` | Integration | Basis JSON, production documents, attachments | Active / keep |
| `tests/email-attachments.test.ts` / `test:email-attachments` | Integration | production email attachments foundation | Active / keep |

Missing: golden production snapshots, invalid-layout matrix, hardware/drilling coordinate invariants, warning visibility matrix.

### 3.6 Legacy configurator tests

| File / command family | Type | Covers | Status |
|---|---|---|---|
| `src/configurator/model/*.test.ts` / `test:compartments`, `test:layout-state`, `test:compartment-ui`, `test:advanced-layout`, `test:compartment-editor`, `test:compartment-counts`, `test:add-layout-parts`, `test:layout-payload`, `test:layout-validation`, `test:layout-final` | Unit / integration / smoke | legacy model/layout/filling/validation | Legacy quarantine; do not remove |
| `src/configurator/store/*.test.ts` / `test:zustand-foundation`, `test:zustand-bridge`, `test:provider-store-sync`, read tests | Unit / bridge integration | legacy context → Zustand transitional bridge | Transitional quarantine; do not remove |
| `tests/config-actions-coverage.test.ts` | Static/unit | legacy action facade | Transitional quarantine |
| `tests/config-layout-sync.test.ts` | Unit | legacy reducer/layout sync | Transitional quarantine |
| `tests/config-actions-reset.test.ts` | Unit | legacy action reset | Transitional quarantine |
| `tests/pure-config-state-engine.test.ts` | Unit | pure config state engine | Transitional/needs later classification |

### 3.7 Browser / E2E / smoke tests

| File / command | Type | Covers | Status |
|---|---|---|---|
| `tests/browser/configurator.spec.ts` / `test:desktop-e2e`, `test:browser-smoke` | E2E / browser smoke | home, old `/configurator`, info pages, 2D blueprint modes, dimensions/filling/materials/checkout validation | Mixed active/legacy risk; keep until routes clarified |
| `tests/browser/configurator3d.spec.ts` / `test:constructor3d-e2e` | E2E / browser smoke | active Constructor3D | Active / keep |
| `scripts/browser-smoke-static.mjs` / `test:browser-smoke-static` | Static smoke | route/spec/source tokens, 2D/3D markers, checkout/source markers | Useful but string-based / brittle |
| `scripts/run-browser-smoke-system.mjs` / `test:browser-smoke:system` | Browser utility | system Chromium runner for browser smoke | Utility |
| `test:browser-smoke:mobile` | E2E | mobile viewport on `configurator.spec.ts` | Non-blocking until mobile priority returns |
| `test:browser` | E2E | all Playwright tests | Too broad for default PR gate until stabilized |

### 3.8 API/Admin/Supabase/deploy checks

| File / command | Type | Covers | Status |
|---|---|---|---|
| `typecheck:api` | Typecheck | API/serverless/shared/pricing/production modules | Active / required |
| `scripts/deploy-smoke.mjs` / `smoke:deploy` | Deploy smoke | `/api/health`, admin orders unauthorized/authenticated branch | Manual/post-deploy only |
| `scripts/predeploy-guard.mjs` / `predeploy:guard` | Static/deploy guard | env example, migrations/docs/API health presence, script presence | Active guard |
| `scripts/check-production-env.mjs` / `check:production-env` | Env guard | required production env and allowed origin | Active guard |
| `check:stage3-*`, `check:stage4-*`, `check:stage5-*` | Static/API/Supabase/admin/deploy guards | admin/API/Supabase/deploy docs/status | Useful but historical/stage-specific |

Missing: direct API handler tests, local Supabase integration tests, RLS/schema drift checks.

### 3.9 Test utilities, mocks, snapshots, skipped tests

| Category | Inventory result | Status |
|---|---|---|
| Test utilities | Inline custom test wrappers in many `.test.ts`; Playwright helper functions inside specs; `run-browser-smoke-system.mjs` utility | Present but not centralized |
| Mocks | Code search for `__mocks__`, `mock`, `mocked`, `vi.fn`, `jest.fn`, `msw` found no dedicated mock framework/files | Dedicated mocks absent |
| Snapshot tests | No `.snap` or snapshot framework found in reviewed scripts/search | Snapshot tests absent |
| Skipped/todo tests | Search for `skip`, `todo`, `test.skip`, `test.todo`, `describe.skip`, `it.skip` returned no results | No skipped/todo tests found by code search |

## 4. Coverage Matrix by system

| System / zone | Tests exist? | Coverage level | Risk if unchanged | Notes |
|---|---:|---|---:|---|
| Constructor3DPage | Partial | Medium-low | High | Browser smoke exists; no unit tests for page orchestration, no API submit mocked success/failure. |
| constructorStore | Yes | Medium-high | Medium | Good state coverage; missing property/invariant/fuzz matrix. |
| Zones | Yes | Medium | Medium | Covered through store, zone filling, Three adapter; missing deeper edge cases. |
| Sections | Yes | Medium-high | Medium | Section width/equalize and layout payload covered. |
| Filling | Yes | Medium | Medium | Filling layout and random preset covered; missing full editor/E2E matrix. |
| Materials | Partial | Medium-low | High | Payload/pricing/material visual coverage exists; material UI/texture parity not enough. |
| Validation | Yes | Medium | High | Store validation/autofix and order validation exist; missing full warning/error classification and API branch tests. |
| Pricing engine | Yes | Medium | Critical | Basic calculations covered; no golden fixtures/parity. |
| Pricing calculators | Partial | Medium-low | High | Delivery covered; assembly not separately identified as dedicated test. |
| Delivery | Yes | Medium-high | Medium | MKAD/outside/address validation covered. |
| Assembly | Partial | Low | High | Validated through checkout/order path; no dedicated assembly unit test found. |
| Catalogs | Yes | Medium-high | High | Seed counts and +30% sample covered; still needs more golden data fixtures. |
| Checkout flow | Partial | Medium-low | Critical | Required fields and payload covered; active submit success/error missing. |
| Order flow | Partial | Low | Critical | Client submit source exists; API handler branches not tested. |
| Three scene | Partial | Medium-low | High | Adapter/safety tests exist; real WebGL/fallback runtime e2e missing. |
| Three adapters | Yes | Medium-high | Medium | Good model adapter unit coverage. |
| Three fallback | Partial | Low | High | Source/static guards exist; browser forced fallback missing. |
| Production model | Yes | Medium | High | Geometry/export/manufacturing tests exist; golden snapshots missing. |
| Geometry | Yes | Medium-high | Medium | Good base coverage; needs more edge-case matrix. |
| Hardware | Partial | Medium | High | Hardware exists through geometry/model tests; coordinate-level tests missing. |
| Drilling | Partial | Medium-low | High | Drilling presence checked; detailed coordinate/operation invariants missing. |
| Admin orders | Partial | Low | High | Static/API contract checks; direct handler/browser admin tests missing. |
| Dashboards | Partial | Low | Medium | Static guards only. |
| Management | Partial | Low | Medium | No robust integration tests found. |
| Supabase integration | Partial | Low | Critical | Env fallback/static SQL checks; no local Supabase integration/RLS tests. |
| CI/CD | Partial | Low | Critical | Workflow exists but does not run tests. |

## 5. Build & CI/CD Audit

| Area | Exists | Works / observed | Status | Required improvement |
|---|---:|---|---|---|
| `npm run typecheck` | Yes | Present in package scripts and CI | Needs actual run confirmation | Keep required |
| `npm run typecheck:api` | Yes | Present in package scripts and CI | Needs actual run confirmation | Keep required |
| `npm run build` | Yes | Present in package scripts and CI | Needs actual run confirmation | Keep required |
| Unit test scripts | Yes | Many scripts exist | Not in CI required gate | Add fast test job |
| Integration test scripts | Yes | Many scripts exist | Not in CI required gate | Add fast integration job |
| E2E scripts | Yes | Playwright scripts exist | Not in CI required gate | Add browser-smoke job after stabilization |
| Smoke scripts | Yes | static/browser/deploy smoke scripts exist | Not consistently gated | Split static/browser/deploy smoke |
| Coverage | No | No coverage config found | Missing | Add coverage tool/thresholds |
| CI workflow | Yes | `.github/workflows/qa.yml` exists | Incomplete | Add test jobs |
| GitHub Actions runs | Not observed for checked commit | `workflow_runs: []` for latest checked commit | Critical gap | Ensure workflow triggers and checks visible |
| Vercel status | Yes | Latest checked status: failure | Critical gap | Investigate deployment failure separately |
| Required checks | Not confirmed | No evidence of branch protection/required checks from available data | Unknown/critical | Configure required checks after CI stable |

## 6. Risk Matrix

### P0 — Critical

- CI does not run unit/integration/E2E/smoke tests.
- No coverage reporting or thresholds.
- Vercel status failure on latest checked commit.
- No GitHub workflow runs observed for latest checked commit.
- API orders handler lacks direct integration tests.
- Supabase integration lacks local/schema/RLS tests.
- Active checkout submit success/error/cooldown/idempotency tests missing.
- Pricing lacks golden fixtures and server/client parity tests.

### P1 — High

- Constructor3D lacks forced WebGL fallback E2E.
- Three.js runtime behavior is mostly source/static + adapter tested, not real browser failure tested.
- Production model lacks golden snapshots and invalid-layout matrix.
- Materials/texture parity lacks robust coverage.
- Assembly pricing/validation lacks dedicated unit coverage.
- Admin API/UI mostly static-guarded, not integration tested.

### P2 — Medium

- Browser smoke not yet connected to CI.
- Legacy tests are still needed and make QA command surface noisy.
- Historical stage guards can confuse agents.
- Visual regression tests absent.
- Test utilities/mocks are not centralized.

### P3 — Low / post-MVP

- Cross-browser full matrix.
- Full mobile E2E matrix.
- Snapshot/visual diff expansion.
- Performance budget automation beyond existing bundle/Three checks.

## 7. Missing Tests

### P0 missing tests

1. `test:api-orders-handler` — mocked handler tests for origin, method, env, rate limit, honeypot, validation, server price, db insert, manager email fail, customer email fail-success.
2. `test:constructor-submit-hook` — active `useConstructorSubmit` validation, quote missing, success, failure, cooldown.
3. `test:constructor3d-submit-e2e` — Playwright with mocked `/api/orders` success/error.
4. `test:pricing-golden` — 5–10 fixed furniture configurations with exact totals.
5. `test:pricing-parity` — client quote vs server price on same payload.
6. `test:supabase-schema-contract` — expected tables/columns/policies.
7. `coverage` command and thresholds.

### P1 missing tests

1. `test:three-fallback-e2e` — forced WebGL unavailable/context lost.
2. `test:production-golden-snapshots` — deterministic production export snapshots.
3. `test:production-invalid-layout` — bad layouts reject/repair/warn correctly.
4. `test:assembly` — assembly enabled/disabled/base/rate boundary tests.
5. `test:materials-texture-parity` — material selection maps to expected preview/render IDs.
6. `test:admin-api-handlers` — admin orders/status direct handler tests.

### P2 missing tests

1. `test:visual-regression-smoke`.
2. `test:store-action-sequences`.
3. `test:constructor-a11y` with dedicated axe-like audit.
4. `test:legacy-replacement-equivalence` during migration.

## 8. Test Roadmap

### Wave 1 — immediate / before next behavior-changing work

Goal: make quality gate real.

1. Create CI required fast test job from `qa-command-map-v1` Tier 2.
2. Add coverage tooling and thresholds.
3. Add API orders handler tests.
4. Add active constructor submit hook tests.
5. Add pricing golden fixtures.
6. Add pricing client/server parity tests.
7. Add Supabase schema/migration contract test.
8. Investigate Vercel failure and missing workflow-runs.

### Wave 2 — after CI fast gate stabilizes

Goal: cover runtime/browser risks.

1. Add Playwright browser smoke job.
2. Add Constructor3D mocked submit e2e.
3. Add WebGL fallback/context-loss e2e.
4. Add production golden snapshots.
5. Add admin handler tests.
6. Add assembly dedicated tests.
7. Add material/texture parity tests.

### Wave 3 — after MVP / hardening

Goal: long-term confidence.

1. Visual regression screenshots.
2. Cross-browser matrix.
3. Full mobile matrix.
4. Property-based store invariant tests.
5. Performance budgets for 3D and bundle.
6. Legacy test replacement/removal migration.

## 9. Recommendations

1. Do not start major Constructor3D, pricing, checkout or production behavior changes until Wave 1 is done.
2. Treat `qa:all` as historical mega-suite, not current required gate.
3. Introduce `qa:required` in a separate implementation task only after verifying commands pass.
4. Keep legacy tests until active replacements are confirmed.
5. Add direct API/Supabase integration tests before production launch.
6. Make Vercel failure investigation a P0 release-readiness task.
7. Require both `typecheck` and `typecheck:api` in every runtime PR.
8. Do not rely on static string guards as substitutes for behavioral tests.

## 10. What was checked

Checked by repository audit:

- planning docs;
- audit docs;
- existing QA docs;
- package scripts;
- GitHub Actions workflow;
- Playwright config and specs;
- active constructor tests;
- legacy configurator tests inventory;
- pricing tests;
- checkout/order tests;
- production tests;
- API/Supabase/deploy scripts;
- code search for skipped/todo tests;
- code search for mocks/snapshots;
- commit status and workflow runs for latest checked commit.

## 11. What was not executed

Not executed in this environment:

- `npm ci`;
- `npm run typecheck`;
- `npm run typecheck:api`;
- `npm run build`;
- unit/integration test scripts;
- Playwright browser tests;
- deploy smoke;
- Supabase migration/RLS checks.

Reason: this iteration was performed as repository audit via GitHub connector, without local runtime execution environment.

## 12. Backlog tasks to add

P0:

- QA-P0-01: Add CI required fast test job.
- QA-P0-02: Add coverage tooling and thresholds.
- QA-P0-03: Add API orders handler integration tests.
- QA-P0-04: Add active constructor submit hook tests.
- QA-P0-05: Add pricing golden fixtures.
- QA-P0-06: Add pricing client/server parity tests.
- QA-P0-07: Add Supabase schema/migration contract checks.
- QA-P0-08: Investigate Vercel failure and missing GitHub workflow-runs.

P1:

- QA-P1-01: Add Constructor3D mocked submit E2E.
- QA-P1-02: Add WebGL fallback/context-loss E2E.
- QA-P1-03: Add production golden snapshots.
- QA-P1-04: Add admin handler tests.
- QA-P1-05: Add assembly dedicated tests.
- QA-P1-06: Add materials/texture parity tests.

P2/P3:

- Visual regression;
- cross-browser matrix;
- mobile E2E matrix;
- property-based state tests;
- legacy test replacement/removal migration.

## 13. Final QA conclusion

The project has meaningful tests, but the tests are not yet a system. The main QA problem is not absence of tests; it is absence of an enforceable, current, reliable quality gate. The next QA work must convert the existing inventory into CI-enforced fast checks, then fill the critical gaps around API, checkout submit, pricing parity and Supabase before any major runtime work continues.
