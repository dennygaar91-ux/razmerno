# Размерно — ConstructorSidebar subcomponents v43

## Что сделано

Продолжена декомпозиция `ConstructorSidebar.tsx`: из sidebar вынесены внутренние повторяемые/самостоятельные UI-блоки.

## Новые файлы

- `src/static-pages/constructor/components/ConstructorDraftRow.tsx`
- `src/static-pages/constructor/components/ConstructorFlowActions.tsx`
- `src/static-pages/constructor/components/ConstructorStepPanel.tsx`

## Что вынесено

### ConstructorDraftRow

Отвечает за строку состояния черновика:

- восстановлен;
- сохранён;
- сброшен;
- автосохранение;
- кнопка «Сбросить черновик».

### ConstructorFlowActions

Отвечает за flow actions:

- назад;
- далее;
- отправить заявку;
- submit loading/success text;
- submit note;
- submit message.

### ConstructorStepPanel

Отвечает за conditional rendering шагов:

- `SizesStep`
- `FillStep`
- `MaterialsStep`
- `CheckoutStep`

## Результат inventory

До v43:

- `ConstructorSidebar.tsx`: 233 lines, 7.48 KB
- flagged: `large-lines`

После v43:

- `ConstructorSidebar.tsx`: 183 lines, 5.38 KB
- React inventory: `Flagged candidates: 0`

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

Провести архитектурный контрольный этап после v39–v43: обновить component inventory, добавить/обновить guard для constructor component architecture и зафиксировать дальнейшие кандидаты.
