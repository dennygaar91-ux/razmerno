# Agent Task — Constructor3D Guard Implementation v1

Статус: READY.

Роль: Architect Agent.

Подзадача внутри роли:

Architecture Guard Implementation.

Важно:

Это НЕ отдельная новая роль агента. Это архитектурная подзадача внутри Architect Agent.

## 1. Контекст

Предыдущий Architecture Guard docs-only этап завершён и принят.

Созданы документы:

- `docs/audit/guard-audit-v1.md`
- `docs/audit/constructor3d-dependency-map-v1.md`
- `docs/planning/constructor3d-guard-spec-v1.md`
- `docs/audit/architecture-risk-register-v1.md`

Главный вывод:

активный путь `Constructor3DPage -> src/static-pages/constructor/**` пока не защищён dedicated build-failing guard.

До начала Constructor Core / Three.js / Pricing / Checkout работ необходимо реализовать scripts-only guard.

## 2. Цель задачи

Реализовать архитектурный guard для active Constructor3D scope.

Guard должен:

- защищать active Constructor3D от legacy imports;
- запрещать опасные direct imports;
- проверять обязательные active files;
- контролировать критичный рост `Constructor3DPage.tsx`;
- выдавать warning по breadth-sensitive зонам;
- не менять runtime.

## 3. Перед началом обязательно изучить

- `docs/planning/constructor3d-guard-spec-v1.md`
- `docs/audit/guard-audit-v1.md`
- `docs/audit/constructor3d-dependency-map-v1.md`
- `docs/audit/architecture-risk-register-v1.md`
- `docs/planning/architecture-boundaries-v1.md`
- `docs/planning/agent-responsibility-matrix-v1.md`
- `docs/planning/parallelization-rules.md`

## 4. Разрешённые изменения

Разрешено менять только:

- `scripts/check-constructor3d-architecture.mjs`
- `package.json` для добавления script command
- docs/report файл по результату, если нужен

Разрешённый package script:

```json
"check:constructor3d-guard": "node scripts/check-constructor3d-architecture.mjs"
```

Можно также добавить:

```json
"qa:constructor3d-architecture": "npm run check:constructor3d-guard && npm run test:constructor-store && npm run test:constructor-payload && npm run test:constructor-three && npm run test:constructor-three-safety"
```

Но `qa:constructor3d-architecture` добавлять только если текущие script names существуют и не требуют изменения runtime.

## 5. Запрещено

Нельзя менять:

- `src/static-pages/Constructor3DPage.tsx`
- `src/static-pages/constructor/**`
- `src/configurator/**`
- pricing
- checkout
- Three.js runtime
- API
- Supabase
- production layer
- admin
- CSS
- tests поведения
- legacy routes

Нельзя:

- удалять legacy;
- рефакторить runtime;
- auto-fix imports;
- менять бизнес-логику;
- менять UI.

## 6. Active scope

Guard должен сканировать:

```txt
src/static-pages/Constructor3DPage.tsx
src/static-pages/constructor/**
```

Файлы расширений:

```txt
.ts
.tsx
.js
.jsx
.mjs
.cjs
```

Можно исключить:

```txt
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx
```

Исключение тестов допустимо только если guard явно пишет, что tests не являются runtime active scope.

## 7. Hard-fail checks

Script должен завершаться с exit code `1`, если найдено:

### 7.1 Active import from legacy configurator

Любой файл active scope импортирует:

```txt
src/configurator/**
../configurator/**
../../configurator/**
../../../configurator/**
@/configurator/**
```

Проверять:

- static import;
- dynamic import;
- require.

### 7.2 Active import from legacy ConstructorPage

Любой active файл импортирует:

```txt
src/static-pages/ConstructorPage.tsx
../ConstructorPage
./ConstructorPage
```

### 7.3 Active import from deprecated constructor modules

Запрещены импорты из:

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

### 7.4 Direct Supabase / API / Admin / Production mutation imports

В active scope запрещены:

```txt
@supabase/supabase-js
api/**
src/admin/**
src/constructor/production/**
```

Исключения:

- type-only shared contracts;
- approved adapter paths, если они уже документированы.

### 7.5 Three layer side-effect imports

Внутри:

```txt
src/static-pages/constructor/three/**
```

запрещены imports из:

```txt
src/pricing/**
api/**
useConstructorSubmit
@supabase/supabase-js
```

### 7.6 Store layer side-effect imports

Внутри:

```txt
src/static-pages/constructor/store/**
```

запрещены imports из:

```txt
api/**
@supabase/supabase-js
src/admin/**
server-only modules
```

### 7.7 Constructor3DPage direct pricing/order/API bypass

`src/static-pages/Constructor3DPage.tsx` не должен:

- импортировать pricing formula напрямую;
- импортировать API route напрямую;
- импортировать Supabase client;
- собирать order payload вручную при наличии adapter;
- вызывать fetch для submit напрямую.

Допустимые hooks:

- `useConstructorQuote`
- `useConstructorSubmit`

### 7.8 Required active files

Script должен проверять наличие:

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

### 7.9 Hard line threshold

`src/static-pages/Constructor3DPage.tsx`:

- warning if `> 420` lines;
- hard fail if `> 520` lines.

## 8. Warning-only checks

Warnings should not fail the build initially.

Warn on:

- `useConstructorPageState.ts` > 380 lines;
- `constructorSelectors.ts` > 500 lines;
- component file > 300 lines;
- component file > 450 lines should be highlighted as serious warning unless spec says hard fail;
- slice file > 350 lines;
- `constructorStore.ts` > 260 lines;
- package scripts still containing historical stage families.

## 9. Implementation constraints

Script must:

- use filesystem reads only;
- not import runtime project modules;
- not execute app code;
- print grouped errors;
- print grouped warnings;
- exit `1` on hard errors;
- exit `0` if only warnings exist.

Recommended groups:

- Required file errors;
- Legacy import errors;
- Layer violation errors;
- Page bypass errors;
- File-size errors;
- Warnings.

## 10. Required commands to run

After implementation run:

```bash
npm run check:constructor3d-guard
```

If package script was added.

Also run:

```bash
npm run typecheck
```

If dependencies are installed and command is available.

If checks cannot be run, explain exactly why.

## 11. Report format

At the end report:

- changed files;
- exact checks run;
- pass/fail result;
- warnings produced by guard;
- whether runtime was untouched;
- whether package.json was changed;
- remaining risks;
- next recommended Architect Agent task.

## 12. Acceptance criteria

Task is complete when:

1. `scripts/check-constructor3d-architecture.mjs` exists.
2. Package script `check:constructor3d-guard` exists.
3. Guard scans active Constructor3D scope.
4. Guard hard-fails on `src/configurator/**` imports from active scope.
5. Guard hard-fails on direct forbidden layer imports.
6. Guard validates required active files.
7. Guard reports line warnings/errors.
8. No runtime behavior changed.
9. Report states checks result.

## 13. Next step after completion

After this task, control returns to Architect Agent for review.

Only after Architect Agent accepts guard implementation can the project move to:

- Legacy architecture inventory;
- QA command map;
- Constructor Core Agent branch;
- Three.js Agent branch;
- Pricing Agent branch.
