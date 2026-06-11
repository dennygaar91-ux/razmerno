# Infrastructure Store Initial State Pass

Date: 2026-06-10

## Goal

Continue infrastructure-only decomposition of the constructor store without changing runtime behavior, pricing, checkout, validation, Three.js, UX, routes, or CSS.

## Completed

### Extracted initial store state

Created:

- `src/static-pages/constructor/store/constructorStoreInitialState.ts`

Moved from `constructorStore.ts`:

- `initialProductionSnapshot`
- `initialMaterials`
- initial section layout
- initial facade layout
- initial compartment layout
- initial zone facade layout
- initial filling layout
- initial validation
- `constructorInitialState`

`constructorStore.ts` still re-exports `constructorInitialState` for backward compatibility with existing tests/imports.

### Preserved behavior

No behavior was changed. The zustand store still initializes from the same object and uses the same defaults:

- wardrobe
- 1800 x 2400 x 600
- 2 sections
- 1 compartment/zone
- default white LDSP material
- exact mode disabled
- autosave disabled from earlier stages

### Why this is safe

This pass only moved constants and initial factory data into a dedicated module. It did not change actions, selectors, rules, pricing, checkout, validation, or Three.js.

## Result

`constructorStore.ts` line count:

- before previous store prep: 1672
- after store prep: 1419
- after this pass: 1299

## Still not decomposed

The following action groups remain inside `constructorStore.ts`:

- furniture/dimensions
- sections
- compartments/zones
- filling
- facades
- materials
- exact mode
- scene settings
- production snapshot
- checkout/contact
- restore/reset

## Next safe pass

Recommended next pass:

1. Extract pure material-state helpers.
2. Extract production snapshot state helpers.
3. Extract checkout/contact action helpers.
4. Only after that, start moving dimensions/sections actions into action slice factories.

The riskiest action groups remain zones/filling/facades and should be moved last.
