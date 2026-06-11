# Размерно — assembly redesign v56

## Что сделано

Продолжены правки после главной, `Замеров` и `Материалов`: пересобрана страница `Сборка` в более предметный и понятный формат.

## Изменённые файлы

- `src/static-pages/assembly/AssemblyHero.tsx`
- `src/static-pages/assembly/AssemblyKit.tsx`
- `src/static-pages/assembly/AssemblyTools.tsx`
- `src/static-pages/assembly/AssemblyTimeline.tsx`
- `src/static-pages/assembly/AssemblySupport.tsx`
- `src/static-pages/assembly/AssemblyFinalCTA.tsx`
- `src/styles/constructor.css`

## Добавленные assets

- `public/assets/assembly-kit-flatlay.jpeg`
- `public/assets/assembly-hero-modules.jpeg`
- `public/assets/assembly-timeline-preview.jpeg`

## Hero

Hero стал более предметным:

- новый заголовок: `Собрать мебель проще, когда комплект разложен по шагам`;
- текст больше не говорит только про шкаф;
- добавлены trust chips:
  - `маркировка деталей`
  - `крепёж в комплекте`
  - `сборка по шагам`
- вместо абстрактной схемы добавлена модульная фото-сцена;
- CTA изменён на `Открыть конструктор`.

## Комплект

Блок усилен flat-lay визуалом:

- детали;
- крепёж;
- инструкция.

Сохранены карточки:

- детали корпуса;
- крепёж и фурнитура;
- инструкция.

## Подготовка

Тексты уточнены под мебель в целом:

- свободное место;
- мягкая подложка;
- инструмент;
- помощник.

## Порядок сборки

Timeline стал двухколоночным:

- слева порядок действий;
- справа визуальная карточка;
- текст больше не ограничивается только шкафом.

## Поддержка

Блок `Если что-то не сходится` стал более строгим:

- не сверлить;
- не подпиливать;
- не менять порядок сборки самостоятельно;
- лучше написать менеджеру.

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
- читаемость labels поверх фото;
- плотность timeline на desktop/mobile;
- ритм карточек подготовки.

## Следующий этап

После проверки страницы `Сборка` перейти к правкам конструктора: P0/P1 визуальные баги сцены и sidebar.
