# Размерно — React component inventory v38

## Что сделано

Добавлен безопасный inventory-script для React-компонентов. Он ничего не меняет автоматически, а только считает размеры и отмечает кандидатов на дальнейшую декомпозицию.

## Новый файл

- `scripts/react-component-inventory.mjs`

## Новый npm script

```bash
npm run report:react-components
```

## Новый отчёт

- `docs/audit/react-component-inventory-report.md`

## Что анализируется

Script сканирует `.tsx` файлы в:

- `src/static-pages`
- `src/components`
- `src/pages`

## Что считает

- размер файла;
- количество строк;
- exported components;
- количество `className=`;
- примерное количество JSX tags;
- soft flags:
  - `large-lines`
  - `large-bytes`
  - `many-classNames`
  - `many-jsx-tags`

## Текущий результат

- Scanned TSX files: 48
- Total TSX size: 92.81 KB
- Flagged candidates: 2

Кандидаты:

- `src/static-pages/ConstructorPage.tsx`
  - `large-lines`
  - `large-bytes`
- `src/static-pages/constructor/components/ConstructorScene.tsx`
  - `large-lines`
  - `large-bytes`
  - `many-classNames`

## Вывод

Статические страницы после v30–v37 уже достаточно хорошо декомпозированы. Основные кандидаты на следующий архитектурный этап — именно constructor files, а не landing/info pages.

## Что не трогалось

- React-компоненты;
- CSS;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store;
- constructor logic.

## QA

Пройдены проверки:

- `npm run report:react-components`
- `npm run check:static-pages-architecture`
- `npm run check:no-static-html-pages`
- `npm run report:css-inventory`
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

Безопаснее всего начать декомпозицию `ConstructorScene.tsx`: вынести pure SVG/model helpers и визуальные subcomponents, не трогая pricing/order/backend.
