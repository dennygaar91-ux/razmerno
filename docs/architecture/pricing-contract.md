# Pricing Contract — «Размерно»

Дата: 2026-06-13
Тип: architecture contract documentation.

## Цель

Документ фиксирует правила работы с pricing boundary без изменения pricing engine.

## Принципы

- Цена должна считаться единым pricing engine.
- UI не должен иметь отдельный ручной калькулятор.
- Клиентская и серверная цена не должны расходиться.
- Доставка и сборка должны отображаться отдельно от стоимости мебели.
- Warning-состояния не должны делать цену неточной; они должны объяснять ограничения или необходимость проверки.

## Protected scope

Без отдельного задания нельзя менять:

- pricing engine;
- price seed;
- pricing catalog;
- delivery rules;
- assembly pricing;
- checkout total calculation;
- order payload price fields.

## QA principles

Для pricing нужен отдельный набор сценариев в `qa/price-qa-matrix.md`.

## Acceptance

Этот документ является рамкой. Любое будущее изменение pricing должно сопровождаться отдельным contract update и тестами.
