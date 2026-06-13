# Testing Strategy — «Размерно»

Дата: 2026-06-13
Тип: QA / architecture documentation.

## Цель

Документ фиксирует стратегию проверок проекта до начала новой разработки конструктора. Главная цель — не допускать регрессов в расчете, заявках, API, backend, админке и производственной логике.

## Уровни проверок

### 1. Install check

CI должен стабильно проходить `npm ci`. Если установка зависимостей падает, все последующие проверки считаются недостоверными.

### 2. Static checks

Проверяют структуру проекта, guard rules, отсутствие запрещенных legacy-импортов и архитектурные ограничения.

### 3. Typecheck

Обязательные команды:

- `npm run typecheck`
- `npm run typecheck:api`

### 4. Build

Обязательная команда:

- `npm run build`

### 5. Domain tests

Проверяют важные предметные области:

- pricing;
- delivery;
- layout;
- compartments;
- geometry;
- material visuals;
- selected compartment state.

### 6. Manual QA

Нужна отдельная ручная матрица для:

- лендинга;
- конструктора;
- checkout;
- fallback-сценариев;
- админки;
- production export.

## Правило для protected zones

Если задача затрагивает protected zone, нужен отдельный QA-блок именно по этой зоне. Документационные изменения не должны запускать runtime-регрессию, но должны быть проверены на наличие в GitHub.

## Минимальный CI перед разработкой

Перед новой разработкой CI должен пройти минимум:

1. `npm ci`
2. infrastructure inventory check
3. `npm run typecheck`
4. `npm run typecheck:api`
5. `npm run build`
6. CSS architecture check
7. production geometry architecture check

## Правило отчетности QA

В отчете нужно писать только фактически выполненные проверки. Если проверка не запускалась или упала раньше, это нужно указать отдельно.
