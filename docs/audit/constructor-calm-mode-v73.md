# Размерно — constructor calm mode v73

## Что сделано

Продолжен самостоятельный безопасный этап после v72: дополнительное снижение визуального шума в конструкторе без изменения расчётов, заявок, backend, Three.js runtime и SVG fallback.

## Изменённые файлы

- `src/static-pages/constructor/components/SizesStep.tsx`
- `src/static-pages/constructor/components/FillStep.tsx`
- `src/static-pages/constructor/components/MaterialsStep.tsx`
- `src/static-pages/constructor/components/ConstructorScene.tsx`
- `src/styles/constructor.css`
- `docs/audit/constructor-calm-mode-v73.md`

## Что упрощено

### Sidebar

- убрана лишняя поясняющая строка в шаге `Размеры`;
- убрана лишняя поясняющая строка в шаге `Наполнение`;
- убрана лишняя поясняющая строка в шаге `Материалы`;
- карточки шагов сделаны компактнее;
- поле размеров визуально уменьшено;
- выбор наполнения сделан ниже и компактнее;
- материалы в sidebar переведены в более плотную сетку;
- верхний маленький label `Конструктор` скрыт в simplified sidebar.

### Scene

- заголовок сцены сокращён до `Превью`;
- 3D/2D switch визуально уменьшен;
- цена компактнее;
- canvas немного ниже и спокойнее;
- Three.js viewer стал чуть компактнее.

## Что не трогалось

- pricing engine;
- delivery/assembly pricing;
- order flow;
- checkout validation;
- backend/API;
- Supabase/env;
- production preview adapter;
- Three.js model/runtime;
- SVG fallback;
- маршрутизация.

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

## Важное ограничение

Это still not a pixel-perfect visual pass. Без скриншотов нельзя гарантировать, что визуально стало лучше на всех viewport. Задача этапа — убрать очевидный UI-шум и сохранить стабильность.

## Следующий рекомендуемый шаг

Если продолжать без проверки, следующий безопасный этап должен быть не visual/layout, а cleanup документации/backlog или подготовка browser QA. Новые радикальные изменения интерфейса лучше делать только после скриншотов.
