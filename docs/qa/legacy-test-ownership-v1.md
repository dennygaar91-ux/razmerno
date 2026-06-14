# Legacy Test Ownership v1 — Размерно

Статус: audit-only.  
Дата: 2026-06-14.  
Роль: QA Lead.  
Scope: классификация legacy/transitional tests без удаления, переписывания или изменения runtime.

## 0. Ограничения

Не изменялись:

- tests;
- source/runtime files;
- `package.json`;
- CI/CD;
- legacy code;
- active Constructor3D;
- pricing;
- checkout;
- production;
- admin;
- API/Supabase.

Этот документ отвечает на follow-up из `docs/audit/legacy-inventory-v1.md`: QA Agent должен классифицировать legacy tests и identify active replacements.

## 1. Executive Summary

Legacy tests в проекте нельзя считать мусором. Они выполняют роль test-backed quarantine для старого configurator/runtime слоя и transitional bridge. При этом они не должны направлять новые feature-работы.

Главный вывод:

- удалять legacy tests сейчас нельзя;
- расширять legacy tests новыми feature-сценариями нельзя без отдельного migration scope;
- каждый legacy test должен получить active replacement candidate;
- до завершения mapping legacy removal заблокирован.

## 2. Ownership categories

| Category | Meaning | Action |
|---|---|---|
| A — Active MVP test | Проверяет текущий Constructor3D / active constructor / pricing / production path | Keep and include in fast/current QA |
| B — Legacy quarantine test | Проверяет `src/configurator/**` или старый route/runtime | Keep, do not expand, migrate later |
| C — Transitional bridge test | Проверяет bridge между legacy context/reducer/Zustand and current migration | Keep until bridge removed |
| D — Historical guard/test | Проверяет stage marker или historical architecture shape | Keep until explicit cleanup, not primary gate |
| E — Candidate for active replacement | Поведение нужно, но тест должен быть перенесён на active path | Plan replacement before deletion |
| F — Unknown / needs inspection | Недостаточно данных по ownership | Do not remove |

## 3. Active tests — keep as current QA

Эти тесты относятся к active Constructor3D/current MVP path и должны быть приоритетом для текущего QA gate:

| Command | Path | Category | Ownership | Notes |
|---|---|---|---|---|
| `test:constructor-store` | `src/static-pages/constructor/store/constructorStore.test.ts` | A | Active constructor state | Central store invariants, validation, layout, filling, production snapshot. |
| `test:constructor-payload` | `src/static-pages/constructor/adapters/constructorPayload.test.ts` | A | Active order payload | Payload/layout/materials/PII boundary. |
| `test:production-preview` | `src/static-pages/constructor/adapters/productionPreviewAdapter.test.ts` | A | Active production preview | Preview export, materials, facade modes, production pricing bundle, PII-free state. |
| `test:constructor-draft` | `src/static-pages/constructor/store/constructorDraft.test.ts` | A | Active draft storage | PII-free local draft persistence. |
| `test:constructor-flow` | `src/static-pages/constructor/constructorFlowSmoke.test.ts` | A | Active flow smoke | Wizard state, checkout snapshot, draft PII exclusion. |
| `test:constructor-pii-order` | `src/static-pages/constructor/constructorPiiOrderInvariants.test.ts` | A | Active PII/order invariants | Must stay current gate if file exists. |
| `test:constructor-three` | `src/static-pages/constructor/three/threeSceneAdapter.test.ts` | A | Active Three model adapter | 3D model panels, interaction targets, facades, hardware. |
| `test:constructor-three-safety` | `src/static-pages/constructor/three/threeSceneSafety.test.ts` | A | Active Three safety | Lazy load/error boundary/quality guard source checks. |
| `test:constructor3d-e2e` | `tests/browser/configurator3d.spec.ts` | A | Active browser smoke | Main Constructor3D path, reset, checkout controls, basic WCAG markers. |
| `test:constructor3d-wcag-e2e` | `tests/browser/configurator3d.spec.ts` | A | Active browser/WCAG smoke | Same spec under explicit script. |

