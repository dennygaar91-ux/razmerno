# Constructor3D Guard Spec v1 — Размерно

Статус: READY FOR IMPLEMENTATION.

Дата: 2026-06-14.

Роль: Architecture Guard Agent.

## 0. Назначение

Этот документ описывает спецификацию нового architecture guard для активного Constructor3D.

На этом этапе guard не реализуется. Документ нужен как контракт для следующего scripts-only агента.

## 1. Цель guard

Новый guard должен защищать active MVP path:

```txt
src/static-pages/Constructor3DPage.tsx
src/static-pages/constructor/**
```

от случайных нарушений архитектурных границ:

- imports из legacy runtime;
- прямой pricing logic вне approved quote path;
- прямой checkout/order/API logic вне approved submit path;
- рост `Constructor3DPage.tsx` как God Component;
- смешение Three.js, state, pricing, checkout и production layers;
- ошибочное развитие `src/configurator/**` как active constructor.

## 2. Proposed script

Рекомендуемое имя:

```txt
scripts/check-constructor3d-architecture.mjs
```

Рекомендуемый package script:

```json
"check:constructor3d-architecture": "node scripts/check-constructor3d-architecture.mjs"
```

Альтернативное короткое имя:

```json
"check:constructor3d-guard": "node scripts/check-constructor3d-architecture.mjs"
```

Рекомендация:

- использовать `check:constructor3d-guard` как основной public command;
- оставить `check:constructor-architecture` как historical/simple constructor guard до QA command map.

## 3. Active directories

Guard должен считать active scope:

```txt
src/static-pages/Constructor3DPage.tsx
src/static-pages/constructor/**
```

Внутри active scope поддомены:

```txt
src/static-pages/constructor/components/**
src/static-pages/constructor/hooks/**
src/static-pages/constructor/store/**
src/static-pages/constructor/rules/**
src/static-pages/constructor/three/**
src/static-pages/constructor/adapters/**
src/static-pages/constructor/types.ts
src/static-pages/constructor/options.ts
src/static-pages/constructor/utils.ts
```

## 4. Legacy directories

Guard должен считать legacy scope:

```txt
src/static-pages/ConstructorPage.tsx
src/configurator/**
```

Special legacy subscopes:

```txt
src/configurator/context.tsx
src/configurator/store/**
src/configurator/three/**
src/configurator/model/**
```

Legacy разрешён только для:

- docs;
- explicit migration scripts;
- explicit migration tests;
- quarantine checks.

## 5. Forbidden imports

### 5.1 Active Constructor3D -> legacy runtime

Любой файл внутри active scope не должен импортировать:

```txt
src/configurator/**
../configurator/**
../../configurator/**
../../../configurator/**
@/configurator/**
```

Запрещённые паттерны:

```ts
import { x } from "../../configurator/...";
import("../../configurator/...");
const x = require("../../configurator/...");
```

Build должен падать.

### 5.2 Active Constructor3D -> legacy page

Любой файл внутри active scope не должен импортировать:

```txt
src/static-pages/ConstructorPage.tsx
../ConstructorPage
./ConstructorPage
```

Build должен падать.

### 5.3 Active Constructor3D -> deprecated constructor modules

Любой файл внутри active scope не должен импортировать deprecated modules из current legacy production family:

```txt
src/constructor/api.ts
src/constructor/legacyGeometry.ts
src/constructor/payload.ts
src/constructor/basisAdapter.ts
src/constructor/pricing.ts
src/constructor/productionModel.ts
src/constructor/quickEstimate.ts
src/constructor/rules.ts
src/constructor/basis/manualExport.ts
src/constructor/drillingTemplates.ts
```

Эта проверка может переиспользовать логику `check-legacy-runtime-imports.mjs`, но должна быть scoped и explicit для Constructor3D.

### 5.4 Page layer -> direct API/Supabase/Admin/Production mutation

`src/static-pages/Constructor3DPage.tsx` не должен импортировать:

```txt
api/**
src/admin/**
src/constructor/production/**
@supabase/supabase-js
```

Исключения:

- type-only imports из shared contracts, если они не тянут runtime dependency;
- production preview only через approved adapter/hook, если уже существует и документирован.

