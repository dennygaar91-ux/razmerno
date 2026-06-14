# Agent Handoff Packages v1 — Размерно

Статус: READY.

Дата: 2026-06-14.

Роль автора: Architect Agent.

## 0. Назначение

Документ готовит handoff-пакеты для пяти основных ролей, которые будут запускаться отдельными ветками.

Важно:

Architect Agent не выполняет задачи этих ролей.

Architect Agent только фиксирует:

- входной контекст;
- границы ответственности;
- запреты;
- ожидаемые deliverables;
- критерии готовности;
- зависимости от архитектурных guard/inventory этапов.

## 1. Общие правила для всех ролей

Перед началом любой роли обязательно читать:

- `docs/planning/architecture-boundaries-v1.md`
- `docs/planning/agent-responsibility-matrix-v1.md`
- `docs/audit/architecture-gap-analysis-v1.md`
- `docs/audit/architecture-risk-register-v1.md`
- `docs/planning/parallelization-rules.md`

Любой агент обязан остановиться, если задача требует изменения чужого слоя.

## 2. Constructor Core Agent Handoff

### Роль

Constructor Core Agent отвечает за:

- active constructor state;
- sections / zones / compartments;
- filling system;
- facade logic;
- materials UI state;
- constructor validation;
- store/domain selectors;
- reducing God Facade risk.

### Перед началом обязательно дождаться

- `check:constructor3d-guard` implemented and passing;
- legacy inventory reviewed by Architect Agent;
- full architecture dependency graph reviewed.

### Область работы

Разрешённые зоны:

```txt
src/static-pages/constructor/store/**
src/static-pages/constructor/hooks/**
src/static-pages/constructor/rules/**
src/static-pages/constructor/types.ts
src/static-pages/constructor/options.ts
src/static-pages/constructor/components/** only for constructor logic UI
```

### Запрещено

- менять pricing formula;
- менять checkout submit contract;
- менять Three.js runtime architecture;
- менять API;
- менять Supabase;
- менять production model;
- менять admin;
- импортировать `src/configurator/**`;
- удалять legacy.

### Первые задачи

1. Провести state source-of-truth audit.
2. Разделить `useConstructorPageState` на focused hook plan.
3. Подготовить domain selector map.
4. Проверить validation ownership.
5. Подготовить safe decomposition plan без behavior change.

### Deliverables

- `docs/audit/constructor-core-state-audit-v1.md`
- `docs/planning/constructor-core-decomposition-plan-v1.md`
- runtime changes только после отдельного implementation scope.

## 3. Three.js Agent Handoff

### Роль

Three.js Agent отвечает за:

- active 3D scene;
- WebGL stability;
- 2D/WebGL fallback;
- scene adapter;
- rendering safety;
- camera modes;
- runtime failure handling;
- performance safety.

### Перед началом обязательно дождаться

- Constructor3D guard implemented;
- active-to-legacy import ban passing;
- Architect Agent confirmation that Three.js work is not blocked by state refactor.

### Область работы

Разрешённые зоны:

```txt
src/static-pages/constructor/three/**
src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx
src/static-pages/constructor/components/SceneRuntimePanels.tsx
scene-specific tests
```

### Запрещено

- менять pricing;
- менять checkout/order submit;
- менять Supabase/API;
- менять production model;
- делать visual redesign одновременно со stability work;
- импортировать `src/configurator/three/**`;
- менять store structure без Constructor Core scope.

### Первые задачи

1. WebGL/fallback reliability audit.
2. Three scene adapter responsibility audit.
3. Render error boundary review.
4. Scene performance risk list.
5. 2D fallback contract check.

### Deliverables

- `docs/audit/threejs-stability-audit-v1.md`
- `docs/planning/threejs-stability-plan-v1.md`
- implementation only after approval.

## 4. Pricing Agent Handoff

### Роль

Pricing Agent отвечает за:

- pricing source-of-truth;
- client/server quote consistency;
- material/edge/packaging/delivery/assembly price logic;
- dealer price coefficient rules;
- pricing tests.

### Перед началом обязательно дождаться

- Constructor3D guard implemented;
- legacy pricing paths inventoried;
- Architect Agent confirms pricing boundary.

