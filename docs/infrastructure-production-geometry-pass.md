# Infrastructure Production / Geometry Pass

Дата: 2026-06-11

## Цель

Снизить риски долгосрочной разработки в production/geometry layer без изменения бизнес-логики, расчёта, checkout, UX, дизайна или Three.js runtime-поведения.

## Что изменено

### `src/constructor/productionModel.ts`

Файл был production-монолитом примерно на 633 строки. После безопасной декомпозиции он стал orchestration entry point примерно на 388 строк.

Вынесены чистые helper-модули:

- `productionModelMath.ts` — `round2`, `areaM2`.
- `productionModelEdges.ts` — кромка и расчёт погонных метров кромки.
- `productionModelPanels.ts` — создание production-панели и добавление панели в список.
- `productionModelDrilling.ts` — MVP-присадка, полкодержатели, петли, направляющие.
- `productionModelTotals.ts` — итоговые площади, кромка, количество панелей, фурнитуры и присадки.
- `productionModelBasis.ts` — basis export plan и basis notes.

### `src/constructor/geometry/buildHardware.ts`

Вынесен безопасный helper layer:

- `buildHardwareHelpers.ts` — правила количества петель, opening mode helpers, позиции петель/ручек, высота цоколя.

`buildHardware.ts` остался entry point для сборки hardware/drilling output.

## Что не изменено

- Формулы расчёта.
- ProductionModel schema.
- Список панелей.
- Список drilling операций.
- Список hardware items.
- Basis notes / basis export plan содержательно.
- Public exports.
- Pricing.
- Checkout.
- UI.
- Three.js visual layer.

## Почему не выполнена более глубокая декомпозиция

`buildHardware.ts`, `buildPanels.ts`, `buildDrawers.ts`, `buildFacades.ts`, `productionModel.ts` и production geometry modules связаны с будущей производственной точностью. Агрессивная декомпозиция без отдельного production regression suite может сломать координаты, панельные размеры, drilling references или linkedPanelIds.

## Следующий безопасный шаг

1. Добавить production snapshot regression tests для `buildProductionModel()`.
2. После этого дробить `buildHardware.ts` на:
   - confirmat hardware;
   - hinge hardware;
   - drawer slide hardware;
   - rod hardware;
   - shelf support hardware.
3. Отдельно инвентаризировать `ConstructorRealisticSvgModel.tsx`.