### 5.5 Three layer -> pricing/checkout/order side effects

Файлы внутри:

```txt
src/static-pages/constructor/three/**
```

не должны импортировать:

```txt
src/pricing/**
api/**
useConstructorSubmit
constructorPayload order submit functions
Supabase client
```

Three layer может получать prepared `input` и callbacks сверху, но не должен сам менять quote/order flow.

### 5.6 Store layer -> side effects

Файлы внутри:

```txt
src/static-pages/constructor/store/**
```

не должны импортировать:

```txt
api/**
@supabase/supabase-js
src/admin/**
server-only modules
```

Store не должен отправлять заявки, читать Supabase или считать server pricing.

## 6. Allowed imports

### 6.1 Active page allowed imports

`Constructor3DPage.tsx` может импортировать:

```txt
react
./constructor/components/**
./constructor/hooks/**
./constructor/three/** diagnostics/quality only
./constructor/options
./constructor/types
./constructor/utils
```

Допускается:

```txt
shared pure types/constants
```

Не допускается:

```txt
src/configurator/**
api/** direct
Supabase direct
admin direct
production mutation direct
pricing formulas direct
```

### 6.2 Hooks allowed imports

`constructor/hooks/**` может импортировать:

```txt
../store/**
../rules/**
../adapters/**
../types
../options
src/pricing/** only for quote hook
shared pure modules
```

Hook-specific allowance:

- `useConstructorQuote` может импортировать approved pricing path.
- `useConstructorSubmit` может импортировать approved payload/order adapter path.

### 6.3 Components allowed imports

`constructor/components/**` может импортировать:

```txt
../types
../options
../rules pure helpers
../components subcomponents
../three viewer/fallback components only where scene-specific
shared UI utilities
```

Components should not directly call API/Supabase.

### 6.4 Store allowed imports

`constructor/store/**` может импортировать:

```txt
../types
../options
../rules/**
../adapters/** only pure payload/snapshot helpers
shared pure constants/materials
zustand
```

### 6.5 Rules allowed imports

`constructor/rules/**` может импортировать:

```txt
../types
../options
shared pure constants
```

### 6.6 Adapters allowed imports

`constructor/adapters/**` может импортировать:

```txt
../types
../store types
src/shared/** pure contracts
src/pricing/** only if adapter is explicitly pricing adapter
```

### 6.7 Three allowed imports

`constructor/three/**` может импортировать:

```txt
three
@react-three/fiber
@react-three/drei
../types
../rules pure view/geometry helpers
shared pure material assets/catalog
```

## 7. File-size and orchestration rules

### 7.1 `Constructor3DPage.tsx`

Recommended hard limit:

```txt
max 420 lines
```

Current file is already orchestration-heavy, so the first implementation can use warning threshold before hard fail if needed.

Recommended staged policy:

- Warning threshold: > 420 lines.
- Hard fail threshold: > 520 lines.
- Long-term target after decomposition: < 300 lines.

### 7.2 `useConstructorPageState.ts`

Recommended hard limit:

```txt
max 380 lines initially
```

Long-term target:

- split by focused domain hooks;
- do not expand this hook unless explicitly justified.

### 7.3 Component files

Recommended warning threshold:

```txt
components > 300 lines
```

Recommended hard fail threshold:

```txt
components > 450 lines
```

Exception:

- scene viewer files can be larger temporarily if Three.js Stability Agent documents why.

### 7.4 Store files

Recommended rule:

- `constructorStore.ts` should remain composition entrypoint;
- slice files should remain domain-focused;
- no single slice should become a God Store.

Initial thresholds:

```txt
constructorStore.ts <= 260 lines
constructorSelectors.ts warning > 500 lines
slice file warning > 350 lines
```

Do not fail current build on selector breadth until State Agent confirms target split.

## 8. Orchestration-only page rules

`Constructor3DPage.tsx` may:

- hold local UI/runtime state for 3D failure, reduced quality, reset dialog, active add target;
- call approved hooks;
- derive simple UI labels;
- pass props/callbacks to components;
- choose 3D vs 2D fallback rendering.

`Constructor3DPage.tsx` must not:

