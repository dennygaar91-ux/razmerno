# Zustand migration plan — remove legacy `useConfig/context`

## Текущий статус

В проекте всё ещё есть legacy `src/configurator/context.tsx`, который держит часть write-flow и compatibility layer. Zustand уже используется как bridge/selectors, но не стал единственным source of truth.

## Цель

Перевести конструктор на один source of truth:

```text
src/configurator/store/configStore.ts
```

и постепенно удалить:

```text
src/configurator/context.tsx
```

## Файлы, где ещё используется `useConfig`

- `src/configurator/Visualization.tsx`
- `src/configurator/steps.tsx`
- `src/configurator/HorizontalStepper.tsx`
- `src/configurator/CheckoutDrawer.tsx`
- `src/configurator/ConfigHeader.tsx`
- `src/configurator/ProductionDebugPanel.tsx`
- `src/configurator/PriceCard.tsx`
- `src/configurator/MobileBottomBar.tsx`
- `src/configurator/QuickStart.tsx`
- `src/configurator/ThreeViewer.tsx`
- `src/configurator/three/markers.ts`

## Порядок миграции

### Phase 1 — Read selectors only

Заменить чтение:

```ts
const { state, price, validation } = useConfig()
```

на granular selectors:

```ts
const state = useConfigStateSelector()
const price = useConfigPriceSelector()
const validation = useConfigValidationSelector()
```

### Phase 2 — Dispatch facade

Создать stable actions API:

```ts
const setDimensions = useConfigStore((s) => s.setDimensions)
const openCheckout = useConfigStore((s) => s.openCheckout)
```

и убрать прямые `dispatch({ type: ... })` из компонентов.

### Phase 3 — Provider removal

Когда все компоненты читают/пишут через Zustand:

- удалить `ConfigProvider`;
- удалить `ConfigContext`;
- удалить reducer bridge;
- обновить tests.

### Phase 4 — QA

Обязательные проверки:

```bash
npm run typecheck
npm run typecheck:api
npm run test:zustand-foundation
npm run test:provider-store-sync
npm run qa:all
npm run build
```

## Риски

- Checkout зависит от price/material selectors.
- ThreeViewer зависит от state/validation markers.
- Step navigation зависит от activeStep/errors.
- Ошибка миграции может сломать autosave.

## Что НЕ делать

- Не удалять `context.tsx` одним коммитом.
- Не смешивать миграцию Zustand с UX redesign.
- Не менять pricing logic одновременно с store migration.
