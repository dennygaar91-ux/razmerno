# Размерно — materials redesign v55

## Что сделано

Продолжены правки после главной и страницы `Замеры`: пересобрана страница `Материалы` в более предметный и тактильный формат.

## Изменённые файлы

- `src/static-pages/materials/MaterialsHero.tsx`
- `src/static-pages/materials/MaterialsPalette.tsx`
- `src/static-pages/materials/MaterialsChoice.tsx`
- `src/static-pages/materials/MaterialsHowToChoose.tsx`
- `src/static-pages/materials/MaterialsFinalCTA.tsx`
- `src/styles/constructor.css`

## Добавленные assets

- `public/assets/materials-hero-samples.jpeg`
- `public/assets/materials-palette-scene.jpeg`
- `public/assets/materials-structure-modules.jpeg`

## Hero

Hero стал более предметным:

- новый заголовок: `Выберите декор, который делает мебель частью интерьера`;
- добавлены trust chips:
  - `7 базовых декоров`
  - `без случайных цветов`
  - `можно уточнить после заявки`
- вместо чистой схемы добавлена фото-сцена с материалами;
- сохранены CTA:
  - `Выбрать материал`
  - `Смотреть сборку`

## Палитра

Блок палитры усилен:

- добавлена большая визуальная карточка с фото;
- декоры стали более тактильными через overlay texture;
- active state сохранён;
- палитра остаётся из 7 декоров:
  - белый матовый
  - светлое дерево
  - тёплый дуб
  - песочный
  - графит
  - чёрный
  - серый

## Как выбрать

Блок уточнён под понятный выбор пользователем:

- светлее;
- теплее;
- строже.

## Из чего состоит мебель

Блок усилен фото/модульной сценой:

- корпус;
- фасады;
- задняя стенка;
- кромка.

Сохранено важное предупреждение: цвет на экране может отличаться от реального образца, декор можно уточнить с менеджером.

## Что не трогалось

- backend/API;
- pricing engine;
- order flow;
- production preview adapter;
- Zustand-store implementation;
- constructor logic;
- checkout;
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
- `npm run test:constructor-flow`
- `npm run test:constructor-pii-order`
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

## Важное ограничение

Этап не включает pixel-perfect browser review. После проверки в браузере нужно отдельно поправить:

- кадрирование новых фото;
- читаемость chips поверх фото;
- плотность палитры на desktop/mobile;
- визуальную материальность swatches.

## Следующий этап

После проверки страницы `Материалы` перейти к правкам страницы `Сборка`.
