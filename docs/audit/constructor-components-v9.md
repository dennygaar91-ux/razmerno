# Размерно — constructor components v9

## Что сделано

`ConstructorPage.tsx` разбит на подкомпоненты и hook расчёта.

## Новая структура

- `src/static-pages/constructor/types.ts`
- `src/static-pages/constructor/options.ts`
- `src/static-pages/constructor/pricingLoader.ts`
- `src/static-pages/constructor/utils.ts`
- `src/static-pages/constructor/hooks/useConstructorQuote.ts`
- `src/static-pages/constructor/components/ConstructorHeader.tsx`
- `src/static-pages/constructor/components/FurnitureTypeSwitch.tsx`
- `src/static-pages/constructor/components/ConstructorStepper.tsx`
- `src/static-pages/constructor/components/SizesStep.tsx`
- `src/static-pages/constructor/components/FillStep.tsx`
- `src/static-pages/constructor/components/MaterialsStep.tsx`
- `src/static-pages/constructor/components/CheckoutStep.tsx`
- `src/static-pages/constructor/components/ConstructorScene.tsx`
- `src/static-pages/constructor/components/shared.tsx`

## Что изменилось

- `ConstructorPage.tsx` уменьшен и стал orchestration layer.
- Расчёт стоимости вынесен в `useConstructorQuote`.
- Lazy loading pricing/delivery/assembly сохранён.
- UI шагов вынесен в отдельные компоненты.
- Общие контролы вынесены в `shared.tsx`.
- Payload и отправка заявки остались в `ConstructorPage.tsx`, чтобы не делать слишком большой рискованный прыжок за один этап.

## Что не трогалось

- backend/API;
- pricing engine;
- delivery engine;
- admin;
- production/geometry;
- визуальная CSS-система.

## Следующий этап

Вынести submit/order payload в отдельный hook `useConstructorSubmit`, затем перейти к подключению Zustand/store или отдельного constructor state module.
