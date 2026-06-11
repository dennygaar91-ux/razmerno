# Размерно — constructor CSS split v22

## Что сделано

Начат аккуратный CSS split по приоритету 3 без изменения визуала и без массового cleanup.

## Изменения

- Создан файл:

`src/styles/constructor.css`

- В него перенесён весь constructor-specific CSS из `src/index.css`, начиная с `.rzm-constructor-page` и до конца файла.
- `src/main.tsx` теперь импортирует:

```ts
import "./index.css";
import "./styles/constructor.css";
```

## Почему так

Мы не меняли selectors, значения, порядок правил внутри constructor CSS и не чистили legacy-классы. Это снижает риск визуального регресса.

Порядок подключения сохранён безопасно:
1. сначала общий `index.css`;
2. затем `constructor.css`.

Это соответствует прежней логике, где constructor CSS находился ближе к концу `index.css`.

## Размеры

- `src/index.css` уменьшен примерно с 180 KB до 116 KB.
- `src/styles/constructor.css` содержит примерно 65 KB constructor CSS.

## Что не трогалось

- визуальные значения CSS;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store logic;
- маршруты;
- React-компоненты конструктора.

## Следующий этап приоритета 3

Продолжить CSS split так же осторожно:
1. вынести header/base tokens в отдельные CSS-файлы;
2. затем вынести static info pages CSS;
3. только после этого делать подтверждённый cleanup unused/legacy selectors.
