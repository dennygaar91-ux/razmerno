# Размерно — constructor scene premium perspective v20

## Что сделано

Добавлен лёгкий premium/3D-look правой сцены без подключения Three.js.

## Изменения

### Сцена

- `rzm-constructor-canvas` получил modifier:
  - `.rzm-constructor-canvas--premium`
- Добавлены декоративные слои:
  - `.rzm-scene-depth-grid`
  - `.rzm-scene-floor-shadow`
  - `.rzm-scene-model-shadow`
  - `.rzm-scene-orb`
  - `.rzm-scene-orb--orange`
  - `.rzm-scene-orb--yellow`

### Модель

- `rzm-constructor-model` получил modifier:
  - `.rzm-constructor-model--premium`
- Добавлены:
  - мягкая тень;
  - стеклянная подложка;
  - drop-shadow SVG;
  - лёгкий float animation;
  - `prefers-reduced-motion` fallback.

## Почему это безопасно

- Three.js не подключался.
- Production geometry не трогалась.
- Pricing/order/backend/admin не трогались.
- Изменения только в UI сцены и CSS.

## Новые/изменённые классы

- `.rzm-constructor-canvas--premium`
- `.rzm-scene-depth-grid`
- `.rzm-scene-floor-shadow`
- `.rzm-scene-model-shadow`
- `.rzm-scene-orb`
- `.rzm-scene-orb--orange`
- `.rzm-scene-orb--yellow`
- `.rzm-constructor-model--premium`
- `@keyframes rzm-model-float`

## Следующий этап

Сделать visual QA конструктора после серии изменений: проверить левую панель, правую сцену, mobile/tablet поведение, debug mode и checkout.
