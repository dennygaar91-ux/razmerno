# Размерно — shared section header v33

## Что сделано

Начат вынос повторяемых UI-паттернов статических страниц.

## Новый файл

- `src/static-pages/shared/SectionHeader.tsx`

## Что делает компонент

`SectionHeader` централизует повторяемую структуру заголовка секции:

- chips с `.rzm-how-chip-title`
- orange dot `.rzm-chip-dot`
- заголовок секции
- lead-текст `.rzm-hero-lead`

Компонент поддерживает варианты:

- `variant="home"` — использует `.rzm-home-section-head` и `.rzm-home-section-title`
- `variant="info"` — использует `.rzm-info-section-head rzm-reveal`

## Где подключён

На этом этапе компонент подключён в секциях главной:

- `src/static-pages/home/HomeHow.tsx`
- `src/static-pages/home/HomePrice.tsx`
- `src/static-pages/home/HomeKit.tsx`
- `src/static-pages/home/HomeProducts.tsx`
- `src/static-pages/home/HomeFAQ.tsx`

## Что сохранено

- CSS-классы;
- тексты;
- структура заголовка секций;
- визуальные CSS-значения;
- CTA;
- ссылки;
- карточки секций.

## Что не трогалось

- CSS-значения;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store;
- constructor logic;
- информационные страницы.

## Результат

Повторяющийся section header теперь управляется из одного компонента. Это снижает риск расхождения дизайн-системы при будущих правках заголовков блоков.

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

Подключить `SectionHeader variant="info"` к информационным страницам — Замеры, Материалы, Сборка.
