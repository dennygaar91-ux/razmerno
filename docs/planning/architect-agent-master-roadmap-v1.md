# Architect Agent Master Roadmap v1

Статус: ACTIVE.

Дата: 2026-06-14.

Роль: Architect Agent.

## Назначение

Документ фиксирует полный объём работ Architect Agent до момента передачи проекта другим основным агентам.

Важно:

Architect Agent не занимается:

- реализацией Constructor Core;
- реализацией Three.js;
- реализацией Pricing;
- реализацией Checkout;
- реализацией Production;
- реализацией QA;
- реализацией Documentation.

Architect Agent отвечает только за архитектурную подготовку проекта.

## Уже выполнено

### Phase A — Architecture Discovery

Завершено.

Документы:

- architecture-gap-analysis-v1
- architecture-boundaries-v1
- legacy-migration-master-plan-v1
- agent-responsibility-matrix-v1
- final-lead-architect-handoff-v1

Статус:

DONE.

---

### Phase B — Architecture Guard Planning

Завершено.

Документы:

- agent-task-architecture-guard-v1
- agent-task-constructor3d-guard-implementation-v1

Статус:

DONE.

---

### Phase C — Architecture Guard Review

Текущее состояние:

Architecture Guard docs phase выполнена и принята.

Статус:

DONE.

## Оставшиеся задачи Architect Agent

### Phase D — Legacy Architecture Inventory Review

Цель:

Понять фактическое состояние legacy-слоя.

Ожидаемый результат:

- legacy inventory;
- ownership map;
- dependency ownership;
- migration readiness assessment.

Артефакты:

- legacy-inventory-v1.md
- legacy-dependency-map-v1.md

Исполнитель:

Architect Agent.

Приоритет:

P0.

---

### Phase E — Architecture Dependency Graph

Цель:

Построить полный граф архитектурных зависимостей проекта.

Области:

- Constructor3D;
- pricing;
- checkout;
- production;
- admin;
- API;
- Supabase.

Результат:

единая dependency model.

Приоритет:

P0.

---

### Phase F — Architecture Critical Path Review

Цель:

Проверить соответствие текущего roadmap фактическому состоянию репозитория.

Результат:

- updated critical path;
- blockers;
- parallelizable work.

Приоритет:

P1.

---

### Phase G — Agent Handoff Packages

Цель:

Подготовить архитектурные пакеты для:

- Constructor Core Agent;
- Three.js Agent;
- Pricing Agent;
- Checkout Agent;
- Production Agent;
- QA Agent;
- Documentation Agent.

Важно:

Architect Agent готовит handoff.

Architect Agent не выполняет задачи этих ролей.

Приоритет:

P1.

---

### Phase H — Architecture Closure Review

Финальный этап Architect Agent.

Цель:

Убедиться что:

- границы защищены;
- legacy учтён;
- dependency graph построен;
- критический путь подтверждён;
- handoff подготовлен.

После этого роль Architect Agent считается завершённой.

## Стоп-факторы

Architect Agent обязан остановиться если задача требует:

- изменение runtime;
- изменение state логики;
- изменение pricing;
- изменение checkout;
- изменение Three.js;
- изменение production;
- изменение admin;
- изменение API;
- изменение Supabase.

Такие задачи должны передаваться соответствующим агентам.

## Порядок дальнейшей работы

1. Constructor3D Guard Implementation Review.
2. Legacy Architecture Inventory.
3. Legacy Dependency Map.
4. Full Dependency Graph.
5. Critical Path Review.
6. Agent Handoff Packages.
7. Architecture Closure Review.

После этого Architect Agent завершает работу.
