# Размерно — Three.js stages 61–65

## Что сделано

Выполнены этапы 61–65 без остановок, но итерационно и с проверками после ключевых изменений. Старый legacy Three.js viewer не возвращался. Вместо него создан новый изолированный Three.js слой для текущего конструктора.

## Главный принцип

SVG-сцена осталась fallback и безопасной базой. Новый Three.js viewer:

- не трогает pricing;
- не трогает order flow;
- не трогает backend/API;
- не трогает production preview adapter;
- получает данные только из текущего constructor state;
- может быть выключен пользователем через переключатель `2D`;
- автоматически не используется, если WebGL недоступен.

## Stage 61 — Three.js architecture scaffold

Добавлены файлы:

- `src/static-pages/constructor/three/threeTypes.ts`
- `src/static-pages/constructor/three/useWebGLAvailable.ts`
- `src/static-pages/constructor/components/ConstructorSceneRenderSwitch.tsx`

Что сделано:

- создан изолированный каталог `constructor/three`;
- добавлен WebGL detection;
- добавлен переключатель `3D / 2D`;
- текущая SVG-сцена сохранена как fallback;
- интеграция идёт через `ConstructorScene`, без затрагивания расчётов и заявки.

## Stage 62 — Basic 3D furniture model

Добавлены файлы:

- `src/static-pages/constructor/three/threeSceneAdapter.ts`
- `src/static-pages/constructor/three/ThreeFurnitureViewer.tsx`
- `src/static-pages/constructor/three/ThreeFurnitureModel.tsx`
- `src/static-pages/constructor/three/ThreeFurniturePanels.tsx`
- `src/static-pages/constructor/three/threeCamera.ts`

Что сделано:

- добавлен R3F/Three viewer;
- добавлен OrbitControls;
- добавлена базовая 3D-модель корпуса:
  - боковины;
  - верх;
  - дно;
  - задняя стенка;
  - секционные перегородки;
  - ножки;
  - floor plane;
  - contact shadows;
  - Environment lighting.

## Stage 63 — Fill logic

В `threeSceneAdapter.ts` добавлена визуальная логика наполнения:

- shelves;
- drawers;
- rod;
- handles;
- секции;
- отсеки;
- безопасные clamps по sections/compartments.

Добавлен тест:

- `src/static-pages/constructor/three/threeSceneAdapter.test.ts`

Добавлен npm script:

```bash
npm run test:constructor-three
```

## Stage 64 — Materials

Добавлен файл:

- `src/static-pages/constructor/three/threeMaterials.ts`

Что сделано:

- материалы для 7 декоров:
  - white;
  - lightwood;
  - oak;
  - sand;
  - graphite;
  - black;
  - gray;
- roughness/metalness;
- процедурная canvas wood texture для древесных декоров;
- отдельные материалы body/back/hardware/accent/shadow.

## Stage 65 — UI integration

Обновлены:

- `src/static-pages/constructor/components/ConstructorScene.tsx`
- `src/static-pages/constructor/components/ConstructorSceneViewSwitch.tsx`
- `src/styles/constructor.css`

Что добавлено:

- переключатель `3D / 2D`;
- виды:
  - `Свободно`;
  - `Спереди`;
  - `Сбоку`;
  - `Сверху`;
- `Свободно` включает OrbitControls;
- остальные виды фиксируют камеру под нужный ракурс;
- SVG fallback сохраняет текущую pseudo-3D модель;
- WebGL unavailable → автоматически остаётся SVG.

## Архитектурная декомпозиция

Чтобы не сломать guard-и, Three.js слой вынесен в отдельные компоненты и адаптеры. `ConstructorScene.tsx` остался ниже лимита архитектурного guard.

Новые файлы:

- `ConstructorSceneRenderSwitch.tsx`
- `three/threeTypes.ts`
- `three/useWebGLAvailable.ts`
- `three/threeCamera.ts`
- `three/threeSceneAdapter.ts`
- `three/threeMaterials.ts`
- `three/ThreeFurniturePanels.tsx`
- `three/ThreeFurnitureModel.tsx`
- `three/ThreeFurnitureViewer.tsx`
- `three/threeSceneAdapter.test.ts`

## Что не трогалось

- backend/API;
- pricing engine;
- order flow;
- checkout logic;
- production preview adapter;
- admin;
- Supabase/API/env;
- legacy Three.js runtime.

## Проверки

Пройдены:

- `npm run test:constructor-three`
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

## Build impact

После добавления Three.js/R3F появились отдельные chunks:

```text
three-viewer: ~88 KB raw / ~31.66 KB gzip
three-core: ~666.79 KB raw / ~172.08 KB gzip
```

Это ожидаемый вес Three.js. Нужно отдельно проверить performance на мобильных устройствах и при необходимости сделать дополнительную lazy/quality optimization.

## Важные ограничения

Этап не включает pixel-perfect browser review. Нужно проверить:

- запускается ли WebGL в браузере;
- работает ли OrbitControls;
- корректно ли переключаются виды;
- не слишком ли тяжёлая сцена на мобильном;
- не конфликтуют ли dimension labels с 3D-canvas;
- как выглядит 2D fallback при отключенном WebGL.

## Что делать дальше

Рекомендованный следующий этап:

1. browser smoke на `/configurator`;
2. проверить mobile 390px;
3. проверить 3D / 2D / свободно / спереди / сбоку / сверху;
4. при необходимости оптимизировать lazy-loading Three.js;
5. затем усиливать детали модели: фасады, реальные пропорции тумбы/комода, exploded view позже.
