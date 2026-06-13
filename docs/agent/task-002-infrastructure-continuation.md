# Task 002 — Infrastructure Continuation

Дата: 2026-06-13
Роль: главный архитектор и технический аудитор проекта «Размерно».

## Цель

Продолжить инфраструктурную подготовку проекта через GitHub без изменения runtime-кода.

## Уже сделано

Созданы и обновлены документы:

- `docs/audits/infrastructure-audit-001.md`
- `docs/audits/README.md`
- `docs/audits/backlog-normalization-plan-001.md`
- `docs/architecture/README.md`
- `docs/architecture/project-map.md`
- `docs/architecture/runtime-boundaries.md`
- `docs/architecture/constructor-state-and-layout.md`
- `docs/architecture/pricing-and-order-boundaries.md`
- `docs/architecture/css-ownership-map.md`
- `docs/architecture/ci-and-audit-pipeline.md`
- `docs/BACKLOG.md`

Добавлена инфраструктура:

- `.github/workflows/qa.yml`
- `scripts/infrastructure-audit-report.mjs`

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
- UX/UI сценарии;
- legacy deletion;
- CSS purge;
- массовые рефакторинги.

## Текущий риск

GitHub Actions workflow настроен, но его успешный запуск пока не подтверждён. Нельзя писать, что `typecheck`, `typecheck:api` или `build` прошли, пока нет реального CI run или локального лога.

## Разрешено в рамках Task 002

- создавать и обновлять документацию;
- создавать audit reports;
- обновлять architecture index;
- обновлять backlog после сверки;
- добавлять неинвазивные CI/docs checks;
- документировать правила работы.

## Запрещено в рамках Task 002

- менять runtime-код;
- менять UI/UX;
- менять Three.js;
- менять pricing/order/API/admin/Supabase/export;
- удалять legacy;
- делать CSS purge;
- менять `package.json` без крайней необходимости.

## Следующие безопасные шаги

1. Проверить видимость GitHub Actions runs.
2. Создать `docs/architecture/generated-reports-policy.md`.
3. Спроектировать decision log / ADR.
4. Спроектировать dependency graph report.
5. Создать `docs/architecture/routing-and-deployment.md`.

## Перед началом следующего этапа прочитать

- `docs/architecture/README.md`
- `docs/architecture/project-map.md`
- `docs/architecture/runtime-boundaries.md`
- `docs/architecture/ci-and-audit-pipeline.md`
- `docs/BACKLOG.md`
- этот документ

Если задача касается конструктора:

- `docs/architecture/constructor-state-and-layout.md`

Если задача касается цены или заявки:

- `docs/architecture/pricing-and-order-boundaries.md`

Если задача касается CSS:

- `docs/architecture/css-ownership-map.md`

## Обязательный отчёт после каждого этапа

- что планировалось;
- что сделано;
- что не сделано;
- почему не сделано;
- риски;
- backlog.
