# Stage 08 — Sizes step

## Scope

Stage 08 rebuilt the active 3D constructor size step without changing checkout/order flow or pricing formulas. The goal was to make the first step fast, explicit and tied to the canonical state layer introduced in Stage 07.

## Completed

- Added Stage 08 marker on the active `Constructor3DPage` while preserving Stage 05/06/07 guards.
- Kept 4-step flow unchanged: Sizes / Filling / Materials / Checkout.
- Moved furniture type selection into the Sizes step as a clear product decision block.
- Connected dimension controls to furniture-specific limits from `CONSTRUCTOR_DIMENSION_LIMITS` instead of hard-coded generic ranges.
- Added direct numeric inputs to the dimension/section controls, while preserving plus/minus controls.
- Added inline auto-fix actions for dimension/section validation issues.
- Kept section-count logic constrained by `CONSTRUCTOR_SECTION_RULES.minWidthMm` (200 mm minimum section width).
- Preserved global exact-mode behavior for precise section widths.
- Added Stage 08 CSS scoped under `data-size-stage="STAGE08"`.
- Added Stage 08 static guard.
- Added canonical state tests for furniture defaults and section minimum-width clamping.

## Files changed

- `src/static-pages/Constructor3DPage.tsx`
- `src/styles/constructor3d.css`
- `src/static-pages/constructor/store/constructorCanonicalState.test.ts`
- `scripts/check-stage08-sizes-step.mjs`
- `package.json`
- `docs/audit/STAGE_08_SIZES_STEP_REPORT.md`

## QA

Passed:

- `npm run typecheck`
- `npm run build`
- `npm run qa:static`
- `npm run validate:config`
- `npm run check:pre-stage3-debt`
- `npm run check:stage03-three-runtime-stability`
- `npm run check:stage04-2d-fallback`
- `npm run check:stage05-constructor-shell`
- `npm run check:stage06-design-system`
- `npm run check:stage07-canonical-state`
- `npm run check:stage08-sizes-step`
- `npm run test:constructor-canonical-state`
- `npm run test:constructor-store`
- `npm run test:constructor-three-safety`
- `npm run test:constructor-three`
- `npm run test:browser-smoke-static`
- `npm run test:ui-e2e`
- `npm run test:pricing-final`
- `npm run test:three-final`
- `npm run test:geometry`
- `npm run test:layout-state`
- `npm run test:compartment-ui`
- `npm run test:three-layout-markers`

Blocked by environment:

- `npm run test:constructor3d-e2e` — Playwright Chromium executable is not installed in the runtime environment.

## Deferred

- Full visual polish of the size step remains tied to later scene/shell polish.
- Mobile behavior remains out of scope.
- Step Filling remains unchanged and will be rebuilt in Stage 09.
