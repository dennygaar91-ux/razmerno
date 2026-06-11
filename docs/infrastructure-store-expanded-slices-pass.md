# Infrastructure Store Expanded Slices Pass

Date: 2026-06-10

## Goal

Increase the safe decomposition volume for `constructorStore.ts` without changing runtime behavior, UX, pricing, checkout, validation rules, Three.js, routes, or CSS.

## Completed

### New store boundary modules

- `src/static-pages/constructor/store/constructorStoreLimits.ts`
- `src/static-pages/constructor/store/constructorFurnitureDimensionsSlice.ts`
- `src/static-pages/constructor/store/constructorSectionSlice.ts`
- `src/static-pages/constructor/store/constructorCompartmentSlice.ts`
- `src/static-pages/constructor/store/constructorFacadeSlice.ts`

### Extracted from `constructorStore.ts`

- furniture and dimension actions:
  - `setFurniture`
  - `setWidth`
  - `setHeight`
  - `setDepth`
  - `setFill`
- section actions:
  - `setSections`
  - `setSectionWidth`
  - `equalizeSections`
  - `selectSection`
- compartment / zone selection actions:
  - `setCompartments`
  - `setCompartmentHeight`
  - `equalizeCompartments`
  - `selectCompartment`
  - `selectZone`
- facade actions:
  - `setSectionFacadeMode`
  - `setZoneFacadeMode`
  - `setAllSectionFacadeMode`
  - `setHandleless`

## File size result

- Before all store decomposition: `constructorStore.ts` — 1672 lines.
- Before this pass: `constructorStore.ts` — 1000 lines.
- After this pass: `constructorStore.ts` — 559 lines.

The store is no longer a full monolithic action file. It is now closer to a composition root that combines focused action slices.

## What was not changed

- Business logic.
- Pricing formulas.
- Checkout submit behavior.
- Validation rules.
- Three.js scene behavior.
- CSS and visual design.
- Routes.
- Legacy quarantine.
- Core filling/random preset/auto-fix internals still remain in the store composition file and should be moved only after a dedicated regression pass.

## Checks passed

- `npm run typecheck`
- `npm run build`
- `npm run qa:static`
- `npm run validate:config`
- `npm run test:constructor-store`
- `npm run test:constructor-three`
- `npm run test:pricing-final`

## Remaining risks

- `constructorStore.ts` is still 559 lines and contains the most sensitive filling/random preset/auto-fix logic.
- `projectRules.ts` remains a large rules monolith.
- `constructor3d.css` and `constructor.css` remain large CSS layers.
- `threeSceneAdapter.ts` remains a large 3D adapter.

## Recommended next step

Do a dedicated filling/auto-fix extraction pass:

1. Extract filling actions into `constructorFillingSlice.ts`.
2. Extract random preset logic into `constructorRandomPresetState.ts`.
3. Extract auto-fix logic into `constructorAutoFixState.ts`.
4. Run full store, three, pricing and static checks after each extraction.
