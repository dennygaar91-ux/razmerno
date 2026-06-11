# Architecture — «Размерно»

Дата актуализации: 2026-06-10

## Frontend architecture

Проект построен на React + Vite + TypeScript. Routing реализован вручную в `src/App.tsx` через browser pathname и lazy-loaded static pages. Основной пользовательский route конструктора ведёт на `Constructor3DPage`.

## Feature boundaries — текущее состояние

Текущие границы смешаны:

- `src/static-pages/constructor/**` — активная 3D-first ветка конструктора.
- `src/constructor/**` — geometry/production/catalog/basis слой.
- `src/pricing/**` — pricing engine и pricing tests.
- `src/shared/**` — shared lib/materials/ui.
- `src/configurator/**` — legacy quarantine, не активный пользовательский route.
- `src/admin/**` — admin/order management.
- `api/**` — Vercel API functions.

## Routing

- `/constructor`, `/constructor.html`, `/configurator`, `/constructor-3d`, `/constructor3d`, `/configurator-3d` → active `Constructor3DPage`.
- `/constructor-legacy`, `/configurator-legacy` → legacy `ConstructorPage`.
- `/admin` → `AdminOrdersPage`.
- Static pages: home, measurements, materials, assembly.

## State management

Основной constructor state находится в zustand store:

- `src/static-pages/constructor/store/constructorStore.ts`
- canonical read model: `constructorCanonicalState.ts`
- selectors: `constructorSelectors.ts`

Проблема: store монолитный. Целевая структура — slices:

- dimensionsSlice;
- layoutSlice;
- selectionSlice;
- fillingSlice;
- materialsSlice;
- checkoutSlice;
- validationSlice;
- uiSlice.

## UI layer

Активный UI конструктора сейчас сосредоточен в `Constructor3DPage.tsx` и компонентах `src/static-pages/constructor/components/**`.

Основные UI слои:

- constructor shell;
- stepper;
- drawer/panel;
- scene toolbar/status;
- step panels;
- checkout;
- validation cards;
- price block.

Проблема: `Constructor3DPage.tsx` — God Component. Целевая декомпозиция описана в `docs/decomposition-plan.md`.

## Three.js layer

Активный слой:

- `LazyThreeFurnitureViewer.tsx`;
- `ThreeFurnitureViewer.tsx`;
- `ThreeFurnitureModel.tsx`;
- `ThreeFurniturePanels.tsx`;
- `threeSceneAdapter.ts`;
- `threeMaterials.ts`;
- `threeCamera.ts`;
- `useWebGLAvailable.ts`;
- `useThreeSceneQuality.ts`.

3D имеет runtime guards: loading, timeout, WebGL context lost, error boundary, retry/reduced mode.

## 2D fallback

Текущий fallback использует `ConstructorRealisticSvgModel.tsx`. Он рабочий, но не является production blueprint. Целевая структура — отдельный `BlueprintViewer`.

## Pricing layer

Pricing расположен в:

- `src/pricing/**`;
- `src/shared/lib/pricing-core.ts`;
- API price/order paths.

Ключевое правило: клиентская цена = price list × 1.3. Цена в UI считается точной.

## Checkout layer

Checkout находится внутри активного конструктора. Основной submit hook:

- `src/static-pages/constructor/hooks/useConstructorSubmit.ts`.

Checkout должен использовать тот же state/pricing snapshot и не создавать параллельную конфигурацию.

## API layer

Vercel API functions:

- `api/orders.ts`;
- `api/price-items.ts`;
- `api/config.ts`;
- `api/admin/**`.

PII не должно попадать в localStorage/logs.

## Styling

Основные CSS:

- `src/styles/constructor.css` — legacy monolith.
- `src/styles/constructor3d.css` — active 3D constructor accumulated CSS.
- `src/index.css`, `src/styles/header.css`, feature CSS.

CSS cleanup должен выполняться после visual QA.
