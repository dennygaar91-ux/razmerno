# Decomposition Plan

Дата: 2026-06-10

## Правило этапа

На этом инфраструктурном проходе кодовая декомпозиция не выполнялась, потому что даже “безопасный” перенос компонентов может изменить поведение активного конструктора. Подготовлен план декомпозиции.

## Файлы >1000 строк

### `src/static-pages/Constructor3DPage.tsx` — 2772 строк

Вынести:

- `ConstructorWorkspaceShell`;
- `ConstructorStageStepper`;
- `ConstructorSceneWorkspace`;
- `SceneModeToolbar`;
- `SceneRuntimeFallbackPanel`;
- `SizesStepPanel`;
- `FillingStepPanel`;
- `MaterialsStepPanel`;
- `CheckoutStepPanel`;
- `ValidationSummary`;
- `PriceActionFooter`;
- hooks: `useSceneRuntimeState`, `useStepNavigation`, `useZoneActions`, `useResetDialogState`.

Риск: высокий. Выполнять только малыми PR/этапами с visual smoke.

### `src/static-pages/constructor/store/constructorStore.ts` — 1673 строк

Вынести slices:

- `createDimensionsSlice`;
- `createLayoutSlice`;
- `createSelectionSlice`;
- `createFillingSlice`;
- `createMaterialsSlice`;
- `createCheckoutSlice`;
- `createUiSlice`;
- `createValidationSlice`.

Риск: высокий. Требуется сохранить старые selectors/actions.

### `src/static-pages/constructor/rules/projectRules.ts` — 1429 строк

Вынести:

- `limits.ts`;
- `sectionRules.ts`;
- `zoneRules.ts`;
- `fillingRules.ts`;
- `facadeRules.ts`;
- `validationMessages.ts`;
- `autoFixRules.ts`;
- `productionNotes.ts`.

Риск: средний. Нужны focused tests.

### `src/styles/constructor.css` — 10805 строк

Действие: не декомпозировать до legacy removal. Сначала определить, какие классы используются active routes.

### `src/styles/constructor3d.css` — 3983 строк

Вынести:

- `constructor-shell.css`;
- `constructor-stepper.css`;
- `constructor-drawer.css`;
- `constructor-scene.css`;
- `constructor-forms.css`;
- `constructor-checkout.css`;
- `constructor-status.css`.

Риск: средний/высокий из-за cascade.

## Файлы >500 строк

### `src/static-pages/constructor/three/threeSceneAdapter.ts` — 820 строк

Вынести adapters:

- dimensions adapter;
- section/zone adapter;
- material adapter;
- hardware adapter;
- scene mode adapter;
- selection adapter.

### `src/constructor/productionModel.ts` — 634 строк

Вынести:

- panels model;
- hardware model;
- drilling model;
- warning model;
- export model.

### `src/static-pages/constructor/components/ConstructorRealisticSvgModel.tsx` — 517 строк

Вынести:

- `BlueprintViewer`;
- `BlueprintSectionGrid`;
- `BlueprintDimensionLines`;
- `BlueprintZoneLabels`;
- `blueprintGeometry.ts`.

## Файлы >300 строк

См. полный список и рекомендации в `docs/infrastructure-audit.md`.

## Что можно декомпозировать первым

1. `Constructor3DPage.tsx` → вынести read-only presentational subcomponents без изменения props/state.
2. `projectRules.ts` → вынести constants/messages.
3. `constructor3d.css` → добавить новые разделы с comments/headers, потом split.
4. `threeSceneAdapter.ts` → pure helpers с тестами.

## Что нельзя делать первым

- Полный split zustand store без strategy.
- Удаление legacy before test migration.
- CSS purge до visual QA.
- Rename `compartment` на `zone` по всему проекту.

---

## Infrastructure Decomposition Pass 01 — выполнено

Выполнено безопасное частичное дробление `src/static-pages/Constructor3DPage.tsx` без изменения поведения.

Вынесены:

- `src/static-pages/constructor/components/Constructor3DPageMeta.tsx`;
- `src/static-pages/constructor/components/ResetProjectDialog.tsx`;
- `src/static-pages/constructor/components/SceneRuntimePanels.tsx`.

Размер `Constructor3DPage.tsx` уменьшен с 2771 до 2384 строк.

Следующая рекомендуемая декомпозиция: вынести step panels и `Checkout3DStep` в отдельные components, затем перейти к store decomposition.


## Infrastructure Decomposition Pass 02 — выполнено

