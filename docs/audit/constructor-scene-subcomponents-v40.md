# Размерно — ConstructorScene subcomponents v40

## Что сделано

Продолжена безопасная декомпозиция `ConstructorScene.tsx`: вынесены клиентская автопроверка и debug production preview.

## Новые файлы

- `src/static-pages/constructor/components/ConstructorSceneValidationCard.tsx`
- `src/static-pages/constructor/components/ConstructorSceneProductionDebug.tsx`

## Что вынесено

### ClientValidationCard

Вынесен блок клиентской автопроверки:

- status `ready/warning`;
- loading state;
- soft error note;
- список простых клиентских проверок.

### ProductionDebugPreview

Вынесен debug-блок production preview:

- `details` wrapper;
- статус production preview;
- summary panels/hardware/drilling/basis;
- warnings/errors meta;
- внутренний `formatPreviewStatus`.

## Что осталось в ConstructorScene

`ConstructorScene.tsx` теперь отвечает за композицию сцены:

- header сцены;
- price chip;
- canvas/SVG model composition;
- footer chips;
- подключение `ClientValidationCard`;
- условное подключение `ProductionDebugPreview`.

## Результат inventory

После v39:

- `ConstructorScene.tsx`: 176 lines, 8.83 KB
- flags: `large-bytes`, `many-classNames`

После v40:

- `ConstructorScene.tsx`: 128 lines, 5.55 KB
- React inventory больше не отмечает `ConstructorScene.tsx` как flagged candidate.
- Остался один flagged candidate: `src/static-pages/ConstructorPage.tsx`.

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

Начать декомпозицию `ConstructorPage.tsx`: вынести props/state composition helpers или отдельный `ConstructorPageShell`, не трогая pricing/order/backend.
