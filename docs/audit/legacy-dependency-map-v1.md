# Legacy Dependency Map v1 — Размерно

Статус: COMPLETED.

Дата: 2026-06-14.

Роль: Architect Agent.

## 0. Scope

Документ фиксирует зависимости legacy-зоны без изменения runtime.

Runtime, tests, package scripts и бизнес-логика не менялись.

## 1. Dependency overview

Legacy dependency graph currently has this shape:

```txt
src/App.tsx
  -> src/static-pages/ConstructorPage.tsx
       -> src/static-pages/constructor/** active shared components/hooks

src/configurator/context.tsx
  -> src/configurator/data.ts
  -> src/shared/lib/price
  -> src/config/limits.json
  -> src/configurator/model/compartments.ts
  -> dynamic import src/configurator/store/configStoreBridge.ts

src/configurator/state/configReducer.ts
  -> src/configurator/context.tsx
  -> src/configurator/state/configNormalization.ts

src/configurator/state/initialConfigState.ts
  -> src/configurator/context.tsx

src/configurator/store/configStore.ts
  -> src/configurator/state/initialConfigState.ts
  -> src/configurator/state/configReducer.ts
  -> zustand

src/configurator/store/configSelectors.ts
  -> src/configurator/context.tsx
  -> src/configurator/data.ts

src/configurator/store/useConfigSelectors.ts
  -> src/configurator/store/configStore.ts

src/configurator/store/useConfigBridge.ts
  -> src/configurator/store/configActions.ts
  -> src/configurator/store/useConfigSelectors.ts

src/configurator/store/configStoreBridge.ts
  -> src/configurator/store/configStore.ts
  -> src/configurator/context.tsx types
```

## 2. Key dependency findings

## 2.1 `context.tsx` is the dependency root

Many legacy paths still lead back to `src/configurator/context.tsx`.

It exports:

- `ConfigState`;
- `ConfigAction`;
- `initialState`;
- `configReducer`;
- `calculatePrice`;
- `validate`;
- `ConfigProvider`;
- `useConfig`;
- `STEPS`.

This makes it the central legacy dependency root.

## 2.2 Transitional state still depends on context

`src/configurator/state/configReducer.ts` imports the reducer and types from `../context`.

`src/configurator/state/initialConfigState.ts` imports `initialState` from `../context`.

Therefore the state folder is not independent yet. It is a transitional wrapper around context.

## 2.3 Zustand bridge still depends on legacy semantics

`configStore.ts` uses `initialConfigState` and `configReducer`, which both depend on context.

`configSelectors.ts` calls `calculatePrice` and `validate` from context.

`useConfigBridge.ts` exposes state, actions, price, validation and materials through Zustand selectors, but these derived values still use legacy semantics.

## 2.4 Legacy route is hybrid

`src/static-pages/ConstructorPage.tsx` is a legacy route, but it imports active constructor components/hooks from `src/static-pages/constructor/**`.

This means:

- it is not pure isolated historical code;
- active component changes may affect legacy route;
- legacy route should remain quarantine;
- deleting it requires route/test review.

## 3. Active-to-legacy dependency status

Current reviewed active entrypoints:

- `src/App.tsx`
- `src/static-pages/Constructor3DPage.tsx`
- `src/static-pages/constructor/hooks/useConstructorPageState.ts`

No direct active `Constructor3D` import from `src/configurator/**` was identified in the reviewed files.

However:

- full deterministic verification requires `check:constructor3d-guard` to be runnable;
- package script is not yet connected;
- guard has not been executed locally.

Status:

Potential risk remains until guard passes.

## 4. Script/test dependencies

## 4.1 Legacy model tests

Scripts reference `src/configurator/model/**` tests:

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

Likely role:

Test-backed legacy model coverage.

Migration owner:

- QA Agent for classification;
- Constructor Core Agent for active equivalents.

## 4.2 Legacy Three tests

Scripts reference `src/configurator/three/**` tests:

- `test:three-performance`
- `test:texture-cache`
- `test:three-layout-markers`
- `test:selected-compartment-highlight`
- `test:deferred-geometry`

Likely role:

Historical or legacy coverage for old Three.js path.

Migration owner:

- Three.js Agent;
- QA Agent.

## 4.3 Legacy Zustand/config bridge tests

Scripts reference `src/configurator/store/**` tests:

- `test:zustand-foundation`
- `test:zustand-bridge`
- `test:provider-store-sync`
- `test:mobile-bar-zustand-read`
- `test:config-header-zustand-read`
- `test:stepper-zustand-read`
- `test:three-markers-zustand-read`
- `test:highlight-zustand-read`
- `test:three-viewer-zustand-read`
- `test:bridge-read-tests`

Likely role:

Bridge migration coverage.

Migration owner:

- QA Agent for mapping;
- Architect Agent for dependency review;
- Constructor Core Agent only after active replacement plan.

## 5. Removal blockers

## 5.1 Blocking `context.tsx` removal

Blocked by:

- state types;
- reducer;
- initial state;
- pricing wrapper;
- validation;
- selectors;
- store bridge;
- provider;
- tests.

## 5.2 Blocking `configStore.ts` removal

Blocked by:

- bridge tests;
- useConfigBridge;
- ConfigProvider dynamic bridge;
- configSelectors.

## 5.3 Blocking `ConstructorPage.tsx` removal

Blocked by:

- explicit legacy routes;
- historical/simple constructor checks;
- possible manual fallback/review need.

## 5.4 Blocking model tests removal

Blocked by:

- no documented active equivalent coverage for every scenario;
- layout model concepts overlap with active zones/compartments.

## 6. Dangerous dependencies

### D-001 — Legacy pricing wrapper

`configSelectors.ts` and `context.tsx` expose pricing via legacy state.

Risk:

Pricing Agent may accidentally treat this as current source of truth.

Mitigation:

Pricing source-of-truth audit must classify this path as legacy/transitional.

### D-002 — Legacy validation wrapper

`context.tsx` exposes `validate`, `hasErrors`, `getStepStatuses`, `firstErrorStep`.

Risk:

Constructor Core or Checkout work may import old validation semantics.

Mitigation:

Active validation must remain in `src/static-pages/constructor/**`.

### D-003 — Legacy layout concepts

`compartments.ts` contains concepts similar to active zones/compartments.

Risk:

Active model may accidentally reuse old assumptions.

Mitigation:

Constructor Core Agent must map concepts before implementation.

### D-004 — Legacy route imports active components

`ConstructorPage.tsx` imports active constructor components/hooks.

Risk:

Changes to active components may unintentionally affect legacy route.

Mitigation:

Keep legacy route quarantine; avoid testing it as active MVP path.

## 7. Recommended next actions

1. Finish package script hookup for `check:constructor3d-guard`.
2. Run guard locally.
3. QA Agent: create legacy test ownership map.
4. Constructor Core Agent: map legacy layout model to active state concepts.
5. Pricing Agent: classify legacy pricing wrapper.
6. Three.js Agent: map legacy Three tests to active Three.js coverage.

## 8. Conclusion

Legacy dependencies are not safe to delete. They are also not safe to develop further as product code.

The correct status is:

```txt
test-backed quarantine + migration source
```

The immediate risk is accidental reuse. The immediate mitigation is a working Constructor3D guard plus test ownership mapping.
