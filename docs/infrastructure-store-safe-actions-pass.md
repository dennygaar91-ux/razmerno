# Infrastructure Store Safe Actions Pass

Дата: 2026-06-10

## Цель

Продолжить безопасную декомпозицию `constructorStore.ts` без изменения поведения проекта, UI, pricing, checkout, validation, Three.js и routing.

## Выполнено

### 1. Material state helpers

Создан файл:

- `src/static-pages/constructor/store/constructorMaterialState.ts`

Вынесены чистые helper-функции:

- `createBodyMaterialPatch`
- `createFacadeMaterialPatch`
- `createSyncedBackPanelMaterialPatch`

Эти функции изолируют material/projectMaterials/backPanelMaterial derivation и validation patch от zustand action body.

### 2. Production snapshot helpers

Создан файл:

- `src/static-pages/constructor/store/constructorProductionSnapshotState.ts`

Вынесены helper-функции:

- `createProductionSnapshotLoadingPatch`
- `createProductionSnapshotReadyPatch`
- `createProductionSnapshotErrorPatch`
- `createProductionSnapshotClearPatch`

Также вынесен тип:

- `ReadyProductionSnapshotInput`

### 3. Reset helper

Создан файл:

- `src/static-pages/constructor/store/constructorResetState.ts`

Вынесена функция:

- `createResetPreservingCheckoutPatch`

Она сохраняет прежнее поведение reset: сбрасывается конфигурация, но сохраняются step, contact, consent, deliveryEnabled, assemblyEnabled, deliveryAddress.

## Изменение размера

`constructorStore.ts` уменьшен примерно с 1299 до 1245 строк.

## Что не менялось

- Бизнес-логика
- Pricing
- Checkout submit
- Validation rules
- Three.js
- CSS
- Routes
- UX/дизайн
- Legacy quarantine
- Zones/filling/facades action logic

## Проверки

Успешно прошли:

```bash
npm run typecheck
npm run build
npm run qa:static
npm run validate:config
npm run test:constructor-store
npm run test:constructor-three
npm run test:pricing-final
```

## Следующий безопасный шаг

Следующий pass можно делать по store дальше, но осторожно:

1. Вынести scene/exact-mode простые action helpers.
2. Вынести checkout/contact простые action helpers, если это даст реальную пользу.
3. Только после этого начинать slice-factory migration.

Рискованные блоки `dimensions/sections/zones/filling/facades` пока лучше не дробить одним большим изменением.
