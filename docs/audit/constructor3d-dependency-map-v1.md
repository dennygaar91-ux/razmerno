# Constructor3D Dependency Map v1 — Размерно

Статус: COMPLETED.

Дата: 2026-06-14.

Роль: Architecture Guard Agent.

## 0. Scope

Документ описывает текущую карту зависимостей активного Constructor3D без изменения кода.

Не изменялись:

- runtime;
- state;
- pricing;
- checkout;
- Three.js;
- API;
- Supabase;
- production;
- admin;
- legacy.

## 1. Active path

Текущий активный MVP-путь:

```txt
src/App.tsx
  -> src/static-pages/Constructor3DPage.tsx
  -> src/static-pages/constructor/**
```

Новые изменения конструктора должны идти через этот путь, если отдельный planning-документ явно не разрешает другое.

Legacy path:

```txt
src/static-pages/ConstructorPage.tsx
src/configurator/**
```

Legacy path должен оставаться quarantine / migration source, а не основой нового функционала.

## 2. Constructor3D entrypoints

### 2.1 Primary page entrypoint

```txt
src/static-pages/Constructor3DPage.tsx
```

Фактическая роль:

- workspace shell;
- локальное состояние runtime/fallback диалогов;
- подключение state facade;
- подключение quote hook;
- подключение submit hook;
- сборка input для Three.js viewer;
- переключение 3D / 2D fallback;
- orchestration для drawer, footer, stagebar, scene.

Ключевые direct imports:

```txt
react
./constructor/components/ConstructorHeader
./constructor/components/ConstructorDrawerFooter
./constructor/components/ConstructorStagebar
./constructor/components/ConstructorDrawerContent
./constructor/components/ResetProjectDialog
./constructor/components/SceneRuntimePanels
./constructor/components/Constructor3DPageMeta
./constructor/components/ConstructorSceneModel
./constructor/components/LazyThreeFurnitureViewer
./constructor/three/useWebGLAvailable
./constructor/three/useThreeSceneQuality
./constructor/hooks/useConstructorPageState
./constructor/hooks/useConstructorQuote
./constructor/hooks/useConstructorSubmit
./constructor/options
./constructor/utils
./constructor/types
```

Риск:

- page уже является orchestration-heavy;
- guard должен ограничивать дальнейший рост page и запрещать business logic внутри page.

## 3. Hook layer

### 3.1 `useConstructorPageState`

```txt
src/static-pages/constructor/hooks/useConstructorPageState.ts
```

Фактическая роль:

- broad facade над Zustand store;
- собирает values/actions;
- резолвит selected furniture/material/facade material;
- создаёт `ConstructorSnapshot`;
- агрегирует selected state, validation, checkout fields, scene fields, project materials.

Direct dependencies:

```txt
react/useMemo
../options
../../../shared/materials/materialCatalog
../adapters/constructorPayload
../store/constructorStore
../rules/projectRules
../store/constructorSelectors
```

Риск:

- God Facade: слишком широкий набор selectors/actions;
- следующий Constructor State Agent должен не расширять facade без необходимости;
- желательно выделять focused hooks по доменам после guard implementation.

### 3.2 `useConstructorQuote`

```txt
src/static-pages/constructor/hooks/useConstructorQuote.ts
```

Фактическая роль:

- pricing integration для active Constructor3D;
- должен оставаться единственным UI-facing quote hook для page layer;
- не должен дублировать pricing formulas в page/store.

Expected dependencies:

```txt
src/pricing/**
src/shared/lib/pricing-core.ts
constructor adapters / snapshot input
```

Risk:

- цена должна оставаться точной;
- любые изменения формул — только Pricing Agent scope.

### 3.3 `useConstructorSubmit`

```txt
src/static-pages/constructor/hooks/useConstructorSubmit.ts
```

Фактическая роль:

- checkout/order submit integration;
- работает от snapshot + quote;
- отвечает за submit status/errors/cooldown.

Expected dependencies:

