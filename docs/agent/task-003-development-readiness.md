# Task 003 — Development Readiness

Дата: 2026-06-13
Роль: agent / architecture / infrastructure.

## Цель

Подготовить проект «Размерно» к следующей фазе разработки без изменения защищенных runtime-зон.

## Scope

Разрешено:

- проверять архитектурную документацию;
- проверять backlog;
- проверять CI workflow;
- проверять QA matrices;
- фиксировать отсутствующие документы;
- готовить read-only audit scripts.

Запрещено:

- менять pricing;
- менять order flow;
- менять checkout;
- менять API;
- менять backend;
- менять Supabase;
- менять admin;
- менять export;
- делать редизайн;
- добавлять новые функции.

## Checklist

| ID | Проверка | Статус |
|---|---|---|
| R01 | `BACKLOG-v3.md` существует | todo |
| R02 | protected zones зафиксированы | todo |
| R03 | constructor architecture зафиксирована | todo |
| R04 | testing strategy зафиксирована | todo |
| R05 | ADR-001 существует | todo |
| R06 | ADR-002 существует | todo |
| R07 | ADR-003 существует | todo |
| R08 | manual QA matrix существует | todo |
| R09 | price QA matrix существует | todo |
| R10 | CI blocker описан | todo |

## Output format

Финальный отчет должен разделять:

1. Планировалось.
2. Реально найдено в GitHub.
3. Реально изменено в GitHub.
4. Подготовлено, но не закоммичено.
5. Не выполнено.
6. Риски.
7. Следующий этап.