Required future additions:

- active submit hook test;
- mocked `/api/orders` submit success/error e2e;
- WebGL fallback e2e;
- visual/a11y smoke.

## 4. Legacy model tests — quarantine, migrate later

These commands are tied to old `src/configurator/model/**` behavior and should remain until active zone/layout tests cover the same invariants.

| Command | Path family | Category | Active replacement target | Migration status |
|---|---|---|---|---|
| `test:compartments` | `src/configurator/model/compartments.test.ts` | B / E | `constructorStore` + active zone model tests | Not ready |
| `test:layout-state` | `src/configurator/model/layoutState.test.ts` | B / E | Active store layout invariant tests | Not ready |
| `test:compartment-ui` | `src/configurator/model/compartmentUi.test.ts` | B / E | Active selected zone UI/state tests | Not ready |
| `test:advanced-layout` | `src/configurator/model/advancedLayout.test.ts` | B / E | Active advanced sizes/fill tests | Not ready |
| `test:compartment-editor` | `src/configurator/model/compartmentEditor.test.ts` | B / E | Active drawer/zone editor tests | Not ready |
| `test:compartment-counts` | `src/configurator/model/compartmentCounts.test.ts` | B / E | Active totals derived from filling layout | Partially covered by active store |
| `test:add-layout-parts` | `src/configurator/model/addLayoutParts.test.ts` | B / E | Active add section/zone/shelf tests | Partially covered by active store |
| `test:layout-payload` | `src/configurator/model/layoutPayload.test.ts` | B / E | Active constructor payload layout tests | Partially covered |
| `test:layout-validation` | `src/configurator/model/layoutValidation.test.ts` | B / E | Active validation + API layout validation | Not ready |
| `test:layout-final` | `src/configurator/model/finalLayoutSmoke.test.ts` | B / E | Active end-to-end layout smoke | Partially covered |

Rule:

Do not delete these tests until a QA Agent confirms active replacements with equivalent assertions.

## 5. Legacy/transitional Zustand bridge tests — keep until bridge removal

These tests protect the migration bridge around `src/configurator/store/**` and old context/reducer.

| Command | Path family | Category | Ownership | Recommendation |
|---|---|---|---|---|
| `test:zustand-foundation` | `src/configurator/store/configStore.test.ts` | C | Transitional bridge | Keep until legacy context removed. |
| `test:zustand-bridge` | `src/configurator/store/useConfigSelectors.test.ts` | C | Transitional selectors | Keep until consumers migrate. |
| `test:provider-store-sync` | `src/configurator/store/providerStoreSync.test.ts` | C | Context/store sync | Keep until ConfigProvider bridge removed. |
| `test:mobile-bar-zustand-read` | `src/configurator/store/mobileBarZustandRead.test.ts` | C / D | Read migration check | Historical/transitional. |
| `test:config-header-zustand-read` | `src/configurator/store/configHeaderZustandRead.test.ts` | C / D | Read migration check | Historical/transitional. |
| `test:stepper-zustand-read` | `src/configurator/store/stepperZustandRead.test.ts` | C / D | Read migration check | Historical/transitional. |
| `test:three-markers-zustand-read` | `src/configurator/store/threeMarkersZustandRead.test.ts` | C / D | Read migration check | Historical/transitional. |
| `test:highlight-zustand-read` | `src/configurator/store/highlightZustandRead.test.ts` | C / D | Read migration check | Historical/transitional. |
| `test:three-viewer-zustand-read` | `src/configurator/store/threeViewerZustandRead.test.ts` | C / D | Read migration check | Historical/transitional. |
| `test:bridge-read-tests` | multiple `src/configurator/store/*Read.test.ts` | C / D | Batch bridge read tests | Keep as grouped legacy bridge check. |
| `test:config-actions-coverage` | `tests/config-actions-coverage.test.ts` | C | Legacy action facade | Keep until action facade retired. |
| `test:config-layout-sync` | `tests/config-layout-sync.test.ts` | C | Legacy reducer/layout sync | Keep until reducer removed. |
| `test:config-actions-reset` | `tests/config-actions-reset.test.ts` | C | Legacy reset actions | Keep until bridge removed. |

