# Agent Task — Full Architecture Dependency Graph v1

Статус: READY.

Роль: Architect Agent.

Подзадача:

Full Architecture Dependency Graph.

## Цель

Построить полный архитектурный граф зависимостей проекта после завершения:

- Architecture Guard;
- Legacy Inventory.

Задача нужна для того, чтобы до запуска остальных агентов понимать реальные зависимости между слоями системы.

Важно:

Это архитектурный анализ.

Не изменять runtime.

Не выполнять рефакторинг.

Не менять логику.

## Перед началом изучить

- architecture-gap-analysis-v1.md
- architecture-boundaries-v1.md
- architecture-risk-register-v1.md
- legacy-inventory-v1.md
- legacy-dependency-map-v1.md
- legacy-migration-readiness-v1.md
- architect-agent-master-roadmap-v1.md

## Проверяемые области

Обязательно построить карту зависимостей для:

```txt
Constructor3D
Constructor Store
Pricing
Checkout
Production
Admin
API
Supabase
Legacy Configurator
```

## Что нужно определить

Для каждого слоя:

### Ownership

Кто владеет слоем.

### Entrypoints

Точки входа.

### Public Surface

Что считается публичным API слоя.

### Imports In

Кто зависит от слоя.

### Imports Out

От чего зависит слой.

### Risk Level

P0 / P1 / P2 / P3.

### Allowed Changes

Какие агенты могут менять слой.

### Forbidden Changes

Какие агенты не имеют права менять слой.

## Deliverables

Создать:

### 1.

`docs/audit/full-architecture-dependency-graph-v1.md`

Содержит:

- полную карту слоёв;
- ownership;
- import graph;
- risk graph.

### 2.

`docs/audit/architecture-coupling-report-v1.md`

Содержит:

- сильные связи;
- слабые связи;
- опасные связи;
- legacy coupling;
- hidden dependencies.

### 3.

`docs/audit/architecture-blockers-v1.md`

Содержит:

- что блокирует Constructor Core Agent;
- что блокирует Pricing Agent;
- что блокирует Three.js Agent;
- что блокирует Checkout Agent;
- что блокирует Production Agent;
- что блокирует QA Agent.

## Запрещено

- менять код;
- менять tests;
- менять scripts;
- менять package.json;
- менять runtime;
- менять pricing;
- менять checkout;
- менять production;
- менять admin.

## Acceptance Criteria

1. Dependency graph создан.
2. Coupling report создан.
3. Blockers report создан.
4. Все слои классифицированы.
5. Нет изменений runtime.

## Handoff

После завершения результат возвращается Architect Agent.

Architect Agent принимает решение:

- можно ли запускать Constructor Core Agent;
- можно ли запускать Pricing Agent;
- можно ли запускать Three.js Agent;
- какие блокировки остаются.
