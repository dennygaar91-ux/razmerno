# Legacy Inventory v1 — Размерно

Статус: COMPLETED.

Дата: 2026-06-14.

Роль: Architect Agent.

## 0. Scope

Документ фиксирует архитектурный учёт legacy-зоны без изменения runtime.

Не изменялись:

- runtime;
- tests;
- package scripts;
- pricing;
- checkout;
- Three.js;
- API;
- Supabase;
- production;
- admin;
- legacy code.

## 1. Legacy scope

Текущая legacy-зона:

```txt
src/configurator/**
src/static-pages/ConstructorPage.tsx
legacy bridge files
legacy checks/scripts
legacy tests referencing configurator runtime
```

## 2. Executive Summary

Legacy-зона не является одним старым файлом. Это набор переходных архитектурных эпох:

1. Старый React Context / reducer / validation / pricing в `src/configurator/context.tsx`.
2. Transitional Zustand bridge вокруг старого context.
3. Legacy model layer для секций/отсеков в `src/configurator/model/**`.
4. Legacy Three.js tests и helpers в `src/configurator/three/**`.
5. Legacy route `src/static-pages/ConstructorPage.tsx`.
6. Historical stage scripts и tests, которые продолжают закреплять legacy как test-backed quarantine.

Главный вывод:

`src/configurator/context.tsx` остаётся центральным legacy God Module. От него зависят state, reducer, validation, pricing wrapper, ConfigProvider и bridge. Удалять его сейчас нельзя.

## 3. Classification categories

Категории:

- A — Runtime Legacy.
- B — Test-backed Legacy.
- C — Bridge / Migration Layer.
- D — Historical Only.
- E — Unknown Ownership.
- F — Candidate for Future Removal.

Категория F не означает удалить сейчас.

## 4. File inventory

| Path | Category | Ownership | Notes |
|---|---|---|---|
| `src/configurator/context.tsx` | A / C | Legacy runtime core | God Module: ConfigState, reducer, pricing wrapper, validation, Context provider, STEPS, bridge dynamic import. |
| `src/configurator/data.ts` | A / B | Legacy catalog | Materials/facades/hardware for old configurator. May still support legacy pricing selectors. |
| `src/configurator/model/compartments.ts` | A / B / C | Legacy layout model | Provides legacy layout model and conversions used by `context.tsx`. |
| `src/configurator/model/*.test.ts` | B | Legacy test coverage | Tests old layout/compartment logic. Must not be deleted before migration. |
| `src/configurator/state/configReducer.ts` | C | Transitional reducer entrypoint | Wraps reducer from `context.tsx` and normalizes state. |
| `src/configurator/state/initialConfigState.ts` | C | Transitional state entrypoint | Re-exports initial state from `context.tsx`. |
| `src/configurator/state/configNormalization.ts` | C / B | Transitional normalization | Needs separate review before removal. |
| `src/configurator/store/configStore.ts` | C | Transitional Zustand store | Uses initialConfigState and configReducer. |
| `src/configurator/store/configSelectors.ts` | C | Transitional selectors | Selects price/validation via legacy `calculatePrice` and `validate`. |
| `src/configurator/store/configActions.ts` | C | Transitional action facade | Typed action creators around ConfigAction from context. |
| `src/configurator/store/useConfigSelectors.ts` | C | Transitional React selectors | Hooks around configStore selectors. |
| `src/configurator/store/useConfigBridge.ts` | C | Bridge hook | Explicitly documented as Zustand-first bridge while old `useConfig()` remains compatibility layer. |
| `src/configurator/store/configStoreBridge.ts` | C | Context ↔ store bridge | Dynamic bridge used by ConfigProvider to mirror state and dispatch actions. |
| `src/configurator/store/*.test.ts` | B / C | Bridge test coverage | Test-backed legacy bridge. Must be mapped by QA before removal. |
| `src/configurator/three/**` | B / D | Legacy Three tests/helpers | Historical Three.js path. Active Three.js path is `src/static-pages/constructor/three/**`. |
| `src/static-pages/ConstructorPage.tsx` | A / D | Legacy route | Explicit `/constructor-legacy` and `/configurator-legacy` route target. |
| `scripts/check-stage19-legacy-cleanup.mjs` | B / D | Quarantine guard | Marker/quarantine guard, not active boundary guard. |
| `scripts/check-stage20-config-bridge.mjs` | B / D | Bridge guard | Historical bridge guard. |
| `scripts/check-constructor-architecture.mjs` | B / D | Historical simple constructor guard | Checks old/simple `ConstructorPage.tsx`, not active `Constructor3DPage`. |
| `scripts/check-legacy-runtime-imports.mjs` | B | Deprecated module guard | Useful but incomplete for active Constructor3D. |