- Вынесен `SizesStepPanel` из `Constructor3DPage.tsx`.
- `Constructor3DPage.tsx` уменьшен с 2384 до 2019 строк.
- Поведение не менялось: только перенос JSX/helper-логики шага «Размеры» в отдельный компонент.
- Следующий безопасный кандидат: `MaterialsStepPanel` + material helper components.

## Infrastructure Decomposition Pass 03 — Materials step extraction

Status: completed.

Extracted the materials step from `src/static-pages/Constructor3DPage.tsx` into `src/static-pages/constructor/components/MaterialsStepPanel.tsx`.

Result:

- `Constructor3DPage.tsx`: 2019 lines → 1789 lines.
- Runtime behavior unchanged.
- Pricing, checkout, Three.js, routes, validation, CSS and UX unchanged.

Next recommended safe extraction:

1. `FillingStepPanel` from the remaining filling branch.
2. `Checkout3DStep` if it is still inline or can be safely isolated further.
3. Only then start splitting `constructorStore.ts`.


---

## Infrastructure Decomposition All Pass update — 2026-06-10

Выполнено безопасно:

- page-level drawer logic вынесена из `Constructor3DPage.tsx`;
- создан `ConstructorDrawerContent.tsx`;
- создан `FillingStepPanel.tsx`;
- создан `Checkout3DStep.tsx`;
- создан `ConstructorDrawerPrimitives.tsx`;
- `Constructor3DPage.tsx` уменьшен до 705 строк.

Остановлено как небезопасное для одного прохода:

- дробление `constructorStore.ts`;
- дробление `projectRules.ts`;
- CSS purge;
- полное удаление legacy CSS/code;
- split Three scene adapter.

Следующий рекомендуемый безопасный pass:

1. split `FillingStepPanel.tsx` на `FillingZonePicker`, `FillingAddMenu`, `FillingElementsList`, `FillingFacadeControls`;
2. split `Constructor3DPage.tsx` на workspace shell + scene panel;
3. затем store slices.

## Update: Infrastructure Decomposition Pass — Filling + Shell UI Split

Completed safe decomposition of the filling step and shell-level stagebar/footer without behavior changes.

New components:

- `FillingStepTypes.ts`
- `FillingSelectionPanel.tsx`
- `FillingAddMenu.tsx`
- `FillingFacadeControls.tsx`
- `FillingElementsList.tsx`
- `ConstructorStagebar.tsx`
- `ConstructorDrawerFooter.tsx`

Current status:

- `Constructor3DPage.tsx`: reduced to 576 lines; still an orchestrator but no longer contains filling UI, stagebar internals, or drawer footer internals.
- `FillingStepPanel.tsx`: reduced to 225 lines; now orchestrates smaller filling components.

Next safe target: extract `ConstructorScenePanel.tsx`, then address `constructorStore.ts` in separate slice-based passes.


## Infrastructure Store Preparation Pass

Completed safe store preparation:

- extracted `ConstructorStoreState` to `constructorStoreTypes.ts`;
- extracted selection/clamp helpers to `constructorStoreUtils.ts`;
- extracted derived project state helpers to `constructorStoreDerivation.ts`;
- kept backward-compatible exports from `constructorStore.ts`.

`constructorStore.ts` reduced from about 1672 lines to 1419 lines without behavior changes.

Next recommended store work:

1. `constructorStoreInitialState.ts` for initial state and initial layout factories.
2. `constructorStoreCheckoutActions.ts` for contact/delivery/assembly/consent actions.
3. `constructorStoreSceneActions.ts` for scene and production snapshot actions.
4. `constructorStoreDimensionActions.ts` for furniture/dimensions/sections.
5. `constructorStoreFillingActions.ts` only after additional regression coverage.


## Infrastructure Store Initial State Pass — completed

Completed after store prep pass:

- extracted `constructorStoreInitialState.ts`;
- moved initial production snapshot, materials, layouts, filling layout, validation and `constructorInitialState`;
- preserved backward-compatible re-export from `constructorStore.ts`;
- reduced `constructorStore.ts` from 1419 to 1299 lines.

No runtime behavior, pricing, checkout, validation, Three.js, CSS, routes or UX was changed.

## Infrastructure store safe actions pass — completed

Выполнена безопасная декомпозиция части `constructorStore.ts`:

- material state helpers вынесены в `constructorMaterialState.ts`;
- production snapshot helpers вынесены в `constructorProductionSnapshotState.ts`;
- reset helper вынесен в `constructorResetState.ts`.

Поведение проекта не изменялось. Проверки прошли: typecheck, build, qa:static, validate:config, constructor-store, constructor-three, pricing-final.

