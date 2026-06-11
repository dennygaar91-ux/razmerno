# Stage 07 — Canonical state layer for 3D zones

## Scope

Stage 07 formalizes the active constructor state as a canonical 3D-first layer without changing pricing formulas, checkout flow, production export, or visual UX flow.

## Completed

### 1. Canonical constructor state

Added `src/static-pages/constructor/store/constructorCanonicalState.ts`.

The canonical state now exposes one derived structure for:

- `furnitureType`
- `dimensions`
- `sections`
- `zones`
- `selectedSectionId`
- `selectedZoneId`
- `selection`
- `fill`
- `materials`
- `exactModeEnabled`
- `validation`
- `pricingDirtyKey`

This gives future stages a single adapter for state → 3D / 2D / validation / pricing checks.

### 2. Zone naming layer

The old internal `compartment` terminology is still supported for compatibility, but the new canonical layer exposes:

- `selectedZoneId`
- `selectZone(sectionId, zoneId)`
- `ConstructorCanonicalZone`

This keeps the public product logic aligned with the UI term “zone” while avoiding a risky full rename of internal files at this stage.

### 3. Global exact mode

Added `exactModeEnabled` to the store.

Legacy toggles now synchronize globally:

- `setExactModeEnabled(true)` enables both `advancedSizes` and `advancedFill`.
- `setAdvancedSizes(...)` also updates `advancedFill` and `exactModeEnabled`.
- `setAdvancedFill(...)` also updates `advancedSizes` and `exactModeEnabled`.

This matches the decision that “Точная настройка” is global across steps.

### 4. Active 3D page consumes canonical state

`Constructor3DPage` now builds the 3D viewer input from `canonicalState`, including:

- canonical furniture type;
- canonical dimensions;
- canonical selected section;
- canonical selected zone;
- canonical material ids.

3D clicks now use the zone alias action `selectZone(...)` instead of relying only on the old `selectCompartment(...)` naming.

### 5. Tests and guard

Added:

- `src/static-pages/constructor/store/constructorCanonicalState.test.ts`
- `scripts/check-stage07-canonical-state.mjs`
- `npm run test:constructor-canonical-state`
- `npm run check:stage07-canonical-state`

The tests cover:

- canonical dimensions/sections/zones;
- selected zone alias;
- global exact mode;
- zone filling/facade attachment.

## Not changed intentionally

- Pricing formulas were not changed.
- Checkout/order flow was not changed.
- Production export was not changed.
- The old `compartment` filenames/types were not renamed globally to avoid breaking tests and geometry code.
- The step UI was not visually redesigned in this stage.

## Remaining technical debt

1. `compartment` remains the internal implementation term. Full rename to `zone` is postponed until after Stage 9 or avoided entirely if adapters remain clean.
2. The canonical state is derived through a selector, not persisted as a separate mutable object. This is intentional to avoid duplicated state.
3. Some older tests still target legacy `src/configurator/**`. They remain until legacy deletion stage.
4. Browser Playwright E2E still needs a local/CI run with Chromium installed.
