# Guard Audit v1 — Размерно

Статус: COMPLETED.

Дата: 2026-06-14.

Роль: Architecture Guard Agent.

## 0. Scope

Задача выполнена в docs-only режиме.

Не изменялись:

- runtime код;
- Constructor3DPage;
- stores;
- pricing;
- checkout;
- Three.js;
- API;
- Supabase;
- production layer;
- admin;
- legacy runtime.

Проверены:

- `scripts/check-legacy-runtime-imports.mjs`;
- `scripts/check-constructor-architecture.mjs`;
- `scripts/check-stage19-legacy-cleanup.mjs`;
- `scripts/check-stage20-config-bridge.mjs`;
- `package.json` scripts.

Основание:

- `docs/planning/final-lead-architect-handoff-v1.md`;
- `docs/planning/agent-task-architecture-guard-v1.md`;
- `docs/planning/architecture-boundaries-v1.md`;
- `docs/audit/architecture-gap-analysis-v1.md`.

## 1. Executive Summary

Текущие guards частично полезны, но не закрывают главный P0-риск: активный путь `Constructor3DPage -> src/static-pages/constructor/**` пока не защищён отдельным Constructor3D-specific guard.

Главная проблема не в отсутствии проверок вообще, а в том, что несколько проверок относятся к предыдущим архитектурным эпохам:

1. `check-constructor-architecture.mjs` проверяет `ConstructorPage.tsx`, а не активный `Constructor3DPage.tsx`.
2. `check-stage19-legacy-cleanup.mjs` проверяет наличие legacy quarantine markers, но не запрещает dangerous imports в активном Constructor3D.
3. `check-stage20-config-bridge.mjs` защищает legacy bridge / config store, а не active constructor boundary.
4. `check-legacy-runtime-imports.mjs` запрещает часть старых `src/constructor/*` modules, но не запрещает импорт `src/configurator/**` в активный Constructor3D.
5. `package.json` содержит много исторических stage scripts, поэтому агенты могут перепутать current quality gates, historical guards и active MVP roadmap.

Итог: перед state refactor, pricing audit, Three.js работами и legacy migration нужен новый guard, который явно защищает активную ветку:

```txt
src/App.tsx
  -> src/static-pages/Constructor3DPage.tsx
  -> src/static-pages/constructor/**
```

## 2. Guard audit matrix

| Guard | Что реально проверяет | Active Constructor3D? | Legacy? | Статус | Главный gap |
|---|---|---:|---:|---|---|
| `check-legacy-runtime-imports.mjs` | Запрещает импорты ряда deprecated `src/constructor/*` модулей из `src` и `api` | Частично | Частично | Полезен, но неполный | Не ловит `src/configurator/**` imports в active Constructor3D |
| `check-constructor-architecture.mjs` | Проверяет декомпозицию `ConstructorPage.tsx`, `ConstructorSidebar`, `ConstructorScene`, step panel | Нет | Да / historical simple constructor | Устарел относительно active path | Не проверяет `Constructor3DPage.tsx` |
| `check-stage19-legacy-cleanup.mjs` | Проверяет STAGE19 marker, explicit legacy routes, legacy doc marker | Частично | Да | Quarantine marker guard | Не проверяет runtime boundary |
| `check-stage20-config-bridge.mjs` | Проверяет наличие config bridge files/actions/tests в `src/configurator/store/**` | Нет | Да | Historical bridge guard | Может закреплять legacy как активную зону для новых агентов |
| `package.json` scripts | Содержит current, historical, production/admin, constructor, 3D, pricing, stage-n/q/stage03 scripts | Смешанно | Смешанно | Нужна governance-карта | Нет явного разделения current vs historical |

## 3. Detailed audit

### 3.1 `scripts/check-legacy-runtime-imports.mjs`

Что проверяет:

- рекурсивно читает `src` и `api`;
- пропускает `node_modules`, `dist`, `docs`;
- ищет импорты deprecated modules по basename;
- запрещает импортировать перечисленные старые modules:
  - `src/constructor/api.ts`;
  - `src/constructor/legacyGeometry.ts`;
  - `src/constructor/payload.ts`;
  - `src/constructor/basisAdapter.ts`;
  - `src/constructor/pricing.ts`;
  - `src/constructor/productionModel.ts`;
  - `src/constructor/quickEstimate.ts`;
  - `src/constructor/rules.ts`;
  - `src/constructor/basis/manualExport.ts`;
  - `src/constructor/drillingTemplates.ts`.

Что не проверяет:

- не запрещает imports из `src/configurator/**`;
- не выделяет active Constructor3D boundary;
- не проверяет `src/static-pages/Constructor3DPage.tsx` отдельно;
- не проверяет directionality между `constructor/hooks`, `constructor/store`, `constructor/rules`, `constructor/three`, `constructor/adapters`;
- не проверяет pricing/order/API side effects внутри page layer;
- regex ищет basename, поэтому возможны false positives/false negatives при совпадении имён.