Rule:

These tests must not be used as evidence that active Constructor3D state is fully covered. They prove only bridge/quarantine behavior.

## 6. Legacy checkout tests — special risk

| Command | Path | Category | Risk | Recommendation |
|---|---|---|---|---|
| `test:checkout-payload` | `tests/checkout-payload.test.ts` → `src/configurator/checkout/buildCheckoutOrderPayload` | B / C / E | Tests legacy checkout payload, not active Constructor3D submit path | Keep until active checkout payload parity test exists. |
| `test:checkout-submit-hook` | `tests/checkout-submit-hook.test.ts` → `src/configurator/checkout/useCheckoutSubmit.ts` | B / C / E | Tests legacy submit hook, not `src/static-pages/constructor/hooks/useConstructorSubmit.ts` | Add active submit hook test before relying on it. |

Active replacement targets:

- `src/static-pages/constructor/hooks/useConstructorSubmit.ts`;
- `src/static-pages/constructor/adapters/constructorPayload.ts`;
- `src/shared/lib/order.ts`;
- `api/orders.ts` handler tests.

P0 recommendation:

Create `test:constructor-submit-hook` and `test:api-orders-handler` before any checkout behavior refactor.

## 7. Legacy Three.js / visualization tests

Some historical commands reference old `src/configurator/three/**` or old viewer state. They are useful only until active Three coverage fully replaces them.

Known command family from inventory:

```bash
npm run test:three-performance
npm run test:texture-cache
npm run test:three-layout-markers
npm run test:selected-compartment-highlight
npm run test:deferred-geometry
```

Classification:

- if path is under `src/configurator/**` → B/D/E;
- if path is under `src/static-pages/constructor/three/**` → A;
- if path is under `src/constructor/geometry/**` → active production/geometry support, not UI Three runtime.

Required follow-up:

A Three.js Agent should create a coverage equivalence table:

- legacy visual behavior;
- active adapter test;
- active browser/scene test;
- gap.

## 8. Production/geometry tests — active but not Constructor3D UI

These tests are active and should remain, but ownership is Production QA rather than Constructor UI QA:

| Command | Category | Ownership |
|---|---|---|
| `test:geometry` | A | Production geometry |
| `test:production-export` | A | Production export package |
| `test:manufacturing-rules` | A | Manufacturing rules |
| `test:basis-documents` | A | Basis JSON/documents |
| `test:email-attachments` | A | Production email attachment foundation |

Rule:

Run these for production/pricing/order-export changes. Do not treat them as visual Constructor3D coverage.

## 9. Migration readiness checklist

A legacy test can be removed only when all items are true:

1. Active replacement test exists.
2. Active replacement test covers same or stronger assertions.
3. Replacement is included in QA command map.
4. No package script or stage guard still depends on the legacy test.
5. Architecture/QA docs are updated.
6. Removal is done in explicit legacy migration scope.
7. Typecheck/build/current fast tests pass after removal.

Current status: no legacy test is marked safe to remove now.

## 10. P0 active replacement backlog

1. `test:constructor-submit-hook` — active hook validation, quote missing, success, failure, cooldown.
2. `test:api-orders-handler` — direct mocked handler branches for orders API.
3. `test:constructor-layout-invariants` — active store layout/zone invariant matrix.
4. `test:constructor3d-submit-e2e` — mocked browser submit success/error.
5. `test:pricing-parity` — active Constructor quote vs server price.
6. `test:three-fallback-e2e` — forced WebGL unavailable path.

## 11. Final rule for agents

Legacy tests are not a development target. They are safety rails. New feature work must target active Constructor3D tests first. Legacy tests can only be changed when the task is explicitly a migration/cleanup task and has an approved ownership map.
