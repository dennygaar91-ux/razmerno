# Stage 04 — Working 2D fallback without full engineering drawing

## Scope
Stage 04 converts the active 3D-first constructor fallback from a message-only state into a working SVG/2D mode. The goal is not a production engineering drawing; the goal is a stable fallback that allows the user to continue the constructor scenario when WebGL/Three.js is unavailable.

## Completed

### 4.1 Stable 2D/SVG mode
- Added explicit `sceneRenderMode` in `Constructor3DPage`.
- Added manual 3D/2D switch in the active constructor toolbar.
- 2D mode does not mount the Three.js viewer.
- If WebGL/3D is unavailable, the page renders `TwoDFallbackScene` instead of the old message-only fallback.

### 4.2 Front view of furniture
- The fallback uses `ConstructorRealisticSvgModel` in the active 3D constructor page.
- It receives the same constructor state as the 3D viewer: dimensions, sections, compartments/zones, fillings, facades, selected section and selected zone.
- The existing blueprint renderer shows front/side/top drawing modes through the current camera/view mode.

### 4.3 No decor-heavy 2D
- 2D fallback uses the blueprint SVG renderer and not the WebGL/material preview.
- Added fallback-specific visual shell that reads as a technical fallback rather than a decorative render.

### 4.4 Basic dimensions
- The fallback uses `getModelMetrics(width, height, depth)` from current dimensions.
- Blueprint renderer exposes dimensions through `rzm-blueprint-dimensions` and the drawing sheet note.
- Selected section and selected zone are highlighted through `rzm-blueprint-active-area`.

### 4.5 Full scenario without 3D
- The fallback stays inside the active constructor.
- The left panel, stepper, pricing, validation and checkout remain available while 2D fallback is active.
- Recovery actions are still available: reduced 3D and retry 3D.

## Files changed
- `src/static-pages/Constructor3DPage.tsx`
- `src/styles/constructor3d.css`
- `scripts/check-stage04-2d-fallback.mjs`
- `package.json`
- `docs/audit/STAGE_04_2D_FALLBACK_REPORT.md`

## Checks
Passed:
- `npm run typecheck`
- `npm run build`
- `npm run qa:static`
- `npm run validate:config`
- `npm run check:pre-stage3-debt`
- `npm run check:stage03-three-runtime-stability`
- `npm run check:stage04-2d-fallback`
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
- `npm run test:constructor3d-e2e` — Playwright Chromium executable is not installed in the current environment.

## Known limits
- The 2D fallback is a working configuration fallback, not a production/engineering blueprint.
- Full browser E2E still needs to be repeated locally or in CI with Playwright browsers installed.
- The fallback currently reuses the existing blueprint SVG renderer; deeper drawing semantics should remain postponed until the dedicated 2D drawing stage after MVP.