### Область работы

Разрешённые зоны:

```txt
src/pricing/**
src/shared/lib/pricing-core.ts
pricing-related adapters
pricing tests
api pricing validation paths only with explicit scope
```

### Запрещено

- менять UI redesign;
- менять Three.js;
- менять checkout flow except price contract;
- менять production cost logic параллельно без production/pricing alignment;
- использовать legacy `src/configurator/context.tsx` as source of truth.

### Первые задачи

1. Найти все pricing helpers.
2. Классифицировать source-of-truth / legacy / preview / formatting.
3. Проверить quote consistency.
4. Проверить delivery/assembly logic.
5. Подготовить test matrix.

### Deliverables

- `docs/audit/pricing-source-of-truth-audit-v1.md`
- `docs/planning/pricing-stabilization-plan-v1.md`
- pricing implementation only after explicit scope.

## 5. Checkout Agent Handoff

### Роль

Checkout Agent отвечает за:

- checkout inside Constructor3D;
- customer fields;
- phone/email/name/consent validation;
- delivery toggle + address;
- assembly toggle;
- quote summary;
- submit states/cooldown;
- success without model reset.

### Перед началом обязательно дождаться

- Constructor Core state boundary baseline;
- Pricing source-of-truth confirmed;
- Constructor3D guard passing.

### Область работы

Разрешённые зоны:

```txt
src/static-pages/constructor/hooks/useConstructorSubmit.ts
checkout-related constructor components
order payload adapters
checkout tests
api/orders.ts only with explicit API scope
```

### Запрещено

- менять pricing formula;
- менять Supabase schema/RLS;
- менять production model;
- bypass server validation;
- хранить PII в localStorage;
- сбрасывать модель после success.

### Первые задачи

1. Checkout contract audit.
2. Required fields audit.
3. Submit/cooldown behavior audit.
4. PII storage/logging audit.
5. Error/success state map.

### Deliverables

- `docs/audit/checkout-contract-audit-v1.md`
- `docs/planning/checkout-hardening-plan-v1.md`
- implementation only after state/pricing readiness.

## 6. Production Agent Handoff

### Роль

Production Agent отвечает за:

- production model;
- panels;
- hardware;
- drilling basics;
- production warnings;
- technologist review data;
- Basis JSON planning;
- admin-facing production details.

### Перед началом обязательно дождаться

- Constructor Core state model stable enough;
- Pricing boundaries clear;
- no active Constructor3D dependency on legacy production modules.

### Область работы

Разрешённые зоны:

```txt
src/constructor/production/**
src/constructor/geometry/**
production tests
manufacturing tests
Basis/export planning docs
```

### Запрещено

- показывать сложную production logic клиенту;
- менять checkout/order flow;
- менять pricing cost formula параллельно без Pricing Agent alignment;
- делать automatic .b3d generation в MVP;
- менять admin UX без admin scope.

### Первые задачи

1. Production model audit.
2. Hardware/drilling ownership map.
3. Production warnings classification.
4. Client-visible vs admin-only warnings separation.
5. Basis JSON readiness review.

### Deliverables

- `docs/audit/production-model-audit-v1.md`
- `docs/planning/production-mvp-hardening-plan-v1.md`
- implementation only after constructor/pricing boundaries.

## 7. Cross-role sequencing

Recommended safe order:

1. Architect Agent: Constructor3D guard implementation review.
2. Architect Agent: legacy inventory review.
3. Architect Agent: full dependency graph.
4. Constructor Core Agent: state/source-of-truth audit.
5. Pricing Agent: pricing source-of-truth audit.
6. Three.js Agent: stability/fallback audit.
7. Checkout Agent: checkout contract audit.
8. Production Agent: production model audit.

## 8. What can run in parallel

Can run in parallel after guard passes:

- Constructor Core audit;
- Pricing audit;
- Three.js stability audit;
- Production audit docs-only.

Should not run in parallel:

- Constructor Core implementation + Checkout implementation;
- Pricing formula changes + Production cost changes;
- Three.js refactor + Constructor state refactor;
- Legacy removal + test migration.

## 9. Final note

This document is a handoff map, not an execution result.

Each role must produce its own audit/plan first before implementation.
