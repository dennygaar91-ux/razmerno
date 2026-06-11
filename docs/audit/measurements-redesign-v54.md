# Размерно — measurements redesign v54

## Что сделано

Продолжены правки после главной страницы: пересобрана страница `Замеры` в более живой и предметный формат.

## Изменённые файлы

- `src/static-pages/measurements/MeasurementsHero.tsx`
- `src/static-pages/measurements/MeasurementsBasics.tsx`
- `src/static-pages/measurements/MeasurementsHardPlaces.tsx`
- `src/static-pages/measurements/MeasurementsSteps.tsx`
- `src/static-pages/measurements/MeasurementsMistakes.tsx`
- `src/static-pages/measurements/MeasurementsChecklist.tsx`
- `src/static-pages/measurements/MeasurementsFinalCTA.tsx`
- `src/styles/constructor.css`

## Добавленные assets

- `public/assets/measurements-hero-room.jpeg`
- `public/assets/measurements-hard-places.jpeg`
- `public/assets/measurements-checklist.jpeg`

## Hero

Hero стал более предметным:

- новый заголовок: `Снимите размеры так, чтобы мебель точно встала`;
- добавлены trust chips: `в нескольких точках`, `с запасом`, `с фото сложных мест`;
- вместо чистой схемы добавлена фото-сцена с линиями размеров;
- сохранены CTA:
  - `Начать с размеров`
  - `Посмотреть материалы`

## Подготовка

Блок стал шире по смыслу:

- рулетка;
- место установки;
- фото места.

Акцент смещён с абстрактных инструментов на реальную подготовку пространства.

## Главное правило

Блок `Измеряйте не в одной, а в нескольких точках` усилен фото-карточкой и подписью:

- сверху;
- по центру;
- снизу.

## Три размера

Сохранены три основные сущности:

- ширина;
- высота;
- глубина.

Тексты уточнены под мебель в целом, а не только шкаф.

## Сложные места

Блок переформулирован под реальные ограничения:

- трубы и выступы;
- розетки и выключатели;
- плинтус и углы.

## Чек-лист

Чек-лист получил двухколоночную композицию:

- слева текст + пункты проверки;
- справа визуальная карточка;
- добавлена подпись `готово к конструктору`.

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
- читаемость линий размеров;
- mobile behavior hero/checklist;
- плотность информационных карточек.

## Следующий этап

После проверки страницы `Замеры` перейти к правкам страницы `Материалы`.