Относится ли к active Constructor3D:

- косвенно да, потому что сканирует весь `src`;
- практически недостаточно, потому что главный forbidden boundary сейчас `src/configurator/**`, а не только старые `src/constructor/*` modules.

Относится ли к legacy:

- да, как guard против старого production/constructor module family.

Устарел ли guard:

- нет, но он неполный и должен остаться как общий deprecated-module guard.

Рекомендация:

- не удалять;
- не считать достаточной защитой Constructor3D;
- дополнить отдельным `check:constructor3d-guard` по спецификации `docs/planning/constructor3d-guard-spec-v1.md`.

### 3.2 `scripts/check-constructor-architecture.mjs`

Что проверяет:

- наличие `src/static-pages/ConstructorPage.tsx`;
- наличие `useConstructorPageState`, `ConstructorSidebar`, `ConstructorStepPanel`, `ConstructorDraftRow`, `ConstructorFlowActions`, `ConstructorScene`, scene subcomponents;
- что `ConstructorPage.tsx` использует `useConstructorQuote`, `useConstructorSubmit`, `useProductionPreview`;
- что `ConstructorPage.tsx` не рендерит step components напрямую;
- line limits для `ConstructorPage.tsx`, `ConstructorSidebar.tsx`, `ConstructorScene.tsx`;
- декомпозицию old/simple constructor shell.

Что не проверяет:

- `src/static-pages/Constructor3DPage.tsx`;
- `LazyThreeFurnitureViewer` usage;
- `SceneRuntimePanels` / fallback boundary;
- `DrawerContent` / `ConstructorDrawerFooter` boundary;
- dangerous imports из `src/configurator/**`;
- прямую orchestration-heavy логику в `Constructor3DPage.tsx`;
- direct pricing/order/API logic внутри active page;
- active path file size/ownership rules;
- active constructor store selectors/actions breadth.

Относится ли к active Constructor3D:

- нет. Он может проверять shared components внутри `src/static-pages/constructor/components/**`, но целевой page component — `ConstructorPage.tsx`, а не `Constructor3DPage.tsx`.

Относится ли к legacy:

- да, фактически это historical/simple constructor guard.

Устарел ли guard:

- устарел как основной architecture guard;
- может оставаться как historical/simple constructor decomposition guard до legacy migration.

Рекомендация:

- не удалять сейчас;
- явно классифицировать как historical guard в будущей QA command map;
- не использовать как доказательство, что Constructor3D защищён;
- создать новый Constructor3D guard.

### 3.3 `scripts/check-stage19-legacy-cleanup.mjs`

Что проверяет:

- читает `src/App.tsx`;
- читает `src/static-pages/Constructor3DPage.tsx`;
- проверяет `data-legacy-stage="STAGE19"`;
- проверяет наличие explicit routes `/constructor-legacy` и `/configurator-legacy`;
- проверяет наличие текста `test-backed legacy` в `docs/legacy/LEGACY_CLEANUP_STAGE19.md`.

Что не проверяет:

- что legacy routes не используются как active route;
- что active constructor не импортирует legacy runtime;
- что legacy не импортируется в hooks/store/adapters/three;
- что agents не продолжают развивать `ConstructorPage.tsx`;
- что package scripts не направляют текущую работу в legacy branch.

Относится ли к active Constructor3D:

- частично: проверяет marker в active page.

Относится ли к legacy:

- да: проверяет явность legacy routes и quarantine doc.

Устарел ли guard:

- нет, но это marker/quarantine guard, а не dependency guard.

Рекомендация:

- оставить;
- дополнить Constructor3D import boundary guard;
- в risk register сохранить риск: marker есть, но runtime boundary не защищён.

### 3.4 `scripts/check-stage20-config-bridge.mjs`

Что проверяет:

- наличие и токены в `src/configurator/store/configActions.ts`;
- наличие и токены в `src/configurator/store/useConfigBridge.ts`;
- наличие токена в `tests/config-actions-coverage.test.ts`;
- фактически закрепляет config bridge и actions coverage для legacy/configurator state line.

Что не проверяет:

- active Constructor3D;
- active constructor store;
- active page imports;
- migration direction from legacy to active;
- отсутствие импортов legacy bridge в active path;
- отсутствие pricing/checkout leakage.

Относится ли к active Constructor3D:

- нет.

Относится ли к legacy:

- да.

Устарел ли guard:

- historical / migration guard. Полезен только пока legacy bridge нужен для test-backed quarantine.

Рекомендация:

- не удалять до Legacy Migration Agent;
- пометить в QA command map как historical legacy bridge guard;
- не запускать как главный критерий active Constructor3D architecture readiness.

### 3.5 `package.json` scripts

Что реально видно:

