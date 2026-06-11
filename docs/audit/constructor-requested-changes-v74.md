# Размерно — constructor requested changes v74

## Что сделано

Выполнен этап точечных изменений в конструкторе по списку пользователя.

## Реализованные пункты

### 1. «Точная настройка» вынесена из левой панели

Блок `Точная настройка` убран из левой панели и перенесён в верхнюю рабочую панель над сценой справа.

Файлы:

- `ConstructorScene.tsx`
- `ConstructorSidebar.tsx`
- `SizesStep.tsx`
- `FillStep.tsx`
- `constructor.css`

### 2. Шаги вынесены над сценой

`ConstructorStepper` теперь отображается в верхней панели над сценой. В левой панели шаги больше не показываются.

Файл:

- `ConstructorScene.tsx`

### 3. Блок размеров уменьшен

Поля `Ширина / Высота / Глубина` стали компактнее через CSS-режим Stage74.

Файлы:

- `SizesStep.tsx`
- `constructor.css`

### 4. В сцене убраны «ВАША МЕБЕЛЬ» и «Превью»

Сцена больше не показывает chip `Ваша мебель` и заголовок `Превью`.

Файл:

- `ConstructorScene.tsx`

### 5. В шаг «Размеры» добавлены секции

В левой панели на шаге `Размеры` добавлена строка `Секции` с `− / +`.

Логика:

- default sections: `1`;
- минимальная ширина одной секции: `200 мм`;
- секции распределяются равномерно по ширине шкафа;
- максимум секций зависит от ширины и общего лимита `6`.

Файлы:

- `constructorStore.ts`
- `SizesStep.tsx`
- `constructorStore.test.ts`

### 6. Шаг «Наполнение» переведён на счётчики

Вместо выбора одного сценария теперь есть отдельные счётчики:

- `Полки`;
- `Ящики`;
- `Штанга`.

Default:

- полки: `0`;
- ящики: `0`;
- штанга: `0`.

Файлы:

- `constructorStore.ts`
- `FillStep.tsx`
- `useConstructorQuote.ts`
- `constructorPayload.ts`
- `threeSceneAdapter.ts`

### 7. Ручки через toggle

Кнопки `С ручками / Без ручек` заменены на toggle `Ручки`.

Файл:

- `FillStep.tsx`

### 8. Материалы разделены на «Корпус» и «Фасады»

Шаг `Материалы` теперь содержит два блока:

- `Корпус`;
- `Фасады`.

Файлы:

- `constructorStore.ts`
- `MaterialsStep.tsx`
- `constructorPayload.ts`
- `threeMaterials.ts`

### 9. Декоры через горизонтальный слайдер

Выбор декоров в каждом блоке сделан как горизонтальный slider/list.

Файлы:

- `MaterialsStep.tsx`
- `constructor.css`

### 10. Исправлен возврат со шага «Заявка»

На checkout добавлен stepper, можно вернуться на предыдущие шаги кликом по шагам. Кнопка `Назад` также сохраняется.

Файл:

- `ConstructorCheckoutLayout.tsx`

## Важное техническое замечание

Теперь в состоянии конструктора появились отдельные поля:

- `facadeMaterial`;
- `shelvesCount`;
- `drawersCount`;
- `rodsCount`.

`material` остаётся материалом корпуса и основным материалом для совместимости с существующим pricing/order flow.

`facadeMaterial` передаётся в order payload как `facadeId`.

## Что не трогалось

- backend/API;
- отправка заявки;
- PII handling;
- Supabase/env;
- pricing catalog;
- delivery/assembly logic;
- базовая order validation.

## QA

Пройдены проверки:

- `npm run typecheck`
- `npm run build`
- `npm run test:browser-smoke-static`
- `npm run check:constructor-architecture`
- `npm run check:static-pages-architecture`
- `npm run check:no-static-html-pages`
- `npm run report:react-components`
- `npm run report:visual-qa`
- `npm run report:css-inventory`
- `npm run test:constructor-store`
- `npm run test:constructor-flow`
- `npm run test:constructor-pii-order`
- `npm run test:constructor-draft`
- `npm run test:constructor-payload`
- `npm run test:production-preview`
- `npm run test:constructor-three`
- `npm run test:constructor-three-safety`
- `npm run check:no-server`
- `npm run check:normal-urls`
- `npm run check:root-docs`
- `npm run check:legacy-runtime-imports`
- `npm run test:pricing-engine`
- `npm run test:delivery`
- `npm run test:pricing-final`
- `npm run report:css-usage`

## Что нужно проверить глазами

- не перегружена ли верхняя панель над сценой;
- удобно ли пользоваться stepper над сценой;
- не слишком ли мелкие поля размеров;
- понятна ли логика секций;
- корректно ли выглядят горизонтальные слайдеры материалов;
- не конфликтует ли `Точная настройка` с 3D/2D и ценой на малых экранах;
- можно ли комфортно вернуться со страницы заявки на предыдущие шаги.
