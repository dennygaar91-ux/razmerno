# CSS Migration Roadmap — «Размерно»

Дата: 2026-06-13
Тип: architecture roadmap.

## Цель

Зафиксировать безопасный подход к CSS без редизайна и без массового переписывания стилей.

## Принцип

CSS миграция должна идти постепенно: от согласованных блоков к общим токенам и компонентным классам. Массовый cleanup всего проекта запрещен без отдельного задания.

## Правила

- Не ломать уже принятый визуал.
- Не делать редизайн в рамках архитектурного этапа.
- Не менять UX-flow.
- Новые общие классы добавлять только когда есть повторяемый паттерн.
- Для каждого изменения фиксировать, какие классы добавлены или изменены.

## Этапы

| Этап | Задача | Статус |
|---|---|---|
| CSS01 | Зафиксировать текущие CSS-зоны | todo |
| CSS02 | Выделить design tokens | todo |
| CSS03 | Описать общие button/card/surface patterns | todo |
| CSS04 | Мигрировать блоки по одному | todo |
| CSS05 | Добавить visual regression checklist | todo |

## Protected rule

CSS changes that affect constructor behavior, checkout, 3D scene layout or admin must be treated as protected until separately approved.
