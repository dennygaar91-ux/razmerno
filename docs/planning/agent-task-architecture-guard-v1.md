# Agent Task — Architecture Guard v1

Тип задачи: Architecture / QA / Docs / Safety.

Приоритет: P0.

Статус: Ready.

## Цель

После аудита выявлено, что основной риск проекта сейчас связан не с отсутствием функционала, а с отсутствием жёстких защитных границ между:

- активным Constructor3D;
- legacy runtime;
- pricing;
- checkout;
- production layer.

Задача агента — создать архитектурные защитные механизмы, которые будут предотвращать ошибочные изменения в будущем.

Важно:

Не делать новый функционал.

Не менять UI.

Не менять бизнес-логику.

Не менять pricing.

Не менять checkout.

Не менять Three.js.

Не менять API.

Не менять Supabase.

## Перед началом обязательно изучить

- docs/planning/architecture-boundaries-v1.md
- docs/audit/architecture-gap-analysis-v1.md
- docs/planning/master-development-plan-v1.md
- docs/planning/parallelization-rules.md
- docs/agent/architect-rules.md

## Основная задача

Провести аудит существующих quality guards и создать карту архитектурных ограничений для runtime.

Не изменять runtime-поведение.

## Этап 1. Audit Existing Guards

Проверить:

- scripts/check-legacy-runtime-imports.mjs
- scripts/check-constructor-architecture.mjs
- scripts/check-stage19-legacy-cleanup.mjs
- scripts/check-stage20-config-bridge.mjs
- package.json scripts

Для каждого guard определить:

- что реально проверяет;
- что не проверяет;
- относится ли к active Constructor3D;
- относится ли к legacy;
- устарел ли guard.

Результат:

Создать документ:

docs/audit/guard-audit-v1.md

## Этап 2. Active Constructor3D Boundary Map

Найти:

- все точки входа Constructor3D;
- все hooks;
- все stores;
- все adapters;
- все three modules;
- все pricing integrations;
- все checkout integrations.

Построить карту зависимостей.

Результат:

Создать:

docs/audit/constructor3d-dependency-map-v1.md

## Этап 3. Legacy Import Risk Analysis

Проверить:

может ли любой файл внутри

src/static-pages/constructor/**

импортировать:

src/configurator/**

Если да:

зафиксировать каждый случай.

Результат:

Добавить раздел в audit документ.

## Этап 4. Guard Specification

Не писать новый guard.

Сначала подготовить спецификацию.

Создать:

docs/planning/constructor3d-guard-spec-v1.md

В документе описать:

- какие импорты запрещены;
- какие импорты разрешены;
- какие размеры файлов контролировать;
- какие page-компоненты считаются orchestration-only;
- какие директории считаются active;
- какие директории считаются legacy;
- какие нарушения должны падать build.

## Этап 5. Risk Register

Создать:

docs/audit/architecture-risk-register-v1.md

Для каждого риска указать:

- риск;
- вероятность;
- влияние;
- слой;
- mitigation.

## Запрещено

Нельзя:

- удалять legacy код;
- менять Constructor3DPage;
- менять stores;
- менять pricing;
- менять checkout;
- менять production;
- менять Supabase;
- менять admin;
- делать рефакторинг.

## Deliverables

После завершения должны появиться только документы:

- docs/audit/guard-audit-v1.md
- docs/audit/constructor3d-dependency-map-v1.md
- docs/planning/constructor3d-guard-spec-v1.md
- docs/audit/architecture-risk-register-v1.md

## Definition of Done

Задача считается завершённой если:

1. Выполнен аудит всех текущих guards.
2. Построена карта зависимостей Constructor3D.
3. Найдены все потенциальные legacy import risks.
4. Подготовлена спецификация нового guard.
5. Создан architecture risk register.
6. Не изменён runtime код проекта.
7. Не изменён UI.
8. Не изменён pricing.
9. Не изменён checkout.
10. Не изменён production layer.
