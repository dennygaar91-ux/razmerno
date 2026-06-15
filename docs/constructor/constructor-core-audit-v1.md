# Constructor Core Audit v1 — Размерно

Дата: 2026-06-15

Статус: audit-only / Constructor Core scope.

Роль: Constructor Core Agent.

## 1. Executive Summary

QA finding по reset contract подтверждён. В активных constructor tests есть прямой конфликт: `constructorStore.test.ts` ожидает, что `reset()` сохраняет текущий step и checkout/contact state, а `constructorFlowSmoke.test.ts` ожидает возврат на `sizes` и очистку checkout/contact fields.

Старый вывод `docs/audit/architecture-audit-v1.md` о `constructorStore.ts` как God Store устарел для текущего кода. Сейчас `src/static-pages/constructor/store/constructorStore.ts` является composition entrypoint и собирает domain slices.

Фактический source of truth состояния конструктора: Zustand-store `useConstructorStore` в `src/static-pages/constructor/store/constructorStore.ts`.

Фактический source of truth нормализации/derived state: связка `constructorStoreDerivation.ts`, `rules/projectRules.ts`, `constructorSelectors.ts` и canonical state.

Активная runtime-ветка конструктора: `src/static-pages/Constructor3DPage.tsx` и `src/static-pages/constructor/**`.

Legacy/quarantine-ветка: `src/static-pages/ConstructorPage.tsx` и `src/configurator/**`.

## 2. Constructor Architecture Map

### Active runtime entry

`src/App.tsx` направляет основные constructor routes на `Constructor3DPage`:

- `/configurator`
- `/constructor`
- `/constructor.html`
- `/configurator-3d`
- `/constructor-3d`
- `/constructor3d`

Legacy routes отделены явно:

- `/constructor-legacy`
- `/configurator-legacy`

### Store composition

`constructorStore.ts` собирает initial state и slices:

- furniture/dimensions
- sections
- compartments/zones
- filling
- random preset
- auto-fix
- facades
- materials
- utility/reset/draft
- scene
- production snapshot state
- checkout form state

Сам store entrypoint сейчас небольшой и не является основным источником сложности. Риск находится в contract ambiguity, breadth of selectors/hooks и тестах.

### Page orchestration

`Constructor3DPage.tsx` сейчас является orchestration page. Он:

- хранит локальный runtime state для Three failure, fallback, reset dialog и active add target;
- получает constructor values/actions через `useConstructorPageState()`;
- получает quote через `useConstructorQuote()`;
- получает submit flow через `useConstructorSubmit()`;
- собирает `threeInput` из canonical/project state;
- передаёт props в drawer, footer, stagebar, Three viewer и 2D fallback.

## 3. State Model Analysis

### Store domains

Project identity:

- `step`
- `furniture`

Dimensions:

- `width`
- `height`
- `depth`

Sections and zones:

- `sections`
- `sectionLayout`
- `selectedSectionId`
- `compartments`
- `compartmentLayout`
- `selectedCompartmentId`
- `selectedZoneId`

`selectedZoneId` is the product/UI term bridge over the existing compartment model. `selectZone()` currently sets both `selectedCompartmentId` and `selectedZoneId`.

Filling:

- `fill`
- `fillingLayout`
- `shelvesCount`
- `drawersCount`
- `rodsCount`

`fillingLayout` is the real per-zone source of truth. Global counters are derived compatibility fields and should not become the primary UX input again.

Facades:

- `facadeLayout`
- `zoneFacadeLayout`
- `handleless`

Materials:

- `material`
- `facadeMaterial`
- `backPanelMaterial`
- `projectMaterials`

Validation:

- `validation`

Validation is stored, but should be treated as derived state. Most mutating slices call `deriveFromState(next)` after changes.

Advanced/exact state:

- `exactModeEnabled`
- `advancedSizes`
- `advancedFill`

Potential ambiguity: separate setters exist, but implementation toggles all exact/advanced flags together. This may be intentional backward compatibility, but it needs a written contract and tests.

Scene state:

- store-level `sceneRenderMode`
- store-level `sceneViewMode`
- page-local `sceneRenderMode`

