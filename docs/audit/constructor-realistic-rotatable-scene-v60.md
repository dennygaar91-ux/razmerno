# Размерно — constructor realistic rotatable scene v60

## Что сделано

Продолжены доработки конструктора без ожидания новых скриншотов: сцена стала более похожа на ранние версии, где были видны детали модели и можно было менять ракурс.

## Изменённые файлы

- `src/static-pages/constructor/components/ConstructorScene.tsx`
- `src/static-pages/constructor/components/ConstructorRealisticSvgModel.tsx`
- `src/static-pages/constructor/components/ConstructorSceneViewSwitch.tsx`
- `src/styles/constructor.css`

## Новый функционал сцены

Добавлен переключатель ракурса:

- `3D`
- `Спереди`
- `Сбоку`

Это не полноценный Three.js orbit control, а безопасный rotatable pseudo-3D layer внутри текущей SVG-сцены. Он не трогает pricing/order/backend и не возвращает legacy runtime.

## Детализация модели

В SVG-модель добавлены визуальные детали:

- задняя панель;
- внутренний shadow layer;
- секционные разделители;
- технологические отверстия/метки;
- edge highlights;
- ручки, если выбран вариант `с ручками`;
- верхняя и нижняя кромка;
- ножки/опоры;
- более выраженная боковина и верхняя плоскость.

## Поведение ракурсов

### 3D

Показывает корпус, глубину, верхнюю плоскость, боковую часть и внутренние элементы.

### Спереди

Уменьшает акцент боковины и верхней плоскости, чтобы модель читалась как фронтальный вид.

### Сбоку

Акцентирует боковую часть и глубину, а фронтальные детали приглушает.

## Архитектура

После первой реализации `ConstructorScene.tsx` стал слишком большим. Чтобы не ломать архитектурные ограничения, сцена декомпозирована:

- `ConstructorSceneViewSwitch.tsx`
- `ConstructorRealisticSvgModel.tsx`

`ConstructorScene.tsx` снова ниже архитектурного лимита.

## Что не трогалось

- backend/API;
- pricing engine;
- order flow implementation;
- production preview adapter;
- checkout logic;
- admin;
- Supabase/API/env;
- legacy Three.js runtime.

## Важное ограничение

Это пока не полноценный Three.js viewer с orbit controls. Я сознательно не вернул legacy Three.js слой, потому что это затрагивает runtime architecture, старый store/context и может создать регресс. Текущий этап — безопасное усиление реалистичности и контролируемое переключение ракурсов внутри текущей архитектуры.

## QA

Пройдены проверки:

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

## Следующий этап

Если нужно приблизиться именно к старому поведению `можно вертеть мышкой`, следующий этап должен быть отдельным:

1. проверить старый Three.js viewer;
2. решить, можно ли безопасно подключить его к новому static constructor state;
3. сделать feature flag `advanced3d`;
4. оставить SVG как fallback;
5. не трогать pricing/order/backend.
