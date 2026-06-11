# Размерно — constructor visual fixes v57

## Что сделано

После правок главной, `Замеров`, `Материалов` и `Сборки` начаты P0/P1 visual fixes конструктора.

## Изменённые файлы

- `src/static-pages/ConstructorPage.tsx`
- `src/static-pages/constructor/components/ConstructorScene.tsx`
- `src/static-pages/constructor/components/ConstructorSceneModel.tsx`
- `src/static-pages/constructor/components/FillStep.tsx`
- `src/static-pages/constructor/components/SizesStep.tsx`
- `src/static-pages/constructor/store/constructorStore.ts`
- `src/static-pages/constructor/store/constructorStore.test.ts`
- `src/styles/constructor.css`

## P0: исправлен слипшийся status text под сценой

Было проблемное отображение вида:

```text
Широкая модельСекции: 27БелыйШтангаС руками
```

Теперь footer сцены оформлен как отдельные chips:

- тип мебели;
- пропорция модели;
- секции;
- материал;
- наполнение;
- ручки / без ручек.

## P0: ограничено количество секций и отсеков

Добавлены лимиты в store:

```ts
CONSTRUCTOR_SECTION_LIMITS = { min: 1, max: 6 }
CONSTRUCTOR_COMPARTMENT_LIMITS = { min: 1, max: 5 }
```

Изменено:

- `setSections`;
- `setCompartments`;
- `restoreDraft`.

Теперь значение вроде `27 секций` не должно восстановиться из старого draft или появиться через UI.

## P1: сцена конструктора стала плотнее

Изменения:

- SVG-модель увеличена;
- canvas стал плотнее;
- dimension labels приближены;
- floor shadow расширен;
- model badge поднят/уточнён;
- модель теперь занимает больше визуального центра.

## P1: scene copy обновлён под равнозначные типы мебели

Заменено:

- `Ваш шкаф` → `Ваша мебель`;
- описание теперь говорит про тип мебели, размеры, секции и декор.

## P1: sidebar немного уплотнён

Изменения:

- уменьшены внутренние gaps;
- карточки стали компактнее;
- stepper стал ниже;
- fill cards стали плотнее;
- `Точная настройка` заменена на `Расширенные настройки`.

## Что не трогалось

- backend/API;
- pricing engine;
- order flow;
- production preview adapter;
- checkout logic;
- admin;
- Supabase/API/env.

## QA

Пройдены проверки:

- `npm run report:visual-qa`
- `npm run check:constructor-architecture`
- `npm run check:static-pages-architecture`
- `npm run check:no-static-html-pages`
- `npm run report:react-components`
- `npm run report:css-inventory`
- `npm run test:constructor-store`
- `npm run test:constructor-flow`
- `npm run test:constructor-pii-order`
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

## Важное ограничение

Этап не включает pixel-perfect browser review. После проверки в браузере нужно отдельно оценить:

- не стала ли SVG-модель слишком крупной на некоторых размерах;
- не конфликтуют ли dimension labels с моделью;
- насколько читается chips footer на mobile;
- достаточно ли уплотнён sidebar;
- checkout step пока не пересобирался глубоко.

## Следующий этап

Продолжить правки конструктора:

1. checkout readability;
2. mobile constructor layout;
3. scene labels polish;
4. sidebar visual hierarchy.
