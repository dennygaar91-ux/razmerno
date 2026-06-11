# Infrastructure Store Slice Factory Pass

## Цель

Продолжить безопасную декомпозицию `constructorStore.ts` без изменения поведения проекта. Pass не меняет UX, дизайн, Three.js, pricing, checkout submit, validation rules или routing.

## Что вынесено

Создан подготовительный слой slice factories для простых и низкорисковых action-групп:

- `constructorStoreSliceTypes.ts` — общий тип `ConstructorStoreSet` для slice factories.
- `constructorSceneSlice.ts` — scene/exact-mode actions.
- `constructorCheckoutSlice.ts` — checkout/contact/toggle actions.
- `constructorMaterialsSlice.ts` — material actions.
- `constructorProductionSnapshotSlice.ts` — production snapshot lifecycle actions.
- `constructorUtilitySlice.ts` — validation, legacy filling counters, restoreDraft/reset actions.

`constructorStore.ts` теперь подключает эти action-группы через spread:

- `...createConstructorMaterialsActions(set)`
- `...createConstructorUtilityActions(set)`
- `...createConstructorSceneActions(set)`
- `...createConstructorProductionSnapshotActions(set)`
- `...createConstructorCheckoutActions(set)`

## Что не трогалось

Не переносились risky core actions:

- furniture/dimensions;
- sections;
- compartments/zones;
- filling core;
- shelf split/remove;
- facade core;
- auto-fix core.

Эти блоки завязаны на rules, derived state, pricing input, validation и 3D selection. Их нужно переносить отдельными маленькими passes.

## Результат

`constructorStore.ts` уменьшен с примерно 1052 строк до примерно 1029 строк. Главный результат pass не в сильном сокращении строк, а в появлении безопасной slice-factory структуры для дальнейшего дробления store.

## Проверки

Успешно выполнены:

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

Следующий pass можно делать по `constructorStore.ts` одним из двух путей:

1. Вынести dimension/section action helpers без изменения public action names.
2. Подготовить `constructorStoreCoreActions.ts` для risky actions, но сначала переносить только furniture/dimensions, не трогая zones/filling.

Самые рискованные группы — zones/filling/facades/auto-fix — переносить последними.
