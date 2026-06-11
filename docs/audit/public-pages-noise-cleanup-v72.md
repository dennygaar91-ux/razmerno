# Размерно — public pages noise cleanup v72

## Что сделано

Продолжен самостоятельный безопасный cleanup после v71: уменьшен шум на публичных страницах без изменения pricing/order/backend/checkout business logic и без вмешательства в Three.js runtime.

## Изменённые файлы

- `src/static-pages/HomePage.tsx`
- `src/static-pages/home/HomeHero.tsx`
- `src/static-pages/home/HomeHow.tsx`
- `src/static-pages/home/HomeKit.tsx`
- `src/static-pages/home/HomeProducts.tsx`
- `src/static-pages/assembly/AssemblyKit.tsx`
- `src/static-pages/assembly/AssemblyTimeline.tsx`
- `src/static-pages/assembly/AssemblySupport.tsx`
- `src/static-pages/materials/MaterialsPalette.tsx`
- `src/static-pages/measurements/MeasurementsChecklist.tsx`
- `src/styles/constructor.css`

## Главная

Удалены из основного потока:

- блок ориентировочной цены;
- блок сложного проекта.

Главная стала короче и спокойнее: hero → как работает → комплект → форматы → FAQ → CTA.

Дополнительно:

- уменьшен шум в hero chips;
- оставлена одна floating card вместо двух;
- сокращены тексты в блоке шагов;
- в комплекте оставлены 3 смысла вместо 4;
- в блоке форматов убраны повторяющиеся labels `Равнозначный формат`.

## Сборка

Упрощены тексты:

- комплект описан короче;
- timeline получил более прямой заголовок `Корпус → наполнение → фасады`;
- support-блок стал менее назидательным и более прикладным.

## Материалы

Сокращён copy в блоке палитры:

- заголовок стал короче;
- lead стал проще;
- small labels в swatches стали менее шумными.

## Замеры

Сокращён lead чек-листа: меньше инструктивного текста, больше прямого действия.

## CSS

Добавлен маленький Stage72 слой:

- calmer chips;
- compact product cards;
- 3-column kit list;
- чуть более равномерные section gaps;
- lower visual weight for info cards.

CSS не удалялся.

## Что не трогалось

- constructor business logic;
- pricing engine;
- order flow;
- backend/API;
- checkout validation;
- Three.js/SVG runtime;
- Supabase/env;
- production preview adapter.

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

## Важно

Это не pixel-perfect правка. Я сознательно не делал радикальный новый дизайн без визуальной проверки. Этап направлен на снижение количества смысловых и визуальных блоков.

## Следующий безопасный этап

Можно сделать v73 — консервативный polish конструктора:

- ещё уменьшить видимый текст в sidebar;
- улучшить empty/low-noise состояние сцены;
- сделать checkout ещё спокойнее;
- не трогать бизнес-логику.