Оставить на следующие отдельные passes:

- scene/exact-mode helpers;
- checkout/contact helpers;
- slice-factory migration;
- dimensions/sections/zones/filling/facades — только после подготовки regression coverage.

## Infrastructure Store Interaction / Restore Pass — 2026-06-10

Completed safe store extraction without behavior changes:

- `constructorInteractionState.ts` for exact mode, scene mode, delivery, assembly, contact and consent patch helpers.
- `constructorDraftRestoreState.ts` for draft restore normalization.
- `constructorFillCountState.ts` for legacy/global filling counters.

`constructorStore.ts` reduced to ~1052 lines. The next safe step is to prepare slice factories or extract dimensions/sections helpers. Risky zones/filling/facades logic should remain last.

## Infrastructure Store Slice Factory Pass

Добавлен безопасный slice-factory слой для низкорисковых action-групп store:

- scene/exact-mode;
- checkout/contact;
- materials;
- production snapshot;
- utility/reset/restore/legacy counters.

Risky actions в `constructorStore.ts` пока оставлены на месте: dimensions/sections/zones/filling/facades/auto-fix. Следующий safe pass должен переносить их маленькими группами, начиная с dimensions/sections.


## Update — Infrastructure Store Expanded Slices Pass

Completed additional safe store decomposition:

- Added `constructorStoreLimits.ts`.
- Added `constructorFurnitureDimensionsSlice.ts`.
- Added `constructorSectionSlice.ts`.
- Added `constructorCompartmentSlice.ts`.
- Added `constructorFacadeSlice.ts`.
- Reduced `constructorStore.ts` from 1000 lines to 559 lines.

Still not moved intentionally:

- filling internals;
- random preset;
- auto-fix;
- deep validation/rules logic.

These blocks are the next safe extraction candidates but require dedicated regression checks.

---

## Infrastructure Store Final Slices Pass — completed 2026-06-10

Выполнено:

- `constructorFillingSlice.ts` — вынесены filling actions.
- `constructorRandomPresetSlice.ts` — вынесен random preset action.
- `constructorAutoFixSlice.ts` — вынесен auto-fix action.
- `constructorStore.ts` сокращён до composition root (~36 строк).

Проверки:

- `npm run typecheck`
- `npm run build`
- `npm run qa:static`
- `npm run validate:config`
- `npm run test:constructor-store`
- `npm run test:constructor-three`
- `npm run test:pricing-final`

Следующий кандидат на декомпозицию: `projectRules.ts`.


## Infrastructure all remaining pass — 2026-06-10

Completed safe decomposition:

- `projectRules.ts` split into rule modules with compatibility barrel.
- `threeSceneAdapter.ts` split into primitives/layout/hardware/targets plus build entry.

Still intentionally deferred:

- CSS purge for `constructor.css`, `constructor3d.css`, `index.css` until visual QA.
- Full `compartment -> zone` rename until a dedicated compatibility migration.
- Production/geometry decomposition until a production regression pass.
- SVG renderer split until a 2D fallback visual QA pass.

## Infrastructure CSS Inventory Pass — 2026-06-11

Выполнено:

- добавлен `scripts/check-css-architecture.mjs`;
- добавлен `npm run check:css-architecture`;
- создан `docs/css-class-inventory.json`;
- создан `docs/css-architecture-audit.md`;
- создан `docs/css-migration-plan.md`;
- создан `docs/infrastructure-css-inventory-pass.md`.

Решение: CSS purge не выполнять без visual QA. Следующий безопасный шаг — visual baseline и split `constructor3d.css` на feature CSS-файлы без удаления selectors.

## Infrastructure CSS Split Pass — completed 2026-06-11

Active `src/styles/constructor3d.css` was split into ordered feature CSS modules under `src/styles/constructor3d/`. The root file remains the public import entrypoint and now only contains ordered `@import` statements. No selectors were deleted or renamed; this was a structural split only.

Next CSS work must start with visual baseline/QA before any purge.


## Production / Geometry Pass — 2026-06-11

Выполнено безопасное дробление production model layer без изменения поведения:

- `productionModel.ts` стал orchestration entry point.
- Вынесены helpers: math, edges, panels, drilling, totals, basis metadata.
- `buildHardware.ts` получил helper layer `buildHardwareHelpers.ts`.

Не выполнено намеренно:

- глубокое дробление hardware builders;
- изменение production formulas;
- изменение geometry coordinates;
- изменение public schemas.

Следующий шаг: production regression snapshots перед дальнейшим split hardware/geometry modules.
