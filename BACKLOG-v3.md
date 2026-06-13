# BACKLOG v3 — «Размерно»

Дата: 2026-06-13
Статус: архитектурная подготовка проекта.

## Правила статусов

- `todo` — задача не начата.
- `in_progress` — работа начата, но не завершена в GitHub.
- `done` — результат закоммичен в GitHub и может быть проверен.
- `blocked` — задача заблокирована внешней причиной.

## Protected scope

До отдельного задания запрещено менять:

- pricing engine;
- order flow;
- checkout logic;
- отправку заявок;
- Supabase;
- API;
- backend;
- admin panel;
- export logic;
- UX/UI redesign;
- Three.js redesign;
- новые функции.

## Architecture block

| ID | Задача | Статус | Критерий завершения |
|---|---|---|---|
| A01 | Провести первичный infrastructure audit | done | `docs/audits/infrastructure-audit-001.md` существует в GitHub |
| A02 | Зафиксировать runtime boundaries | done | `docs/architecture/runtime-boundaries.md` существует в GitHub |
| A03 | Зафиксировать protected zones | in_progress | `docs/architecture/protected-zones.md` и `ADR-003` существуют в GitHub |
| A04 | Описать constructor architecture | in_progress | `docs/architecture/constructor-architecture.md` существует в GitHub |
| A05 | Зафиксировать testing strategy | in_progress | `docs/architecture/testing-strategy.md` и QA matrix существуют в GitHub |
| A06 | Зафиксировать CI/audit pipeline | in_progress | workflow, CI doc и ADR по CI согласованы |
| A07 | Зафиксировать contracts для API/order/pricing/export/admin | todo | contract-docs существуют в GitHub без изменения runtime-кода |
| A08 | Подготовить development readiness task | todo | `docs/agent/task-003-development-readiness.md` существует в GitHub |

## CI block

| ID | Задача | Статус | Комментарий |
|---|---|---|---|
| CI01 | Проверить `.github/workflows/qa.yml` | done | workflow существует, `npm ci` падает до audit/typecheck/build |
| CI02 | Стабилизировать Node/npm для CI | todo | вероятный первый шаг — Node 20 вместо Node 22 |
| CI03 | Проверить lockfile после успешного install | todo | выполнять только после стабилизации `npm ci` |

## Documentation block

| ID | Документ | Статус |
|---|---|---|
| D01 | `docs/architecture/project-map.md` | done |
| D02 | `docs/architecture/runtime-boundaries.md` | done |
| D03 | `docs/architecture/constructor-state-and-layout.md` | done |
| D04 | `docs/architecture/ci-and-audit-pipeline.md` | done |
| D05 | `docs/architecture/protected-zones.md` | in_progress |
| D06 | `docs/architecture/constructor-architecture.md` | in_progress |
| D07 | `docs/architecture/testing-strategy.md` | in_progress |
| D08 | `docs/decisions/ADR-001-architecture-docs.md` | in_progress |
| D09 | `docs/decisions/ADR-002-ci-pipeline.md` | in_progress |
| D10 | `docs/decisions/ADR-003-protected-zones.md` | in_progress |

## Reporting rule

Каждый отчет должен разделять:

1. Планировалось.
2. Реально найдено в GitHub.
3. Реально изменено в GitHub.
4. Подготовлено, но не закоммичено.
5. Не выполнено.
6. Риски.
7. Следующий этап.
