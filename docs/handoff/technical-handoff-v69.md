# Размерно — technical handoff v69

## Текущее состояние

Проект после этапов v53–v68 находится в состоянии активной безопасной пересборки:

- главная пересобрана под равнозначные форматы: шкаф / тумба / комод;
- страницы `Замеры`, `Материалы`, `Сборка` усилены референсными изображениями и новым контентом;
- конструктор получил новую сцену с SVG fallback и новым изолированным Three.js viewer;
- Three.js viewer создан с нуля, не через старый legacy runtime;
- добавлены fallback, lazy-loading, error boundary, reduced quality;
- добавлена browser smoke infrastructure;
- добавлен CSS usage report.

## Главные продуктовые решения

### Типы мебели

На главной и в продуктовой коммуникации:

```text
шкаф
тумба
комод
```

показываются равнозначно.

Нельзя возвращать позиционирование, где страница выглядит только как конструктор шкафов.

### CTA

Главный CTA после перехода к равнозначным форматам:

```text
Открыть конструктор
```

Он предпочтительнее, чем `Собрать шкаф`, потому что не конфликтует с тумбой и комодом.

### Тон

Стиль должен оставаться:

```text
простота + премиальность + технологичность
```

Без фейковых отзывов, агрессивных продаж, детской Lego-метафоры и перегруженного SaaS-вида.

## Three.js архитектура

### Основной принцип

SVG fallback остаётся обязательным.

Текущая структура:

```text
ConstructorScene
 ├─ ConstructorSceneRenderSwitch
 ├─ ConstructorSceneViewSwitch
 ├─ ConstructorSceneCanvas
 │   ├─ LazyThreeFurnitureViewer
 │   │   ├─ ThreeSceneBoundary
 │   │   └─ ThreeFurnitureViewer
 │   └─ ConstructorRealisticSvgModel
 └─ ClientValidationCard
```

Three.js слой:

```text
src/static-pages/constructor/three/
  threeTypes.ts
  useWebGLAvailable.ts
  useThreeSceneQuality.ts
  threeCamera.ts
  threeSceneAdapter.ts
  threeMaterials.ts
  ThreeFurniturePanels.tsx
  ThreeFurnitureModel.tsx
  ThreeFurnitureViewer.tsx
  threeSceneAdapter.test.ts
  threeSceneSafety.test.ts
```

### Что получает Three.js

Three.js получает только безопасный constructor state:

```text
furniture
widthMm
heightMm
depthMm
sections
compartments
fill
material
handleless
```

Он не должен сам считать цену, заявку, delivery, production export или PII.

### Fallback matrix

```text
WebGL unavailable → SVG
3D render crash → SVG
user selects 2D → SVG
mobile / weak device → 3D reduced quality
prefers-reduced-motion → 3D reduced quality
```

## Что нельзя трогать без отдельного решения

Не трогать в рамках визуальных правок:

- pricing engine;
- order flow;
- backend/API;
- Supabase/env;
- production preview adapter;
- checkout business logic;
- PII handling;
- legacy Three.js runtime.

## CSS состояние

Текущий CSS:

```text
src/styles/constructor.css — 106.49 KB / 347 classes
src/index.css — 13.36 KB / 56 classes
src/styles/header.css — 7.15 KB / 19 classes
src/styles/info-pages.css — 3.22 KB / 28 classes
src/styles/base.css — 1.04 KB / 1 class
```

`constructor.css` большой, но удалять из него классы без browser review нельзя.

CSS usage report:

```text
docs/audit/css-usage-report-v68.md
docs/audit/css-usage-report-v68.json
```

## Проверки

Обязательный набор перед передачей архива:

```bash
npm run report:css-usage
npm run test:browser-smoke-static
npm run test:constructor-three
npm run test:constructor-three-safety
npm run check:constructor-architecture
npm run check:static-pages-architecture
npm run check:no-static-html-pages
npm run report:react-components
npm run report:visual-qa
npm run report:css-inventory
npm run test:constructor-store
npm run test:constructor-flow
npm run test:constructor-pii-order
npm run test:constructor-draft
npm run test:constructor-payload
npm run test:production-preview
npm run typecheck
npm run build
npm run check:no-server
npm run check:normal-urls
npm run check:root-docs
npm run check:legacy-runtime-imports
npm run test:pricing-engine
npm run test:delivery
npm run test:pricing-final
```

Browser smoke, когда установлен Playwright chromium:

```bash
npm run test:browser-smoke
npm run test:browser-smoke:mobile
```

## Known risks

### 1. Three.js визуал не проверен глазами

Нужно проверить:

- camera angles;
- OrbitControls;
- materials;
- mobile performance;
- fallback.

### 2. Большой `three-core`

Build показывает:

```text
three-core: ~666.79 KB raw / ~172.08 KB gzip
```

Это ожидаемо для Three.js, но нужно смотреть mobile performance.

### 3. CSS cleanup пока нельзя делать

Есть 46 potential-unused классов, но они могут быть dynamic/runtime/modifier. Без визуального review удаление рискованно.

### 4. Референсные изображения

Фотографии добавлены как assets, но кадрирование и stylistic fit нужно проверить в браузере.

### 5. Mobile constructor

Mobile layout получил улучшения, но sticky submit и 3D canvas нужно проверять на реальном viewport.

## Следующие этапы

### v70 — browser visual QA

- запустить browser smoke;
- собрать скриншоты;
- проверить desktop/mobile;
- сформировать список P0/P1 визуальных багов.

### v71 — visual bugfix pack

- исправить только подтверждённые визуальные баги;
- не делать глобальный redesign.

### v72 — section CSS cleanup

- чистить CSS только после v70/v71;
- по одной секции за раз.

### v73 — Three.js detail pass

- улучшить реальные пропорции тумбы/комода;
- добавить более реалистичные фасады;
- улучшить материалы;
- не трогать pricing/production logic.

## Комментарий по качеству

Текущая работа пока больше инженерная, чем финальная визуальная. Она создаёт безопасную базу, но не заменяет browser/pixel review.
