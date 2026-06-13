# Architecture — «Размерно»

Дата создания: 2026-06-13
Назначение: единая точка входа в архитектурную документацию проекта.

## Цель раздела

`docs/architecture/` фиксирует устройство проекта, границы ответственности модулей и правила безопасной разработки. Этот раздел нужен, чтобы следующие этапы разработки не превращались в хаотичные правки по всему репозиторию.

## Правило работы

Архитектурные документы описывают текущее и целевое состояние, но сами по себе не меняют runtime-код. Любой рефакторинг, изменение бизнес-логики, UX, Three.js, pricing, order flow, API, Supabase, admin или export logic должен идти отдельным этапом.

## Документы

| Документ | Статус | Назначение |
|---|---|---|
| `project-map.md` | planned | Карта директорий, точек входа и ключевых связей. |
| `runtime-boundaries.md` | planned | Runtime boundaries: frontend, API, pricing, orders, production, admin. |
| `constructor-state-and-layout.md` | planned | Source of truth для constructor state, sections, zones/compartments, filling, facades. |
| `pricing-and-order-boundaries.md` | planned | Границы pricing/order flow, которые нельзя менять без отдельного задания. |
| `css-ownership-map.md` | planned | Ownership CSS-слоёв: global, landing, legacy constructor, constructor3d. |

## Связанные документы

- `docs/audits/infrastructure-audit-001.md`
- `docs/BACKLOG.md`
- `docs/css-architecture-audit.md`
- `docs/css-migration-plan.md`
- `docs/agent/architect-rules.md`

## Protected zones

Без отдельного задания не изменять:

- pricing engine;
- order flow;
- отправку заявок;
- Supabase integration;
- API/backend;
- admin;
- export/production logic;
- Three.js визуал;
- UX/UI сценарии.

## Рекомендуемый порядок наполнения

1. `project-map.md`.
2. `runtime-boundaries.md`.
3. `constructor-state-and-layout.md`.
4. `pricing-and-order-boundaries.md`.
5. `css-ownership-map.md`.
6. После этого — актуализация `docs/BACKLOG.md`.
