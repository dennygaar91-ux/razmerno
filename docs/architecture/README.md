# Architecture — «Размерно»

Дата создания: 2026-06-13
Дата обновления: 2026-06-13
Назначение: единая точка входа в архитектурную документацию проекта.

## Цель раздела

`docs/architecture/` фиксирует устройство проекта, границы ответственности модулей и правила безопасной разработки. Этот раздел нужен, чтобы следующие этапы разработки не превращались в хаотичные правки по всему репозиторию.

## Правило работы

Архитектурные документы описывают текущее и целевое состояние, но сами по себе не меняют runtime-код. Любой рефакторинг, изменение бизнес-логики, UX, Three.js, pricing, order flow, API, Supabase, admin или export logic должен идти отдельным этапом.

## Документы

| Документ | Статус | Назначение |
|---|---|---|
| `project-map.md` | active | Карта директорий, точек входа и ключевых связей. |
| `runtime-boundaries.md` | active | Runtime boundaries: frontend, API, pricing, orders, production, admin. |
| `constructor-state-and-layout.md` | active | Source of truth для constructor state, sections, zones/compartments, filling, facades. |
| `pricing-and-order-boundaries.md` | active | Границы pricing/order flow, которые нельзя менять без отдельного задания. |
| `css-ownership-map.md` | active | Ownership CSS-слоёв: global, landing, legacy constructor, constructor3d. |
| `ci-and-audit-pipeline.md` | active | GitHub Actions QA pipeline, infrastructure inventory, artifacts и правила обработки падений. |

## Связанные документы

- `docs/audits/infrastructure-audit-001.md`
- `docs/audits/README.md`
- `docs/audits/backlog-normalization-plan-001.md`
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

## Рекомендуемый порядок работы для следующих этапов

1. Проверить `ci-and-audit-pipeline.md` и убедиться, что QA workflow реально запускается.
2. Перед изменениями читать `project-map.md` и `runtime-boundaries.md`.
3. Для конструктора читать `constructor-state-and-layout.md`.
4. Для цены/заявок читать `pricing-and-order-boundaries.md`.
5. Для CSS читать `css-ownership-map.md`.
6. После каждого этапа актуализировать `docs/BACKLOG.md`, если появились новые задачи или изменился статус старых.
