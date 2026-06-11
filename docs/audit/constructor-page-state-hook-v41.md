# Размерно — ConstructorPage state hook v41

## Что сделано

Начата безопасная декомпозиция `ConstructorPage.tsx`: вынесена связка Zustand selectors + selected options + constructor snapshot в отдельный hook.

## Новый файл

- `src/static-pages/constructor/hooks/useConstructorPageState.ts`

## Что вынесено

В `useConstructorPageState` перенесены:

- чтение значений из Zustand store через selectors;
- чтение actions из Zustand store через selectors;
- вычисление `selectedFurniture`;
- вычисление `selectedMaterial`;
- сборка `ConstructorSnapshot` через `useMemo`.

## Что осталось в ConstructorPage

`ConstructorPage.tsx` пока оставлен как composition layer для сценария конструктора:

- quote loading;
- submit hook;
- production preview hook;
- draft lifecycle;
- step navigation;
- sidebar JSX;
- scene JSX.

## Результат inventory

До v41:

- `ConstructorPage.tsx`: 324 lines, 12.62 KB

После v41:

- `ConstructorPage.tsx`: 259 lines, 9.78 KB
- flagged candidate всё ещё остаётся, но файл стал меньше и проще.

## Что не трогалось

- CSS;
- backend/API;
- pricing engine;
- order flow;
- production preview adapter;
- Zustand-store;
- payload logic;
- production geometry.

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

Продолжить декомпозицию `ConstructorPage.tsx`: вынести sidebar/panel JSX в отдельный `ConstructorSidebar`, сохранив всю текущую логику и props.
