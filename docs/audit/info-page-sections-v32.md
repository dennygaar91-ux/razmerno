# Размерно — info page sections v32

## Что сделано

Продолжена декомпозиция React-страниц: информационные страницы разбиты на секционные компоненты.

## Новые папки и компоненты

### Measurements

- `src/static-pages/measurements/MeasurementsHero.tsx`
- `src/static-pages/measurements/MeasurementsBasics.tsx`
- `src/static-pages/measurements/MeasurementsHardPlaces.tsx`
- `src/static-pages/measurements/MeasurementsSteps.tsx`
- `src/static-pages/measurements/MeasurementsMistakes.tsx`
- `src/static-pages/measurements/MeasurementsChecklist.tsx`
- `src/static-pages/measurements/MeasurementsFinalCTA.tsx`

### Materials

- `src/static-pages/materials/MaterialsHero.tsx`
- `src/static-pages/materials/MaterialsPalette.tsx`
- `src/static-pages/materials/MaterialsChoice.tsx`
- `src/static-pages/materials/MaterialsHowToChoose.tsx`
- `src/static-pages/materials/MaterialsFinalCTA.tsx`

### Assembly

- `src/static-pages/assembly/AssemblyHero.tsx`
- `src/static-pages/assembly/AssemblyKit.tsx`
- `src/static-pages/assembly/AssemblyTools.tsx`
- `src/static-pages/assembly/AssemblyTimeline.tsx`
- `src/static-pages/assembly/AssemblySupport.tsx`
- `src/static-pages/assembly/AssemblyFinalCTA.tsx`

## Что изменено

Страницы теперь стали composition layer:

- `MeasurementsPage.tsx`
- `MaterialsPage.tsx`
- `AssemblyPage.tsx`

Они подключают `SiteHeader`, секционные компоненты и `InfoFooter`.

## Что сохранено

- HTML-разметка секций;
- CSS-классы;
- тексты;
- CTA;
- ссылки;
- active nav states;
- общий `SiteHeader`;
- общий `InfoFooter`.

## Что не трогалось

- CSS-значения;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store;
- constructor logic.

## Результат

Информационные страницы стали проще сопровождать. Теперь можно точечно менять блоки «Замеры», «Материалы» и «Сборка» без работы с длинными page files.

## QA

Пройдены проверки:

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

Начать вынос повторяемых UI-паттернов статических страниц: section headers, CTA rows, cards/grids.
