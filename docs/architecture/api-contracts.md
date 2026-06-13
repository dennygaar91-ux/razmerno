# API Contracts — «Размерно»

Дата: 2026-06-13
Тип: architecture contract documentation.

## Цель

Документ фиксирует принцип работы с API contracts без изменения API-кода.

## Правило

Любое изменение API должно быть сначала описано как contract change. В рамках текущего архитектурного этапа runtime API не меняется.

## Contract principles

- Request/response shape должен быть стабильным.
- Ошибки должны быть предсказуемыми.
- Клиент не должен зависеть от неописанных полей.
- API не должен раскрывать внутреннюю production-логику без необходимости.
- Персональные данные не должны попадать в технические логи.

## Protected scope

Без отдельного задания нельзя менять:

- `api/**`;
- validation behavior;
- order submission behavior;
- Supabase writes;
- admin endpoints;
- export endpoints.

## Acceptance

Этот документ является архитектурной рамкой. Он не заменяет подробные endpoint-level contracts, которые должны быть добавлены отдельным этапом.
