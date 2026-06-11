# Размерно — visual QA inline styles v50

## Что сделано

Разобран второй безопасный блок visual QA: inline style findings.

## Изменение

Обновлён script:

- `scripts/visual-qa-inventory.mjs`

## Что изменено в логике отчёта

Inline styles теперь не просто считаются общим списком, а классифицируются по категориям:

- `animation-runtime`
- `canvas-fill-size`
- `dynamic-grid-template`
- `dynamic-material-swatch`
- `dynamic-progress-or-size`
- `dynamic-status-dot`
- `legacy-visualization-dynamic-svg`
- `mobile-safe-area`
- `svg-overlay-pointer-events`
- `three-label-positioning`
- `review`

Отдельно появился блок:

```text
Inline style review findings
```

## Новый результат

```text
Inline style findings: 20
Inline style review findings: 0
```

## Вывод

Текущие inline styles не требуют автоматического cleanup:

- progress width — динамическое значение;
- gridTemplateColumns — зависит от количества секций;
- material swatch — зависит от данных материала;
- dotColor — runtime-status color;
- pointerEvents — SVG/Three overlay;
- safe-area — mobile inset;
- animation/transition — runtime animation state.

## Что не трогалось

- runtime UI;
- CSS values;
- React visual components;
- backend/API;
- pricing engine;
- order flow;
- production preview adapter;
- Zustand-store implementation.

## Почему не удалялись inline styles

Все найденные inline styles сейчас относятся к динамическим runtime-значениям или legacy/three visualization layer. Их нельзя механически переносить в CSS без риска сломать поведение или усложнить код через CSS variables.

## QA

Пройдены проверки:

- `npm run report:visual-qa`
- `npm run release:check`

## Следующий этап

Разобрать raw color findings: отделить допустимые токены/динамические значения от реальных кандидатов на вынос в дизайн-токены.