`sceneViewMode` is actively store-owned. Actual 3D/2D switching is currently page-local, while store also declares `sceneRenderMode`. This is a P1 source-of-truth ambiguity.

Checkout-related state:

- `deliveryEnabled`
- `assemblyEnabled`
- `deliveryAddress`
- `contact`
- `consent`

The store owns checkout form state, but order submit side effects are outside the store. This boundary is correct and should be preserved.

## 4. Reset Contract Analysis

Current implementation:

- resets model/configuration to `constructorInitialState`;
- preserves `step`;
- preserves `contact`;
- preserves `consent`;
- preserves `deliveryEnabled`;
- preserves `assemblyEnabled`;
- preserves `deliveryAddress`.

Conflict:

- `constructorStore.test.ts` matches current implementation: reset restores configuration, but keeps active step/contact.
- `constructorFlowSmoke.test.ts` expects a full wizard reset: step becomes `sizes`, contact email is cleared, delivery address is cleared.

Product-level distinction required:

1. Manual project reset from UI.
2. Submit success after order creation.

Confirmed product decision: submit success must not reset the model. This is not the same operation as manual reset.

Recommended contract:

- `resetProject()` should be the explicit manual UI reset.
- If checkout/contact must be preserved for a specific flow, create or keep a separately named helper such as `resetConfigurationPreservingCheckout()`.
- Submit success must never call either full project reset or configuration reset unless a future product decision explicitly changes this.

Current test classification:

- `constructorStore.test.ts` is correct relative to current implementation, but may encode an ambiguous contract.
- `constructorFlowSmoke.test.ts` is stale relative to current implementation, but product-plausible if manual reset should mean “start a new project”.
- Neither test should be deleted. P0-16 must decide the contract first; P0-17 must update smoke tests only after that.

## 5. Legacy Boundary Analysis

Active constructor:

- `src/static-pages/Constructor3DPage.tsx`
- `src/static-pages/constructor/**`

Legacy constructor:

- `src/static-pages/ConstructorPage.tsx`
- `src/configurator/**`

What is legacy/quarantine:

- old static constructor page;
- `src/configurator/context.tsx`;
- `src/configurator/store/**`;
- `src/configurator/model/**`;
- `src/configurator/three/**`;
- `src/configurator/checkout/**`;
- legacy tests that still protect migration/quarantine.

What cannot be deleted yet:

- `src/configurator/**`;
- `src/static-pages/ConstructorPage.tsx`;
- legacy browser/unit tests;
- transitional package scripts.

Reason: legacy is still a quarantine safety net and has explicit legacy routes. Removal requires test migration and guard enforcement first.

## 6. Risk Matrix

| Area | Priority | Finding | Risk | Owner |
|---|---:|---|---|---|
| Reset contract | P0 | Tests assert incompatible `reset()` semantics | Unstable or misleading constructor smoke tests | Constructor Core Agent |
| State model contract | P0 | Store is sliced, but reset/derived ownership is not fully documented | Future refactors may break UI/scene/payload sync | Constructor Core Agent |
| Legacy boundary | P0 | Boundary is documented but needs enforcement | Active Constructor3D may accidentally import legacy code | Architecture Guard Agent |
| Scene render mode | P1 | Store and page both have render-mode concepts | Divergence between fallback state and UI | Constructor Core Agent + Three.js Agent |
| Exact/advanced flags | P1 | Separate setters toggle global exact mode | Misleading API for future agents/tests | Constructor Core Agent |
| Constructor3DPage | P1 | Still orchestration-heavy | Decomposition can regress behavior without guardrails | Constructor Core Agent |
| useConstructorPageState | P1 | Broad selector/action aggregation | May become hidden God Hook | Constructor Core Agent |
| Zone/compartment bridge | P1 | UI says zone, code still uses compartment | Safe now, but risky for mass rename/refactor | Constructor Core Agent |
| Sections/filling | P2 | Normalization appears centralized and tested | Keep stable during decomposition | Constructor Core Agent |

## 7. Decomposition Readiness

### Constructor3DPage

Safe to start limited decomposition: yes, after or alongside reset contract documentation.

Safe first extraction candidates:

