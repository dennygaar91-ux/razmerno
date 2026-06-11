# Размерно — visual QA raw colors v51

## Что сделано

Разобран третий безопасный блок visual QA: raw color findings.

## Изменение

Обновлён script:

- `scripts/visual-qa-inventory.mjs`

## Что изменено в логике отчёта

Raw colors теперь классифицируются по категориям:

- `catalog-swatch-data`
- `design-token-definition`
- `gradient-css`
- `material-texture-data`
- `review`
- `svg-illustration-color`
- `tailwind-arbitrary-runtime-class`
- `three-runtime-visual`
- `token-composed-css`
- `white-text-css`

Отдельно появился блок:

```text
Raw color review findings
```

## Новый результат

```text
Raw color findings: 165
Raw color review findings: 21
```

## Категории

```text
catalog-swatch-data: 16
design-token-definition: 10
gradient-css: 22
material-texture-data: 11
review: 21
svg-illustration-color: 19
tailwind-arbitrary-runtime-class: 5
three-runtime-visual: 15
token-composed-css: 23
white-text-css: 23
```

## Что попало в review

Все review findings сейчас находятся в:

```text
src/styles/constructor.css
```

Основные типы:

- warning/error backgrounds;
- SVG model fills/strokes;
- material-specific SVG corpus fills.

## Почему не делал automatic cleanup

Raw colors в `constructor.css` сейчас завязаны на визуальное состояние конструктора и SVG-preview. Автоматическая замена на токены без визуальной проверки может ухудшить контраст, warning/error states и читаемость модели.

## Что не трогалось

- runtime UI;
- CSS values;
- React visual components;
- backend/API;
- pricing engine;
- order flow;
- production preview adapter;
- Zustand-store implementation.

## QA

Пройдены проверки:

- `npm run report:visual-qa`
- `npm run check:constructor-architecture`
- `npm run check:static-pages-architecture`
- `npm run check:no-static-html-pages`
- `npm run report:react-components`
- `npm run report:css-inventory`
- `npm run test:constructor-flow`
- `npm run test:constructor-pii-order`
- `npm run test:constructor-store`
- `npm run test:constructor-draft`
- `npm run test:constructor-payload`
- `npm run test:production-preview`
- `npm run typecheck`
- `npm run build`
- `npm run check:no-server`
- `npm run check:normal-urls`
- `npm run check:root-docs`
- `npm run check:legacy-runtime-imports`
- `npm run test:pricing-engine`
- `npm run test:delivery`
- `npm run test:pricing-final`

## Следующий этап

Разобрать review colors в `constructor.css` и начать с безопасного шага: добавить CSS custom properties для repeated warning/error/model colors без изменения значений.