## 5. Central legacy modules

## 5.1 `src/configurator/context.tsx`

Responsibilities currently mixed in one file:

- React Context;
- ConfigState;
- ConfigAction;
- reducer;
- initial state;
- layout compatibility helpers;
- pricing wrapper;
- validation;
- step statuses;
- material/facade/hardware derived values;
- bridge to Zustand store.

Risk:

This file looks like a valid source of truth, but it is legacy. New active Constructor3D work must not depend on it.

Migration requirement:

Before deletion, its responsibilities must be mapped to active equivalents:

- active constructor store;
- active constructor validation;
- active pricing quote path;
- active checkout/order path;
- active layout/zone model.

## 5.2 `src/configurator/model/compartments.ts`

Responsibilities:

- legacy section/compartment types;
- equal compartment creation;
- legacy filling to layout conversion;
- layout filling summary;
- add section by width;
- add compartment by height;
- set compartment kind/shelves/drawers;
- validate layout.

Risk:

Some concepts overlap with active Constructor3D zones/compartments, but this file is built around legacy model assumptions. It must not be reused directly by active Constructor3D without migration review.

## 5.3 `src/configurator/store/**`

Responsibilities:

- transitional Zustand store;
- selector bridge;
- action facade;
- ConfigProvider mirroring bridge;
- tests around store bridge.

Risk:

This layer creates a false sense that legacy state has already been migrated. In practice, many selectors still call legacy `calculatePrice` / `validate` from context.

## 5.4 `src/static-pages/ConstructorPage.tsx`

Status:

Explicit legacy route component.

Risk:

It imports active constructor hooks/components while remaining legacy route target. This means it is not pure historical code; it is a hybrid/simple constructor shell. It must be kept quarantine, not used for new feature work.

## 6. Legacy entrypoints

### Runtime routes

`src/App.tsx` maps:

```txt
/constructor-legacy
/configurator-legacy
```

into:

```txt
LazyConstructorPage -> src/static-pages/ConstructorPage.tsx
```

### Active routes

`/configurator`, `/constructor`, `/constructor.html`, `/configurator-3d`, `/constructor-3d`, `/constructor3d` map to active `Constructor3DPage`.

### Bridge entrypoints

- `ConfigProvider` dynamically imports `configStoreBridge`.
- `configStoreBridge` imports `useConfigStore`.
- `useConfigBridge` wraps selectors/actions for migrating consumers.

### Test/script entrypoints

Package scripts still include many legacy/configurator tests:

- `test:compartments`
- `test:layout-state`
- `test:compartment-ui`
- `test:advanced-layout`
- `test:compartment-editor`
- `test:compartment-counts`
- `test:add-layout-parts`
- `test:layout-payload`
- `test:layout-validation`
- `test:layout-final`
- `test:three-performance`
- `test:texture-cache`
- `test:three-layout-markers`
- `test:selected-compartment-highlight`
- `test:deferred-geometry`
- `test:zustand-foundation`
- `test:zustand-bridge`
- `test:provider-store-sync`
- `test:bridge-read-tests`

## 7. Removal readiness

### Safe to remove now

None.

### Future removal candidates after migration

- legacy configurator model tests after active equivalents exist;
- legacy Three.js tests after active scene tests cover same behavior;
- config bridge once no runtime/tests depend on it;
- `ConstructorPage.tsx` after legacy routes are removed by explicit approval.

### Must not remove before dedicated migration

- `context.tsx`;
- `configStore.ts` / bridge files;
- model tests;
- stage20 bridge scripts;
- legacy route.

## 8. Follow-up tasks

1. QA Agent: classify legacy tests and identify active replacements.
2. Constructor Core Agent: map legacy layout concepts to active zones/sections model.
3. Pricing Agent: classify legacy `calculatePrice` wrapper as legacy / preview / obsolete.
4. Three.js Agent: map legacy `src/configurator/three/**` test coverage to active scene tests.
5. Architect Agent: complete full architecture dependency graph.

## 9. Conclusion

Legacy is still structurally important as a quarantine/test-backed layer. It should not receive new features, but it also cannot be removed safely now. The next safe step is dependency mapping and test ownership classification, not deletion.
