# Размерно — base/header CSS split v23

## Что сделано

Продолжен приоритет 3: CSS разделяется аккуратно, без cleanup и без изменения визуальных значений.

## Изменения

Созданы файлы:

- `src/styles/base.css`
- `src/styles/header.css`

В `src/main.tsx` теперь порядок импортов такой:

```ts
import "./styles/base.css";
import "./styles/header.css";
import "./index.css";
import "./styles/constructor.css";
```

## Что перенесено

### `base.css`

Перенесены базовые правила из начала `src/index.css`:

- `@import "tailwindcss";`
- `:root` токены;
- global box sizing;
- `html`;
- `body`;
- `a`;
- `button,label`.

### `header.css`

Перенесён header-блок:

- `.rzm-header-shell`
- `.rzm-header`
- `.rzm-logo`
- `.rzm-nav`
- `.rzm-cta`
- `.rzm-burger`
- `.rzm-mobile-panel`
- mobile header media queries.

## Что важно

- CSS-селекторы не менялись.
- CSS-значения не менялись.
- Порядок правил внутри каждого перенесённого блока сохранён.
- `constructor.css` продолжает подключаться последним, как более специфичный слой.

## Размеры

После v23:

- `src/styles/base.css` около 1 KB
- `src/styles/header.css` около 7 KB
- `src/index.css` около 108 KB
- `src/styles/constructor.css` около 65 KB

## Что не трогалось

- React-компоненты;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store logic;
- визуальные значения CSS.

## Следующий этап приоритета 3

Вынести static info pages CSS из `src/index.css` в `src/styles/info-pages.css` так же без изменения селекторов и значений.
