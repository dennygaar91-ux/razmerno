# Размерно — info pages CSS split v24

## Что сделано

Продолжен приоритет 3: CSS разделён дальше без cleanup, без переименования классов и без изменения визуальных значений.

## Изменения

Создан файл:

`src/styles/info-pages.css`

В `src/main.tsx` порядок CSS-импортов теперь такой:

```ts
import "./styles/base.css";
import "./styles/header.css";
import "./index.css";
import "./styles/info-pages.css";
import "./styles/constructor.css";
```

## Что перенесено

Из `src/index.css` перенесён static info pages CSS, начиная с:

- `.rzm-measure-page`

В новый файл вошли стили страниц:

- `measurements`;
- `materials`;
- `assembly`.

Ключевые группы:

- `.rzm-measure-*`
- `.rzm-material-*`
- `.rzm-assembly-*`

## Что важно

- CSS-селекторы не менялись.
- CSS-значения не менялись.
- Порядок правил внутри перенесённого блока сохранён.
- `constructor.css` остаётся последним, как самый специфичный слой.
- `src/index.css` больше не содержит `.rzm-measure-page`.

## Размеры после v24

- `src/styles/base.css` около 1 KB
- `src/styles/header.css` около 8 KB
- `src/index.css` около 84 KB
- `src/styles/info-pages.css` около 24 KB
- `src/styles/constructor.css` около 65 KB

## Что не трогалось

- React-компоненты;
- static page HTML modules;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store logic;
- визуальные значения CSS.

## Следующий этап приоритета 3

Подготовить CSS inventory/audit script: посчитать размеры CSS-файлов, найти потенциальные legacy-селекторы и составить отчёт без автоматического удаления.
