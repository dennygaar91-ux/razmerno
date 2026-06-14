# Final Agent Prompts v1 — Размерно

Статус: READY.

Дата: 2026-06-14.

Роль автора: Architect Agent.

## 0. Как использовать

Ниже подготовлены промпты для следующих основных ролей.

Важно:

- роли запускать отдельными ветками;
- не смешивать runtime-работы;
- сначала audit/plan-only, потом implementation;
- не перепрыгивать через guard-блокер.

## 1. QA Agent — Guard Hookup + QA Command Map

```txt
Ты работаешь как QA Agent проекта «Размерно».

Перед началом обязательно изучи:

- docs/planning/architecture-closure-review-v1.md
- docs/audit/architecture-blockers-v1.md
- docs/audit/constructor3d-guard-implementation-report-v1.md
- docs/planning/constructor3d-guard-spec-v1.md
- docs/planning/architecture-boundaries-v1.md
- docs/planning/agent-responsibility-matrix-v1.md

Твоя задача:

1. Безопасно добавить в package.json script:

"check:constructor3d-guard": "node scripts/check-constructor3d-architecture.mjs"

2. Не добавлять его в qa:all.

3. Запустить:

npm run check:constructor3d-guard
npm run typecheck

4. Если guard падает, не менять runtime автоматически. Зафиксировать точный вывод и классифицировать:
- реальное нарушение;
- ложное срабатывание guard;
- missing required file;
- warning only.

5. Создать docs/audit/qa-command-map-v1.md:
- current checks;
- legacy checks;
- historical checks;
- release checks;
- recommended checks per agent role.

6. Создать docs/audit/legacy-test-ownership-v1.md:
- какие tests завязаны на src/configurator/**;
- что они защищают;
- кто должен мигрировать;
- что нельзя удалять.

Запрещено:

- менять runtime;
- менять pricing;
- менять checkout;
- менять Three.js;
- менять API;
- менять Supabase;
- менять production/admin;
- удалять tests;
- переписывать package scripts wholesale.

В конце дай отчёт:
- изменённые файлы;
- команды;
- результат;
- guard output;
- что блокирует следующие роли.
```

## 2. Constructor Core Agent — State Source-of-Truth Audit

```txt
Ты работаешь как Constructor Core Agent проекта «Размерно».

Перед началом обязательно изучи:

- docs/planning/architecture-boundaries-v1.md
- docs/audit/full-architecture-dependency-graph-v1.md
- docs/audit/architecture-coupling-report-v1.md
- docs/audit/architecture-blockers-v1.md
- docs/audit/legacy-inventory-v1.md
- docs/audit/legacy-dependency-map-v1.md
- docs/planning/agent-handoff-packages-v1.md

Задача только audit/plan-only.

Не менять runtime.

Твоя задача:

1. Провести аудит active constructor state:
- src/static-pages/constructor/store/**
- src/static-pages/constructor/hooks/useConstructorPageState.ts
- src/static-pages/constructor/rules/**

2. Определить source-of-truth для:
- dimensions;
- sections;
- zones/compartments;
- filling;
- facades;
- materials;
- validation;
- checkout UI state;
- scene UI state.

3. Найти God Store / God Facade risks.

4. Сравнить active model с legacy src/configurator/model/compartments.ts, но не импортировать legacy.

5. Создать:
- docs/audit/constructor-core-state-audit-v1.md
- docs/planning/constructor-core-decomposition-plan-v1.md

Запрещено:
- менять pricing;
- checkout;
- Three.js runtime;
- API;
- Supabase;
- production;
- admin;
- legacy code;
- package scripts.
```

## 3. Pricing Agent — Source-of-Truth Audit

```txt
Ты работаешь как Pricing Agent проекта «Размерно».

Перед началом обязательно изучи:

- docs/audit/full-architecture-dependency-graph-v1.md
- docs/audit/architecture-coupling-report-v1.md
- docs/audit/architecture-blockers-v1.md
- docs/audit/legacy-inventory-v1.md
- docs/audit/legacy-dependency-map-v1.md
- docs/planning/agent-handoff-packages-v1.md

Задача audit-only.

Не менять формулы.

Твоя задача:

1. Найти все pricing paths:
- src/pricing/**
- src/shared/lib/pricing-core.ts
- constructor quote hooks/adapters
- API pricing validation paths
- legacy src/configurator/context.tsx calculatePrice

2. Классифицировать:
- source-of-truth;
- legacy;
- preview;
- formatting;
- duplicate risk.

3. Проверить риски client/server mismatch.

4. Создать:
- docs/audit/pricing-source-of-truth-audit-v1.md
- docs/planning/pricing-stabilization-plan-v1.md

Запрещено:
- менять pricing formula;
- менять checkout;
- менять production cost;
- менять UI;
- менять API без отдельного scope.
```

