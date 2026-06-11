# Размерно — ConstructorScene decomposition v39

## Что сделано

Начата безопасная декомпозиция `ConstructorScene.tsx`, который был отмечен React component inventory как крупный файл.

## Новые файлы

- `src/static-pages/constructor/components/ConstructorSceneModel.tsx`
- `src/static-pages/constructor/components/ConstructorSceneFillPreview.tsx`

## Что вынесено

### ConstructorSceneModel

Вынесены pure helpers:

- `ModelMetrics`
- `clamp`
- `getFillLabel`
- `getModelMetrics`
- `getProportionLabel`
- `getModelSections`
- `getShelfLines`

### ConstructorSceneFillPreview

Вынесен компонент:

- `FillPreview`

Он отвечает за SVG-визуализацию наполнения:

- shelves
- drawers
- rod

## Что осталось в ConstructorScene

`ConstructorScene.tsx` теперь отвечает за композицию сцены:

- header сцены;
- price chip;
- canvas wrapper;
- SVG model composition;
- footer chips;
- client validation card;
- debug production preview.

## Результат inventory

До декомпозиции:

- `ConstructorScene.tsx`: 337 lines, 14.06 KB
- flags: `large-lines`, `large-bytes`, `many-classNames`

После декомпозиции:

- `ConstructorScene.tsx`: 176 lines, 8.83 KB
- flags: `large-bytes`, `many-classNames`

Новый файл `ConstructorSceneFillPreview.tsx` содержит SVG-fill logic, а `ConstructorSceneModel.tsx` содержит чистые расчётные helpers.

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

Продолжить декомпозицию `ConstructorScene.tsx`: вынести `ClientValidationCard` и `ProductionDebugPreview` в отдельные subcomponents.
