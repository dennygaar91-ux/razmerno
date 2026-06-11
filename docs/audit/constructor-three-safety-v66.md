# Размерно — Three.js safety hardening v66

## Что сделано

Выполнен безопасный этап после внедрения Three.js stages 61–65: усилена устойчивость 3D-слоя без визуальных правок, без изменения pricing/order/backend и без удаления SVG fallback.

## Изменённые файлы

- `src/static-pages/constructor/components/ConstructorScene.tsx`
- `src/static-pages/constructor/components/ConstructorSceneCanvas.tsx`
- `src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx`
- `src/static-pages/constructor/components/ThreeSceneBoundary.tsx`
- `src/static-pages/constructor/three/ThreeFurnitureViewer.tsx`
- `src/static-pages/constructor/three/threeTypes.ts`
- `src/static-pages/constructor/three/useThreeSceneQuality.ts`
- `src/static-pages/constructor/three/threeSceneSafety.test.ts`
- `src/styles/constructor.css`
- `package.json`

## Что добавлено

### Lazy loading

`ThreeFurnitureViewer` теперь подключается через `React.lazy`.

Это уменьшает основной constructor chunk:

```text
ConstructorPage: было ~60.36 KB raw / ~17.05 KB gzip
ConstructorPage: стало ~56.77 KB raw / ~15.60 KB gzip
```

Появился отдельный lazy chunk:

```text
ThreeFurnitureViewer: ~5.79 KB raw / ~2.49 KB gzip
```

Three.js core по-прежнему отдельным chunk:

```text
three-core: ~666.79 KB raw / ~172.08 KB gzip
```

## Error boundary

Добавлен `ThreeSceneBoundary`.

Если WebGL/Three viewer падает во время render lifecycle:

- ошибка ловится;
- Three mode отключается;
- сцена возвращается в SVG fallback;
- pricing/order/backend не затрагиваются.

## Loading state

Добавлен `ThreeViewerLoading`:

- показывает мягкий loading state при загрузке lazy viewer;
- объясняет, что при недоступном WebGL откроется 2D-схема;
- поддерживает `prefers-reduced-motion`.

## Reduced quality

Добавлен `useThreeSceneQuality`.

Reduced quality включается при:

- `prefers-reduced-motion: reduce`;
- mobile viewport `max-width: 760px`;
- `deviceMemory <= 4`;
- `hardwareConcurrency <= 4`.

В reduced mode:

- ниже DPR;
- отключены heavy shadows;
- ниже shadow map;
- выключен ContactShadows;
- antialias отключается.

## Декомпозиция

Чтобы сохранить архитектурный guard, canvas вынесен из `ConstructorScene.tsx` в:

```text
ConstructorSceneCanvas.tsx
```

`ConstructorScene.tsx` остался ниже лимита.

## Тесты

Добавлен script:

```bash
npm run test:constructor-three-safety
```

Он проверяет:

- lazy import;
- наличие boundary;
- отсутствие прямого импорта ThreeFurnitureViewer в `ConstructorScene.tsx`;
- наличие quality guard;
- reduced-motion / deviceMemory / hardwareConcurrency;
- применение quality в viewer.

## Что не трогалось

- backend/API;
- pricing engine;
- order flow;
- checkout logic;
- production preview adapter;
- admin;
- Supabase/API/env;
- legacy Three.js runtime;
- визуальное pixel-perfect поведение.

## QA

Пройдены проверки:

- `npm run test:constructor-three`
- `npm run test:constructor-three-safety`
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
- `npm run typecheck`
- `npm run build`
- `npm run check:no-server`
- `npm run check:normal-urls`
- `npm run check:root-docs`
- `npm run check:legacy-runtime-imports`
- `npm run test:pricing-engine`
- `npm run test:delivery`
- `npm run test:pricing-final`

## Риски

Нужна браузерная проверка:

- lazy viewer реально загружается;
- ErrorBoundary возвращает SVG при runtime error;
- reduced quality не делает сцену слишком бедной визуально;
- sticky/mobile layout не конфликтует с 3D canvas;
- Three.js core всё ещё тяжёлый, нужна отдельная performance-проверка.

## Следующий безопасный этап без скриншотов

Можно сделать browser smoke infrastructure:

- Playwright / минимальный DOM-smoke;
- проверка `/configurator`;
- переключение 3D/2D;
- переключение видов;
- mobile viewport smoke;
- без pixel-perfect assertions.
