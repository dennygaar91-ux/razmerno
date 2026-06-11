# Infrastructure Store Preparation Pass

Date: 2026-06-10

## Scope

This pass prepares `constructorStore.ts` for future slice-based decomposition without changing runtime behavior, UX, pricing, checkout, validation rules, Three.js, routing, or CSS.

## Completed changes

### 1. Extracted store public type boundary

Created:

- `src/static-pages/constructor/store/constructorStoreTypes.ts`

Moved:

- `ConstructorStoreState` interface

The original module still re-exports `ConstructorStoreState` from `constructorStore.ts` for backward compatibility with existing imports.

### 2. Extracted pure store utilities

Created:

- `src/static-pages/constructor/store/constructorStoreUtils.ts`

Moved/exposed:

- `clampCount`
- `clampSectionsForWidth`
- `ensureSelectedSection`
- `ensureSelectedCompartment`
- `getMaxSectionsByWidth` re-export compatibility

### 3. Extracted derived state helpers

Created:

- `src/static-pages/constructor/store/constructorStoreDerivation.ts`

Moved:

- `createDerivedProjectState`
- `deriveFromState`

This isolates the central normalization/derived state path before future store slices are introduced.

## Store size impact

Before this pass:

- `src/static-pages/constructor/store/constructorStore.ts`: 1672 lines

After this pass:

- `src/static-pages/constructor/store/constructorStore.ts`: 1419 lines
- `constructorStoreTypes.ts`: 165 lines
- `constructorStoreUtils.ts`: 40 lines
- `constructorStoreDerivation.ts`: 83 lines

## Behavior impact

No intended behavior changes.

The pass is limited to type/helper/derivation extraction and backward-compatible exports.

## Verification

Passed:

- `npm run typecheck`
- `npm run build`
- `npm run qa:static`
- `npm run validate:config`
- `npm run test:constructor-store`
- `npm run test:constructor-three`
- `npm run test:pricing-final`

## Remaining store decomposition plan

Do not split action slices yet without a dedicated pass.

Recommended next order:

1. Extract initial state factory into `constructorStoreInitialState.ts`.
2. Extract reset/contact/checkout actions.
3. Extract scene/production snapshot actions.
4. Extract dimensions/sections actions.
5. Extract zones/filling/facades actions last, because they are tightly coupled to rules and validation.