```txt
constructor payload adapter
order API adapter/fetch path
checkout validation helpers
```

Risk:

- нельзя менять order contract в architecture guard / state / Three.js tasks;
- нельзя хранить PII в localStorage.

## 4. Store layer

Primary store files:

```txt
src/static-pages/constructor/store/constructorStore.ts
src/static-pages/constructor/store/constructorStoreTypes.ts
src/static-pages/constructor/store/constructorSelectors.ts
src/static-pages/constructor/store/*Slice.ts
src/static-pages/constructor/store/*test.ts
```

Фактическая роль:

- canonical constructor UI state;
- dimensions;
- furniture type;
- sections;
- compartments/zones;
- filling;
- facades;
- materials;
- scene mode;
- validation;
- checkout UI state;
- reset state;
- production preview state only as read/preview if applicable.

Allowed outbound dependencies:

```txt
../types
../options
../rules/**
../adapters/** only if adapter is pure and does not call API
../../../shared/materials/**
```

Forbidden outbound dependencies:

```txt
src/configurator/**
api/** direct submit
Supabase client
server pricing formula copies
production mutation layer
```

Current risk:

- store has many selectors/actions;
- state refactor must wait until Constructor3D guard and legacy inventory are done.

## 5. Rules layer

Primary files:

```txt
src/static-pages/constructor/rules/**
```

Фактическая роль:

- UI configuration rules;
- client-visible validation;
- normalizers;
- zone/filling/facade/material rules;
- auto-fix for simple client issues.

Allowed dependencies:

```txt
../types
../options
shared pure constants
```

Forbidden dependencies:

```txt
src/configurator/**
pricing formula implementation
API/Supabase
production model mutation
complex manufacturing logic visible to client
```

Risk:

- rules layer can become mixed with production/manufacturing logic if not protected.

## 6. Adapter layer

Primary files:

```txt
src/static-pages/constructor/adapters/**
```

Known important adapter:

```txt
src/static-pages/constructor/adapters/constructorPayload.ts
```

Фактическая роль:

- converting constructor UI state / snapshot to payloads;
- production preview adapter if present;
- boundary between UI state and quote/order/production preview contracts.

Allowed dependencies:

```txt
../types
../store types
src/shared/** pure contracts
src/pricing/** only for approved quote integration adapter
```

Forbidden dependencies:

```txt
src/configurator/**
Supabase client direct usage
API route internals
admin/production mutable logic
```

Risk:

- adapter layer is the safest place for contract mapping;
- page/store must not bypass it.

## 7. Three.js / scene layer

Primary files:

```txt
src/static-pages/constructor/three/**
src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx
src/static-pages/constructor/components/SceneRuntimePanels.tsx
```

Current active page dependencies:

```txt
useWebGLDiagnostics
useThreeSceneQuality
LazyThreeFurnitureViewer
TwoDFallbackScene
ThreeSceneLoading
SceneRuntimeStatus
```

Фактическая роль:

- active 3D viewer;
- runtime WebGL diagnostics;
- scene quality selection;
- 2D fallback bridge;
- runtime failure recovery;
- section/zone selection callbacks;
- add-menu target callbacks.

Allowed dependencies:

```txt
../types
../rules pure geometry/view helpers
../components only scene-specific panels
shared material assets/catalog if pure
```

Forbidden dependencies:

```txt
src/configurator/three/**
pricing/checkout mutation
API/Supabase
production mutation layer
```

Risk:

- Three.js stability work must not be mixed with deep visual redesign or state refactor;
- fallback must remain available if WebGL fails.

## 8. Component layer

Primary component groups:

```txt
src/static-pages/constructor/components/ConstructorHeader.tsx
src/static-pages/constructor/components/ConstructorStagebar.tsx
src/static-pages/constructor/components/ConstructorDrawerContent.tsx
src/static-pages/constructor/components/ConstructorDrawerFooter.tsx
src/static-pages/constructor/components/ResetProjectDialog.tsx
src/static-pages/constructor/components/SceneRuntimePanels.tsx
src/static-pages/constructor/components/Constructor3DPageMeta.tsx
src/static-pages/constructor/components/ConstructorSceneModel.tsx
src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx
```

