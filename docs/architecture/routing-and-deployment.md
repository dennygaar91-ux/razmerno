# Routing and Deployment — «Размерно»

Дата: 2026-06-13
Тип: architecture documentation.

## Цель

Зафиксировать базовые принципы routing и deployment без изменения кода приложения.

## Routing principles

- Нормальные URL предпочтительнее hash routing.
- Публичные страницы и constructor routes должны быть явно описаны.
- Route changes не должны ломать заявки, checkout и backend contracts.
- Любое изменение routing должно иметь QA-сценарий.

## Deployment principles

- Основная платформа: Vercel.
- Backend слой: Vercel Functions.
- CI должен проходить до production deploy.
- Environment variables должны быть проверены до релиза.

## Protected boundaries

Без отдельного задания нельзя менять:

- API routes;
- order submission;
- Supabase integration;
- admin routes;
- export routes;
- checkout behavior.

## QA before deployment

Минимум:

1. install dependencies;
2. typecheck;
3. API typecheck;
4. build;
5. smoke check ключевых страниц;
6. проверка, что protected zones не изменены случайно.
