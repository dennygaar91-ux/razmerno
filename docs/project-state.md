# Project State — «Размерно»

Дата актуализации: 2026-06-10

## Краткое состояние

«Размерно» — React/Vite/TypeScript проект онлайн-конструктора корпусной мебели. После Stage 1–19 основной пользовательский маршрут переведён на 3D-first конструктор, добавлены рабочий 2D fallback, compact constructor shell, canonical state-layer, 3D-first управление зонами, реальные текстуры материалов, базовая фурнитура в 3D, validation UX, точная цена, checkout внутри конструктора и reset без autosave.

## Что реализовано

- Основной route `/constructor` / `/configurator` ведёт на активный `Constructor3DPage`.
- Legacy-конструктор доступен только через explicit legacy routes.
- 4 шага конструктора: `Размеры`, `Наполнение`, `Материалы`, `Заявка`.
- 3D — основной режим работы.
- 2D/SVG — рабочий fallback без полноценного инженерного чертежа.
- Canonical state-layer для dimensions/sections/zones/materials/selection/validation/pricing.
- Управление наполнением через выбранные зоны.
- Фасады: обычный режим на уровне секции, точная настройка на уровне зон.
- Реальные texture assets для материалов подключены через visual mapping.
- Цена позиционируется как точная; коэффициент прайса ×1.3 зафиксирован.
- Checkout внутри конструктора: контакты, доставка, сборка, смета, success state.
- Autosave отключён/отложен; reset реализован без удаления контактных данных.
- Validation UX разделяет error/warning/info и auto-fix.
- Accessibility guards добавлены базово.

## Что не реализовано / не закрыто

- Полный Playwright browser E2E не подтверждён в текущей среде из-за отсутствующего Chromium executable.
- Полноценный инженерный 2D-чертёж отложен.
- Полное удаление legacy `src/configurator/**` не выполнено: код находится в quarantine.
- Полный CSS cleanup не выполнен.
- Глубокая Three.js performance optimization отложена.
- Полная библиотека фурнитуры Hettich/Firmax отложена.
- Mobile не входит в ближайший scope.
- Exploded view / assembly animation отложены.
- PDF/export/production docs не являются текущим scope.

## Ключевые подсистемы

- Routing: `src/App.tsx`.
- Active constructor page: `src/static-pages/Constructor3DPage.tsx`.
- Constructor state: `src/static-pages/constructor/store/constructorStore.ts` + `constructorCanonicalState.ts`.
- Constructor rules/validation: `src/static-pages/constructor/rules/projectRules.ts`.
- Three.js layer: `src/static-pages/constructor/three/**`.
- 2D fallback: `ConstructorRealisticSvgModel.tsx`.
- Pricing: `src/pricing/**`, `src/shared/lib/pricing-core.ts`, API pricing paths.
- Checkout/order flow: `useConstructorSubmit.ts`, API `/api/orders`.
- Materials: `src/shared/materials/**`, `public/decors/**`.
- Admin/orders: `src/admin/**`, `api/admin/**`.

## Ограничения проекта

- Нельзя подрывать точность цены.
- Нельзя возвращать autosave без отдельного решения.
- Нельзя смешивать пользовательскую терминологию “зона” с внутренним legacy `compartment` в UI.
- Нельзя удалять legacy test-backed код без миграции тестов.
- Нельзя делать CSS purge без визуального QA.

## Статус готовности

- Архитектурная база MVP: 7.4/10.
- Готовность к долгосрочной разработке ИИ после этого инфраструктурного этапа: 7.8/10.
- Готовность к реальным пользователям требует нового визуального/UX QA по финальной сборке и browser E2E.