Фактическая роль:

- UI composition;
- step content;
- drawer content;
- footer/CTA;
- stagebar;
- scene panels;
- fallback rendering;
- metadata helpers.

Risk:

- components should not perform direct pricing/order/API side effects;
- components should receive callbacks/props from hooks/adapters.

## 9. Pricing integration map

Current page flow:

```txt
Constructor3DPage
  -> useConstructorPageState()
    -> snapshot / selected materials / furniture / validation
  -> useConstructorQuote({ snapshot-derived input })
    -> quote / quoteError / quoteStatus / formatPrice
  -> ConstructorDrawerFooter / DrawerContent display quote
```

Rules:

- price is exact, not preliminary;
- page must not calculate final price manually;
- fallback formatter is allowed only as formatting fallback, not formula source;
- pricing changes need Pricing Agent scope.

Risk:

- duplicated formulas in UI would create client/server mismatch.

## 10. Checkout integration map

Current page flow:

```txt
Constructor3DPage
  -> useConstructorPageState()
    -> contact / consent / delivery / assembly / snapshot
  -> useConstructorQuote()
    -> quote
  -> useConstructorSubmit({ snapshot, quote, onStepChange })
    -> errors / submitStatus / submitMessage / submit / cooldown
  -> ConstructorDrawerFooter
    -> primary action / consent / disabled state
```

Rules:

- checkout remains inside Constructor3D;
- name/phone/email/consent are required at checkout;
- warning/error behavior must follow active validation contract;
- model must not reset after success except explicit reset action.

Risk:

- checkout refactor must wait until state boundary is stable.

## 11. Legacy import risk analysis

Forbidden active-to-legacy imports:

```txt
src/static-pages/Constructor3DPage.tsx -> src/configurator/**
src/static-pages/constructor/** -> src/configurator/**
```

Reviewed high-risk entrypoints:

- `Constructor3DPage.tsx`: no direct `src/configurator/**` import observed.
- `useConstructorPageState.ts`: no direct `src/configurator/**` import observed.

Open risk:

- full tree scan is not enforced by a dedicated script yet;
- current search/audit is not a replacement for a deterministic guard;
- future agent changes can introduce legacy imports unless build-failing guard exists.

## 12. Dependency direction rules

Target direction:

```txt
Page
  -> hooks
  -> store/selectors/actions
  -> rules/adapters
  -> shared pure modules

Page
  -> scene components
  -> three runtime/fallback

Page
  -> quote hook
  -> approved pricing path

Page
  -> submit hook
  -> approved order path
```

Forbidden direction:

```txt
store -> page
rules -> page
three -> checkout submit
three -> pricing formulas
components -> API/Supabase direct
active constructor -> src/configurator/**
legacy -> active constructor runtime, unless migration test/docs explicitly says so
```

## 13. Boundary conclusions

P0 boundaries to guard immediately:

1. Active constructor must not import `src/configurator/**`.
2. `Constructor3DPage.tsx` must remain orchestration-only.
3. Active page must not calculate price outside `useConstructorQuote`.
4. Active page/components must not submit orders outside `useConstructorSubmit` or approved adapter.
5. Three.js layer must not change pricing/checkout/order state directly.
6. Legacy route must remain explicit quarantine until Legacy Migration Agent.

## 14. Handoff to next agents

### Required next agent

Architecture Guard Implementation Agent.

Goal:

- implement a script-only guard based on `docs/planning/constructor3d-guard-spec-v1.md`;
- add package script only if explicitly allowed;
- do not modify runtime.

### Parallel agents after this docs-only phase

Can work in parallel:

- QA / Build Agent: QA command map;
- Legacy Migration Agent: `src/configurator/**` inventory and test ownership map.

Must wait:

- Constructor State Agent;
- Pricing Agent;
- Three.js Stability Agent;
- Checkout Agent.