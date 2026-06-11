# Размерно — release checklist v47

## Что сделано

Добавлен единый release checklist script, который запускает основные guards, inventory и smoke tests одной командой.

## Новый файл

- `scripts/release-checklist.mjs`

## Новый npm script

```bash
npm run release:check
```

## Что входит в release checklist

- `check:constructor-architecture`
- `check:static-pages-architecture`
- `check:no-static-html-pages`
- `report:react-components`
- `report:css-inventory`
- `test:constructor-flow`
- `test:constructor-pii-order`
- `test:constructor-store`
- `test:constructor-draft`
- `test:constructor-payload`
- `test:production-preview`
- `typecheck`
- `build`
- `check:no-server`
- `check:normal-urls`
- `check:root-docs`
- `check:legacy-runtime-imports`
- `test:pricing-engine`
- `test:delivery`
- `test:pricing-final`

## Как работает script

Script запускает проверки последовательно. Если любая проверка падает, checklist сразу останавливается и показывает, на каком шаге возникла ошибка.

## Последний запуск

```text
Release checklist passed
Total time: 24.2s
```

## Что не трогалось

- backend/API;
- pricing engine implementation;
- order flow implementation;
- production preview adapter;
- Zustand-store implementation;
- CSS;
- visual components.

## Зачем это нужно

Теперь перед каждым следующим этапом можно быстро проверить, что архитектурные изменения не сломали:

- структуру статических страниц;
- структуру конструктора;
- flow конструктора;
- PII/order invariants;
- draft без PII;
- production preview;
- pricing/delivery;
- сборку проекта.

## Следующий этап

Переходить к visual QA/design fixes: собрать список текущих визуальных огрехов и править точечно, имея `npm run release:check` как общий safety-net.