- define pricing formulas;
- define order payload assembly manually if adapter exists;
- call `fetch`/API directly for order submit;
- call Supabase directly;
- mutate production model;
- import legacy configurator;
- implement large step UI inline;
- implement large Three.js scene inline.

## 9. Build-failing violations

The guard should fail on:

1. Any active import from `src/configurator/**`.
2. Any active import from `src/static-pages/ConstructorPage.tsx`.
3. Any active import from deprecated `src/constructor/*` modules listed above.
4. Direct Supabase import in active constructor scope.
5. Direct API route import in `Constructor3DPage.tsx` or components, except approved adapter if documented.
6. Direct pricing formula import in `Constructor3DPage.tsx`, except `useConstructorQuote`.
7. Three layer importing pricing/checkout/API/Supabase.
8. Store layer importing API/Supabase/admin/server-only modules.
9. `Constructor3DPage.tsx` exceeding hard line threshold.
10. Missing required active entry files.

## 10. Warning-only violations initially

The guard may warn, not fail, on first implementation:

1. `useConstructorPageState.ts` breadth.
2. `constructorSelectors.ts` breadth.
3. Component files over warning threshold.
4. Historical scripts existing in package.json.
5. CSS global ownership ambiguity.

These should become hard-fail only after dedicated decomposition/QA phases.

## 11. Required active files

Guard should require existence of:

```txt
src/static-pages/Constructor3DPage.tsx
src/static-pages/constructor/hooks/useConstructorPageState.ts
src/static-pages/constructor/hooks/useConstructorQuote.ts
src/static-pages/constructor/hooks/useConstructorSubmit.ts
src/static-pages/constructor/store/constructorStore.ts
src/static-pages/constructor/store/constructorSelectors.ts
src/static-pages/constructor/adapters/constructorPayload.ts
src/static-pages/constructor/components/ConstructorDrawerContent.tsx
src/static-pages/constructor/components/ConstructorDrawerFooter.tsx
src/static-pages/constructor/components/ConstructorStagebar.tsx
src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx
src/static-pages/constructor/components/SceneRuntimePanels.tsx
src/static-pages/constructor/three/useWebGLAvailable.ts
src/static-pages/constructor/three/useThreeSceneQuality.ts
```

If exact file names change later, the changing agent must update the guard spec and implementation in the same explicit architecture scope.

## 12. Suggested implementation approach

Script should:

1. Walk active scope files.
2. Parse/read text for import-like statements.
3. Resolve relative imports enough to detect `configurator`, legacy page and deprecated modules.
4. Apply layer-specific deny lists.
5. Check required files.
6. Count file lines for thresholds.
7. Print grouped errors:
   - Legacy import errors;
   - Layer violation errors;
   - File-size errors;
   - Required file errors;
   - Warning-only findings.
8. Exit `1` on hard errors.
9. Exit `0` with warnings if only warnings exist.

No runtime code should be imported by the script. It should use filesystem reads only.

## 13. CI / package integration recommendation

After implementation, recommended commands:

```json
"check:constructor3d-guard": "node scripts/check-constructor3d-architecture.mjs",
"qa:constructor3d-architecture": "npm run check:constructor3d-guard && npm run test:constructor-store && npm run test:constructor-payload && npm run test:constructor-three && npm run test:constructor-three-safety"
```

Do not add this to global `qa:all` until QA / Build Agent creates command map and confirms runtime cost.

## 14. Non-goals

This guard must not:

- refactor files;
- auto-fix imports;
- delete legacy;
- change pricing;
- change checkout;
- change Three.js visuals;
- change API/Supabase/admin/production;
- enforce design-system styling;
- enforce CSS cleanup.

## 15. Acceptance criteria for implementation agent

Implementation is complete when:

1. Script exists.
2. Script scans active Constructor3D scope.
3. Script fails on active imports from `src/configurator/**`.
4. Script fails on direct forbidden layer imports.
5. Script validates required active files.
6. Script reports line-threshold warnings/errors.
7. `package.json` is updated only if implementation scope explicitly allows it.
8. No runtime behavior is changed.
9. Report includes command run and result.

## 16. Handoff

Next role after this spec:

Architecture Guard Implementation Agent.

The agent may work independently from documentation/QA mapping, but must not run concurrently with state refactor or Three.js architecture refactor until the guard is implemented and passing.