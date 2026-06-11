# Размерно — ConstructorSidebar v42

## Что сделано

Продолжена декомпозиция `ConstructorPage.tsx`: sidebar/panel JSX вынесен в отдельный компонент.

## Новый файл

- `src/static-pages/constructor/components/ConstructorSidebar.tsx`

## Что вынесено

В `ConstructorSidebar` перенесены:

- `FurnitureTypeSwitch`;
- `ConstructorStepper`;
- conditional step rendering:
  - `SizesStep`
  - `FillStep`
  - `MaterialsStep`
  - `CheckoutStep`
- context note;
- draft status row;
- flow actions:
  - back;
  - next;
  - submit;
- submit note;
- submit success/error message.

## Что осталось в ConstructorPage

`ConstructorPage.tsx` теперь отвечает за orchestration:

- constructor state hook;
- draft lifecycle hook;
- quote hook;
- submit hook;
- production preview hook;
- step navigation;
- page shell;
- `ConstructorSidebar`;
- `ConstructorScene`.

## Результат inventory

До v42:

- `ConstructorPage.tsx`: 259 lines, 9.78 KB

После v42:

- `ConstructorPage.tsx`: 189 lines, 6.27 KB
- `ConstructorPage.tsx` больше не является flagged candidate.
- Новый flagged candidate: `ConstructorSidebar.tsx` — `large-lines`.

Это ожидаемо: мы безопасно перенесли UI-блок в отдельный компонент без изменения поведения. Следующий этап — декомпозировать сам `ConstructorSidebar`.

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

Декомпозировать `ConstructorSidebar.tsx`: вынести `ConstructorDraftRow`, `ConstructorFlowActions`, `ConstructorStepPanel`.
