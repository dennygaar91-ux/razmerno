# Infrastructure Store Interaction / Restore Pass

Date: 2026-06-10

## Scope

This pass continued the safe decomposition of `constructorStore.ts` without changing runtime behavior, UX, pricing, checkout, Three.js, routing, validation rules, or CSS.

## Completed moves

### 1. Interaction state helpers

Created:

- `src/static-pages/constructor/store/constructorInteractionState.ts`

Extracted pure patch helpers for:

- exact mode state;
- scene render mode;
- scene camera/view mode;
- delivery toggle;
- assembly toggle;
- delivery address;
- contact;
- consent.

### 2. Draft restore helper

Created:

- `src/static-pages/constructor/store/constructorDraftRestoreState.ts`

Moved the draft restore normalization path out of the zustand action body:

- safe dimensions;
- section layout normalization;
- compartment layout normalization;
- facade layout normalization;
- selected section/zone restore;
- derived state recomputation.

### 3. Filling counter helper

Created:

- `src/static-pages/constructor/store/constructorFillCountState.ts`

Moved repeated global counter action logic for:

- shelves count;
- drawers count;
- rods count.

This keeps legacy/global counter compatibility while reducing repeated action code in the store. The 3D-first zone filling logic remains untouched.

## Store size result

Before infrastructure store passes:

- `constructorStore.ts`: 1672 lines

Before this pass:

- `constructorStore.ts`: 1227 lines

After this pass:

- `constructorStore.ts`: 1052 lines

Total reduction since store work began: ~620 lines.

## Safety notes

No behavior was intentionally changed. All moved logic is still called from the same public actions.

Not touched in this pass:

- dimensions/sections actions;
- zones/filling/facades actions;
- validation rules;
- pricing;
- checkout submit;
- Three.js;
- CSS;
- routes.

## Checks

Passed:

- `npm run typecheck`
- `npm run build`
- `npm run qa:static`
- `npm run validate:config`
- `npm run test:constructor-store`
- `npm run test:constructor-three`
- `npm run test:pricing-final`

## Remaining risks

- `constructorStore.ts` is still a large action store and needs further slice migration.
- `projectRules.ts` is still a rules monolith.
- CSS remains layered and large.
- `threeSceneAdapter.ts` remains a large adapter.
