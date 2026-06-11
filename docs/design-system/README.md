# Размерно Design System v1.1

## Цель

Единая дизайн-система для продукта «Размерно»:

- эмоционально и легко как Lego-конструктор;
- минималистично как premium SaaS;
- технично через dark panels и точные controls;
- mobile-first;
- с понятными подсказками `?`.

## Документы

- `tokens-v1.md` — токены цвета, типографики, радиусов, теней, motion.
- `components-v1.md` — component primitives.

## Основные классы

### Surfaces

- `.rzm-card`
- `.rzm-card-soft`
- `.rzm-card-dark`
- `.surface-dark-panel`

### Controls

- `.btn`
- `.control-card`
- `.control-pill`
- `.control-field`
- `.rzm-chip`

### Help

- `.rzm-help`
- `HelpTooltip`

### Status

- `.rzm-status[data-status="error"]`
- `.rzm-status[data-status="warning"]`
- `.rzm-status[data-status="success"]`

### Mobile

- `.rzm-touch-target`
- `.rzm-mobile-sheet`
- `.rzm-mobile-panel`
- `.rzm-bottom-surface`

### Motion

- `.rzm-animate-in`
- `.rzm-hover-lift`
- `.rzm-pressable`
- `.rzm-step-motion`

## Правила дальнейшей разработки

1. Новые стили пишутся через `--rzm-*`.
2. Старые aliases `--color-*` можно использовать только до полного прохода по компонентам.
3. Новые UI-блоки используют `rzm-*` primitives.
4. Ошибки/предупреждения не используют brand accent напрямую.
5. Mobile controls должны иметь touch target минимум 44×44.
6. При добавлении подсказок используется `HelpTooltip`.
