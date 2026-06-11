# Размерно — constructor simplification reset v70

## Что сделано

Выполнен этап жёсткого упрощения конструктора после визуального фидбека: убраны лишние постоянные элементы, checkout вынесен в отдельный финальный layout, страница сборки облегчена.

## Изменённые файлы

- `src/static-pages/ConstructorPage.tsx`
- `src/static-pages/constructor/components/ConstructorSidebar.tsx`
- `src/static-pages/constructor/components/ConstructorScene.tsx`
- `src/static-pages/constructor/components/ConstructorSceneCanvas.tsx`
- `src/static-pages/constructor/components/ConstructorFlowActions.tsx`
- `src/static-pages/constructor/components/ConstructorStepper.tsx`
- `src/static-pages/constructor/components/ConstructorCheckoutLayout.tsx`
- `src/static-pages/AssemblyPage.tsx`
- `src/static-pages/assembly/AssemblyHero.tsx`
- `tests/browser/configurator.spec.ts`
- `scripts/browser-smoke-static.mjs`
- `src/styles/constructor.css`
- `docs/audit/constructor-simplification-reset-v70.md`

## Конструктор: что упрощено

### Sidebar

Убрано из постоянного видимого интерфейса:

- большая карточка текущего шага;
- дублирующий status с размерами вверху;
- contextual note под формами;
- видимая строка draft/autosave;
- лишняя подпись под CTA.

Оставлено:

- тип мебели;
- компактный stepper;
- текущий step panel;
- Назад / Далее.

### Stepper

Stepper упрощён:

- вместо крупных карточек теперь компактные pill-шаги;
- оставлены только номер и название шага;
- визуальный шум снижен.

### Scene

Убрано из постоянного видимого интерфейса:

- переключатель ракурсов `Свободно / Спереди / Сбоку / Сверху`;
- dimension labels вокруг модели;
- fill badge `Вращайте мышкой`;
- footer chips под сценой;
- visible client validation card под сценой;
- длинное описание под заголовком сцены.

Оставлено:

- заголовок сцены;
- 3D / 2D;
- цена;
- крупная модель;
- SVG fallback;
- production debug только в debug mode.

### Checkout

Checkout вынесен из перегруженного sidebar в отдельный финальный layout:

- hero-панель `Проверьте контакты и отправьте проект`;
- основная форма заявки;
- отдельная action-panel с итоговой стоимостью и submit/back.

Это снижает ощущение, что заявка — ещё одна длинная форма внутри левой панели.

## Сборка: что облегчено

Страница `Сборка` получила минимальное снижение шума:

- удалён блок `AssemblyTools` из основного flow;
- сокращён hero-copy;
- trust row уменьшен с 3 chips до 2 chips.

Полную пересборку страницы сборки лучше делать отдельным этапом после проверки текущего упрощения.

## Что не трогалось

- pricing engine;
- order flow;
- backend/API;
- Supabase/env;
- production preview adapter;
- PII logic;
- Three.js adapter/model logic;
- материалы/замеры/главная, кроме сборки.

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

Это не финальный visual polish. Это reset по шуму интерфейса. После проверки скриншотов нужно отдельно оценить:

- не стало ли слишком пусто в сцене;
- достаточно ли очевиден `3D / 2D`;
- удобно ли checkout вынесен в отдельный экран;
- не слишком ли компактный stepper;
- как выглядит mobile после удаления лишних элементов;
- достаточно ли облегчена страница сборки.

## Следующий этап

После проверки — stage 71:

1. точечный visual bugfix конструктора;
2. полноценное упрощение страницы сборки;
3. затем уже cleanup главной/материалов/замеров.