- есть базовые scripts: `dev`, `build`, `preview`, `typecheck`, `typecheck:api`;
- есть очень длинный `qa:all`, включающий historical, production/admin, design-system, configurator, pricing, geometry, stage checks;
- есть normalized scripts: `qa:core`, `qa:frontend`, `qa:api`, `qa:production`, `qa:admin`, `qa:cleanup`, `qa:all:normalized`;
- есть active constructor scripts:
  - `test:constructor-store`;
  - `test:constructor-payload`;
  - `test:production-preview`;
  - `test:constructor-draft`;
  - `check:constructor-architecture`;
  - `test:constructor-flow`;
  - `test:constructor-pii-order`;
  - `test:constructor-three`;
  - `test:constructor-three-safety`;
  - `test:constructor3d-e2e`;
  - `test:constructor3d-wcag-e2e`;
- есть historical stage families: stage3-stage27, stage-n, stage-q, stage03-stage19;
- есть production/admin scripts, которые могут быть важны позже, но сейчас не должны управлять Constructor3D architecture phase.

Главные проблемы:

1. Нет отдельного `check:constructor3d-guard`.
2. `check:constructor-architecture` по названию выглядит актуальным, но проверяет old/simple `ConstructorPage.tsx`.
3. `qa:all` слишком широк для повседневной агентской работы и смешивает эпохи.
4. Нет явной machine-readable classification: current / historical / legacy / production / admin / release.
5. Stage naming конфликтует с новым roadmap `Stage 01-12` из `master-development-plan-v1.md`.

Рекомендация:

- отдельным QA / Build Agent создать `docs/planning/qa-command-map-v1.md`;
- не менять package scripts в этой задаче;
- после утверждения spec добавить script только отдельным implementation scope.

## 4. Legacy Import Risks

### 4.1 Проверяемая граница

Active scope:

```txt
src/static-pages/Constructor3DPage.tsx
src/static-pages/constructor/**
```

Forbidden legacy scope:

```txt
src/configurator/**
src/configurator/context.tsx
src/configurator/store/**
src/configurator/three/**
src/configurator/model/**
```

### 4.2 Найденное состояние по доступному аудиту

В просмотренных active entry files прямой импорт `src/configurator/**` не обнаружен:

- `src/static-pages/Constructor3DPage.tsx` импортирует только `./constructor/**`, `react`, types и utils active layer;
- `src/static-pages/constructor/hooks/useConstructorPageState.ts` импортирует `../options`, `../../../shared/materials/materialCatalog`, `../adapters/constructorPayload`, `../store/constructorStore`, `../rules/projectRules`, `../store/constructorSelectors`.

Но текущие guards не доказывают отсутствие таких импортов во всём дереве `src/static-pages/constructor/**`, потому что нет dedicated scan rule.

### 4.3 Риск

Даже если сейчас прямой импорт отсутствует, любой следующий агент может случайно добавить:

```ts
import { ... } from "../../configurator/..."
import { ... } from "../../../configurator/..."
import { ... } from "src/configurator/..."
```

и существующие guards могут это не поймать.

### 4.4 Требуемое поведение нового guard

Новый guard должен падать, если любой файл внутри active scope импортирует forbidden legacy scope через:

- static imports;
- dynamic imports;
- require;
- aliased imports, если alias резолвится в `src/configurator/**`;
- barrel indirection, если файл active path импортирует legacy barrel.

## 5. Guard gaps by priority

### P0

1. Нет dedicated Constructor3D guard.
2. Нет запрета imports из `src/configurator/**` в active Constructor3D.
3. `check-constructor-architecture` проверяет wrong page для текущего MVP.
4. Нет current/historical classification для package scripts.
5. Нет build-failing rule на direct pricing/order/API logic внутри `Constructor3DPage.tsx`.

### P1

1. Нет file-size / orchestration threshold для `Constructor3DPage.tsx`.
2. Нет check на чрезмерный рост `useConstructorPageState`.
3. Нет dependency map для active constructor sublayers.
4. Нет explicit allowlist для shared imports.
5. Нет CI-friendly naming для guard suite.

### P2

1. Нет CSS ownership guard для `constructor3d.css` / `constructor.css`.
2. Нет command map для QA scripts.
3. Нет historical scripts migration plan.

## 6. Recommended next actions

### Следующий обязательный шаг

Создать implementation scope для нового script guard на основе:

- `docs/planning/constructor3d-guard-spec-v1.md`;
- `docs/audit/constructor3d-dependency-map-v1.md`;
- `docs/audit/architecture-risk-register-v1.md`.

### Параллельно можно

- QA / Build Agent: подготовить `docs/planning/qa-command-map-v1.md`.
- Legacy Migration Agent: провести inventory `src/configurator/**` и tests ownership map.

### Нельзя параллельно до guard implementation

- Constructor state refactor;
- Three.js architecture refactor;
- pricing changes;
- checkout refactor;
- legacy removal.

## 7. Conclusion

Текущие guards полезны как historical/quarantine checks, но не защищают главный active path. До начала следующих runtime-задач нужно внедрить Constructor3D-specific architecture guard: сначала как спецификацию, затем отдельным scripts-only этапом.