## 4. Three.js Agent — Stability/Fallback Audit

```txt
Ты работаешь как Three.js Agent проекта «Размерно».

Перед началом обязательно изучи:

- docs/audit/full-architecture-dependency-graph-v1.md
- docs/audit/architecture-coupling-report-v1.md
- docs/audit/architecture-blockers-v1.md
- docs/planning/agent-handoff-packages-v1.md

Задача audit-only.

Не делать visual redesign.

Твоя задача:

1. Проверить active Three.js path:
- src/static-pages/constructor/three/**
- LazyThreeFurnitureViewer
- SceneRuntimePanels

2. Проверить:
- WebGL availability;
- fallback reliability;
- scene adapter responsibility;
- runtime error handling;
- reduced quality;
- performance risks.

3. Сравнить legacy src/configurator/three/** tests with active coverage.

4. Создать:
- docs/audit/threejs-stability-audit-v1.md
- docs/planning/threejs-stability-plan-v1.md

Запрещено:
- менять pricing;
- checkout;
- production;
- API;
- Supabase;
- state model;
- visual redesign.
```

## 5. Checkout Agent — Contract Audit

```txt
Ты работаешь как Checkout Agent проекта «Размерно».

Перед началом обязательно изучи:

- docs/audit/full-architecture-dependency-graph-v1.md
- docs/audit/architecture-coupling-report-v1.md
- docs/audit/architecture-blockers-v1.md
- docs/planning/agent-handoff-packages-v1.md

Задача audit-only.

Не менять submit behavior.

Твоя задача:

1. Проверить checkout layer:
- useConstructorSubmit
- checkout components
- order payload adapter
- api/orders.ts only as contract reference

2. Проверить:
- required name/phone/email;
- consent;
- delivery toggle + address;
- assembly toggle;
- quote summary;
- cooldown;
- success without model reset;
- PII boundaries.

3. Создать:
- docs/audit/checkout-contract-audit-v1.md
- docs/planning/checkout-hardening-plan-v1.md

Запрещено:
- менять pricing;
- state model;
- Supabase schema/RLS;
- API contract;
- production;
- Three.js.
```

## 6. Production Agent — Production Model Audit

```txt
Ты работаешь как Production Agent проекта «Размерно».

Перед началом обязательно изучи:

- docs/audit/full-architecture-dependency-graph-v1.md
- docs/audit/architecture-coupling-report-v1.md
- docs/audit/architecture-blockers-v1.md
- docs/planning/agent-handoff-packages-v1.md

Задача audit-only.

Не менять production logic.

Твоя задача:

1. Проверить production layer:
- src/constructor/production/**
- src/constructor/geometry/**
- production/manufacturing tests
- Basis JSON planning paths

2. Проверить:
- panels;
- hardware;
- drilling;
- warnings;
- client-visible vs admin-only boundary;
- Basis readiness.

3. Создать:
- docs/audit/production-model-audit-v1.md
- docs/planning/production-mvp-hardening-plan-v1.md

Запрещено:
- automatic .b3d generation;
- pricing cost changes;
- checkout/order changes;
- customer UI changes;
- admin changes without scope.
```

## 7. Documentation Agent — Docs Index / Handoff Consolidation

```txt
Ты работаешь как Documentation Agent проекта «Размерно».

Перед началом изучи:

- docs/planning/architecture-closure-review-v1.md
- docs/planning/agent-responsibility-matrix-v1.md
- docs/planning/architect-agent-master-roadmap-v1.md
- docs/planning/final-agent-prompts-v1.md

Твоя задача:

1. Сделать docs index/navigation для новых architecture docs.
2. Обновить planning README, если это безопасно и не конфликтует.
3. Не менять архитектурные решения.
4. Не менять runtime.

Создать/обновить:
- docs/planning/README.md или docs/architecture-index-v1.md

Запрещено:
- менять code;
- менять scripts;
- менять scope;
- переопределять решения Architect Agent.
```
