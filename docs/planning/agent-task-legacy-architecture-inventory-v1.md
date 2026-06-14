# Agent Task — Legacy Architecture Inventory v1

Статус: READY.

Роль: Architect Agent.

Подзадача внутри роли:

Legacy Architecture Inventory.

Важно:

Это архитектурная задача. Она не является задачей Constructor Core Agent, QA Agent или Documentation Agent.

## 1. Цель

Провести полный архитектурный учёт legacy-зоны проекта без изменения runtime.

Legacy-зона на текущий момент:

```txt
src/configurator/**
src/static-pages/ConstructorPage.tsx
legacy bridge files
legacy checks/scripts
legacy tests that depend on configurator runtime
```

Основная цель — понять:

- что в legacy ещё используется;
- кем используется;
- что является historical only;
- что является migration candidate;
- что нельзя удалять;
- что может быть безопасно вынесено в backlog на удаление после test migration.

## 2. Перед началом обязательно изучить

- `docs/planning/legacy-migration-master-plan-v1.md`
- `docs/planning/architecture-boundaries-v1.md`
- `docs/audit/architecture-gap-analysis-v1.md`
- `docs/audit/guard-audit-v1.md`
- `docs/audit/constructor3d-dependency-map-v1.md`
- `docs/audit/architecture-risk-register-v1.md`
- `docs/planning/architect-agent-master-roadmap-v1.md`

## 3. Запрещено

Нельзя:

- удалять legacy;
- перемещать файлы;
- менять imports;
- менять runtime код;
- менять tests;
- менять package scripts;
- менять pricing;
- менять checkout;
- менять Three.js;
- менять API;
- менять Supabase;
- менять production;
- менять admin;
- делать cleanup.

## 4. Разрешено

Разрешено:

- читать файлы;
- искать импорты;
- классифицировать ownership;
- создавать docs/audit документы;
- создавать docs/planning follow-up task briefs.

## 5. Область аудита

Обязательно проверить:

```txt
src/configurator/**
src/static-pages/ConstructorPage.tsx
scripts/check-stage19-legacy-cleanup.mjs
scripts/check-stage20-config-bridge.mjs
scripts/check-constructor-architecture.mjs
scripts/check-legacy-runtime-imports.mjs
package.json scripts that reference configurator / legacy / ConstructorPage / config bridge
```

Также проверить tests, которые импортируют:

```txt
src/configurator/**
ConstructorPage
configStore
configReducer
ConfigProvider
useConfigBridge
```

## 6. Классификация файлов

Каждый legacy файл нужно отнести к одной из категорий:

### A — Runtime Legacy

Файл может участвовать в legacy route или runtime path.

### B — Test-backed Legacy

Файл нужен только для существующих тестов или guard checks.

### C — Bridge / Migration Layer

Файл связывает старую и новую архитектуру или нужен для переходного периода.

### D — Historical Only

Файл выглядит как исторический артефакт и не должен развиваться.

### E — Unknown Ownership

Файл нельзя классифицировать без дополнительного анализа.

### F — Candidate for Future Removal

Файл потенциально можно удалить после:

- dependency graph clean;
- test migration;
- QA approval;
- rollback plan.

Важно:

Категория F не означает удалить сейчас.

## 7. Что нужно найти

### 7.1 Legacy entrypoints

Найти все точки входа legacy:

- routes;
- providers;
- exported barrels;
- tests;
- scripts.

### 7.2 Legacy state model

Найти и описать:

- ConfigState;
- ConfigAction;
- configReducer;
- ConfigProvider;
- configStore;
- bridge hooks/actions.

### 7.3 Legacy pricing paths

Найти:

- calculatePrice wrappers;
- shared price imports;
- quick estimate helpers;
- any duplicated formula surface.

Важно:

Не менять формулы.

### 7.4 Legacy validation paths

Найти:

- validate;
- hasErrors;
- step statuses;
- warning/error semantics.

### 7.5 Legacy scene / Three paths

Найти:

- old viewer;
- old geometry;
- model/render helpers;
- tests around them.

### 7.6 Legacy tests

Составить список tests, которые завязаны на legacy.

Для каждого указать:

- что защищает;
- можно ли перенести на active Constructor3D;
- кто должен переносить: Architect / QA / Constructor Core / Three.js.

## 8. Deliverables

Создать документы:

### 8.1 Legacy inventory

```txt
docs/audit/legacy-inventory-v1.md
```

Содержит:

- список legacy областей;
- классификацию файлов;
- ownership status;
- risk notes;
- migration notes.

### 8.2 Legacy dependency map

```txt
docs/audit/legacy-dependency-map-v1.md
```

Содержит:

- кто импортирует legacy;
- какие tests/scripts завязаны;
- какие routes завязаны;
- какие bridge-зоны существуют;
- active-to-legacy risks.

### 8.3 Legacy migration readiness assessment

```txt
docs/audit/legacy-migration-readiness-v1.md
```

Содержит:

- что можно переносить первым;
- что должно ждать QA Agent;
- что должно ждать Constructor Core Agent;
- что должно ждать Three.js Agent;
- что заблокировано pricing/checkout/production.

## 9. Проверки

Так как задача docs-only, runtime checks не обязательны.

Но если агент изменяет только docs, он должен явно написать:

```txt
Runtime checks not run: docs-only task.
```

Если используется GitHub search/fetch без локальной среды, это тоже нужно указать.

## 10. Acceptance criteria

Задача завершена если:

1. Создан `legacy-inventory-v1.md`.
2. Создан `legacy-dependency-map-v1.md`.
3. Создан `legacy-migration-readiness-v1.md`.
4. Не изменён runtime.
5. Не изменены tests.
6. Не изменён package.json.
7. Не удалён legacy.
8. Есть список follow-up задач для других агентов.

## 11. Handoff после завершения

После выполнения контроль возвращается Architect Agent для review.

Architect Agent должен решить:

- достаточно ли legacy inventory;
- можно ли переходить к full dependency graph;
- какие задачи передавать QA Agent;
- какие задачи передавать Constructor Core Agent;
- какие legacy части нельзя трогать до Pricing/Checkout/Three.js фаз.
