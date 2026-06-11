# Размерно Design System v1.1 — Tokens

## Позиционирование

Дизайн-система соединяет три направления:

- эмоциональность и лёгкость Lego-конструктора;
- минималистичный premium SaaS;
- техничные dark panels для ощущения точного конфигуратора.

## Что изменено

- Старый набор token-переменных заменён на `--rzm-*`.
- Старые `--color-*`, `--radius-*`, `--shadow-*` оставлены как compatibility aliases, потому что они ещё используются в компонентах.
- `index.css` очищен от дублирующихся старых блоков.
- `three-plus-marker` перенесён внутрь единого `@layer utilities`.
- Добавлены новые surface/tone/motion/spacing tokens.

## Новые группы токенов

### Surfaces

- `--rzm-surface-canvas`
- `--rzm-surface-base`
- `--rzm-surface-soft`
- `--rzm-surface-panel`

### Text

- `--rzm-text-main`
- `--rzm-text-soft`
- `--rzm-text-muted`
- `--rzm-text-inverse`

### Brand

- `--rzm-brand-clay`
- `--rzm-brand-amber`
- `--rzm-brand-wood`
- `--rzm-brand-forest`

### Semantic

- `--rzm-error`
- `--rzm-warning`
- `--rzm-success`

### Motion

- `--rzm-ease-out`
- `--rzm-ease-spring`
- `--rzm-duration-fast`
- `--rzm-duration-base`
- `--rzm-duration-slow`

## Правило дальнейшей работы

Новые компоненты должны использовать `--rzm-*`.
Старые aliases удаляются только после полного прохода по компонентам.
