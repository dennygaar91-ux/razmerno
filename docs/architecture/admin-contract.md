# Admin Contract — «Размерно»

Дата: 2026-06-13
Тип: architecture contract documentation.

## Цель

Документ фиксирует рамку admin area без изменения admin panel.

## Принципы

- Админка является внутренним инструментом управления заявками и production status.
- Клиентский интерфейс не должен зависеть от внутренних admin-полей.
- Изменения admin routes, access и статусов требуют отдельного задания.
- Документационный этап не меняет runtime-поведение админки.

## Protected scope

Без отдельного задания нельзя менять:

- admin routes;
- admin access;
- admin order views;
- status mutation;
- production detail editing;
- internal moderation flows.

## Acceptance

Этот документ является high-level рамкой. Подробный admin contract должен быть подготовлен отдельным этапом после стабилизации CI.