1. scene runtime state hook;
2. scene input builder helper;
3. checkout gating helper;
4. reset dialog/runtime cleanup handler;
5. page-level meta/labels cleanup.

Constraints:

- do not change pricing;
- do not change checkout/order flow;
- do not change API/Supabase/admin;
- do not change Three.js rendering internals;
- do not change design/landing/material catalog.

### constructorStore

Safe to start broad decomposition: no.

Reason: store is already split into slices. The next risk is not file size; it is contract ambiguity.

Required before deeper store work:

1. resolve reset contract;
2. add or adjust tests for the chosen reset behavior;
3. clarify exact/advanced flag semantics;
4. clarify store vs page ownership of render mode.

## 8. Recommendations

1. Resolve P0-16 before touching `constructorFlowSmoke.test.ts` expectations.
2. Update P0-17 only after reset behavior is named and decided.
3. Add an implementation task for Constructor3D architecture guard based on `docs/planning/constructor3d-guard-spec-v1.md`.
4. Treat the old “God Store” finding as stale for current code, but keep “broad selectors/hooks” as an active decomposition risk.
5. Do not delete legacy constructor until active guard and test migration are complete.
6. Do not globally rename `compartment` to `zone`; keep the bridge until a dedicated migration task exists.

## 9. Backlog Changes

Added to `docs/planning/current-backlog.md`:

- P0-18 Constructor3D Architecture Guard Implementation — responsible: Architecture Guard Agent.
- P1-20 Constructor Advanced / Scene State Contract Cleanup — responsible: Constructor Core Agent.

Updated in `docs/planning/current-backlog.md`:

- P0-16 Constructor Reset Contract Resolution.
- P0-17 Constructor Smoke Test Stabilization.

## 10. Files Reviewed

Planning and audit docs:

- `docs/planning/README.md`
- `docs/planning/master-development-plan-v1.md`
- `docs/planning/current-backlog.md`
- `docs/planning/mvp-scope.md`
- `docs/planning/architecture-decisions.md`
- `docs/planning/agent-workflow.md`
- `docs/planning/parallelization-rules.md`
- `docs/planning/release-roadmap.md`
- `docs/planning/constructor3d-guard-spec-v1.md`
- `docs/audit/architecture-audit-v1.md`
- `docs/audit/documentation-gap-analysis-v1.md`
- `docs/audit/documentation-consolidation-report-v1.md`
- `docs/qa/testing-audit-v1.md`
- `docs/qa/testing-critical-findings-v1.md`
- `docs/qa/test-infrastructure-report-v1.md`
- `docs/agent/architect-rules.md`

Constructor files:

- `src/App.tsx`
- `src/static-pages/Constructor3DPage.tsx`
- `src/static-pages/constructor/hooks/useConstructorPageState.ts`
- `src/static-pages/constructor/store/constructorStore.ts`
- `src/static-pages/constructor/store/constructorStoreTypes.ts`
- `src/static-pages/constructor/store/constructorStoreInitialState.ts`
- `src/static-pages/constructor/store/constructorStoreDerivation.ts`
- `src/static-pages/constructor/store/constructorSelectors.ts`
- `src/static-pages/constructor/store/constructorUtilitySlice.ts`
- `src/static-pages/constructor/store/constructorResetState.ts`
- `src/static-pages/constructor/store/constructorSectionSlice.ts`
- `src/static-pages/constructor/store/constructorCompartmentSlice.ts`
- `src/static-pages/constructor/store/constructorFillingSlice.ts`
- `src/static-pages/constructor/store/constructorCheckoutSlice.ts`
- `src/static-pages/constructor/store/constructorSceneSlice.ts`
- `src/static-pages/constructor/store/constructorInteractionState.ts`
- `src/static-pages/constructor/store/constructorStore.test.ts`
- `src/static-pages/constructor/constructorFlowSmoke.test.ts`

## 11. Checks

Local/runtime checks were not executed. This task was performed as audit/documentation work through GitHub connector only.

Required checks for the next implementation task:

- `npm run typecheck`
- `npm run build`
- `npm run test:constructor-store`
- `npm run test:constructor-flow`
- `npm run test:constructor-payload`
- `npm run test:constructor-three`
- `npm run test:constructor-three-safety`
