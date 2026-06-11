# Размерно Design System v1.1 — Component primitives

## Цель

Компоненты должны выглядеть как единая система: лёгкие поверхности, dark panels, tactile controls и понятные подсказки.

## Новые primitives

- `.rzm-card`
- `.rzm-card-soft`
- `.rzm-card-dark`
- `.rzm-chip`
- `.rzm-help`
- `.rzm-field-label`
- `.rzm-bottom-surface`

## React UI

- `src/shared/ui/HelpTooltip.tsx`

## Правило

Новые компоненты используют `rzm-*` primitives. Старые классы `.btn`, `.control-card`, `.control-field` пока остаются, но должны постепенно заменяться в следующих задачах.
