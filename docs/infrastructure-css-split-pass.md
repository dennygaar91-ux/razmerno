# Infrastructure CSS Split Pass

Дата: 2026-06-11

## Цель

Разделить активный `constructor3d.css` на управляемые feature CSS-модули без изменения UX, дизайна, runtime-кода, бизнес-логики, Three.js и checkout.

## Что сделано

- `src/styles/constructor3d.css` превращён в import entrypoint.
- Исходный CSS разделён на 26 файлов в `src/styles/constructor3d/`.
- Порядок правил сохранён через последовательность `@import`.
- Selectors не удалялись и не переименовывались.
- Specificity не менялась намеренно.
- `main.tsx` продолжает импортировать тот же `src/styles/constructor3d.css`.

## Новая структура

```text
src/styles/constructor3d.css
src/styles/constructor3d/
  00-base.css
  10-scene-foundation.css
  11-scene-selection-markers.css
  20-filling-controls.css
  21-facade-controls.css
  30-materials.css
  40-random-preset.css
  50-validation.css
  60-checkout.css
  70-ui-kit-a11y-base.css
  71-price-clarity.css
  72-layout-hierarchy.css
  80-sizes-step.css
  81-filling-step-polish.css
  82-materials-step-polish.css
  83-checkout-final-polish.css
  84-scene-info-simplification.css
  85-loading-performance-states.css
  86-reset-wcag-hardening.css
  90-working-2d-fallback.css
  91-compact-constructor-shell.css
  92-ui-role-system.css
  93-sizes-product-logic.css
  94-filling-facade-exact-mode.css
  95-real-materials-preview.css
  96-product-scene-composition.css
```

## Результат

До:

```text
src/styles/constructor3d.css — 3983 строки
```

После:

```text
src/styles/constructor3d.css — 27 строк, import entrypoint
src/styles/constructor3d/*.css — feature modules, максимум 557 строк в одном файле
```

## Guard updates

`npm run check:css-architecture` теперь учитывает split CSS-файлы в `src/styles/constructor3d/` и ставит лимит 700 строк на каждый split-module.

## Что не делалось

- CSS purge.
- Удаление potentially-unused selectors.
- Переименование классов.
- Изменение import entry в `main.tsx`.
- Визуальная переработка.
- Перенос `constructor.css` в legacy import path.

## Риски

Средний риск: CSS-файлы разделены по историческим/stage-границам, а не по идеальной feature architecture. Это осознанно безопаснее, потому что полностью сохраняет порядок правил.

Низкий риск: `@import` entrypoint может быть позже заменён прямым import-list в `main.tsx`, но сейчас это не требуется.

## Следующий шаг

После visual QA можно делать точечный CSS cleanup:

1. подтвердить визуальный baseline;
2. проверить `docs/css-class-inventory.json`;
3. вручную удалить только подтверждённые dead selectors;
4. не трогать dynamic/stage/test marker classes без проверки.
