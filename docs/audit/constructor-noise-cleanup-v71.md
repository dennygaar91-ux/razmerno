# Размерно — constructor noise cleanup v71

## Что сделано

Продолжено самостоятельное упрощение после v70 без изменения pricing/order/backend. Этап сфокусирован на снижении шума внутри шагов конструктора и финального checkout.

## Изменённые файлы

- `src/static-pages/constructor/components/SizesStep.tsx`
- `src/static-pages/constructor/components/FillStep.tsx`
- `src/static-pages/constructor/components/CheckoutStep.tsx`
- `src/styles/constructor.css`
- `tests/browser/configurator.spec.ts`
- `docs/audit/constructor-noise-cleanup-v71.md`

## Конструктор — что упрощено

### Размеры

Блок размеров стал одним спокойным card layout:

- заголовок;
- короткое пояснение;
- ширина / высота / глубина;
- compact `Точная настройка` внутри той же карточки.

Убрана визуальная разрозненность: отдельный advanced-card больше не воспринимается как ещё один основной блок.

### Наполнение

`FillStep` пересобран в один основной блок:

- выбор наполнения;
- ручки / без ручек;
- compact `Точная настройка`;
- секции/отсеки показываются только при включённой точной настройке.

Это снижает перегруз: пользователь сначала выбирает базовый сценарий, а подробности открывает только при необходимости.

### Checkout

`CheckoutStep` очищен от дублирующих карточек:

- удалён duplicate summary внутри формы;
- удалён `После заявки` внутри формы;
- остались только контакты, смета, доставка/сборка, согласие.

Так как v70 уже вынес checkout в отдельный финальный layout, повторять summary/next-card внутри формы было лишним.

## CSS

Добавлен слой:

```css
/* ===== Stage71 constructor noise cleanup ===== */
```

Стили только добавлены, ничего не удалялось. Это сделано осознанно: без визуальной проверки удалять старые selectors рискованно.

## Что не трогалось

- pricing engine;
- order flow;
- checkout business logic;
- backend/API;
- Supabase/env;
- production preview adapter;
- Three.js runtime;
- SVG fallback;
- admin.

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

## Важное наблюдение

CSS после v71 вырос и `report:css-usage` показывает:

```text
Unique classes: 433
Exact-used: 351
Likely dynamic: 17
Potential unused: 65
```

Это нормально для safe-layer подхода, но следующий cleanup CSS нельзя делать без визуальной проверки. Нужно сначала увидеть, какие старые карточки реально больше не используются визуально.

## Следующий безопасный этап

Можно продолжать только в рамках безопасного UI-reduction без удаления логики:

1. ещё сильнее упростить страницу `Сборка`;
2. упростить главную, уменьшив количество мелких карточек;
3. подготовить `P0 visual bugfix list` для проверки.
