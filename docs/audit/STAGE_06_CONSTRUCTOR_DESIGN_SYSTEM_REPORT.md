# Stage 06 — Constructor design-system roles

## Scope

Stage 06 focused only on the constructor UI role system. It did not change pricing formulas, order submission, checkout business logic, 3D geometry, 2D fallback behavior, or the main scenario.

## Implemented

- Promoted active constructor marker from `STAGE05` to `STAGE06`, while keeping Stage 05 compatibility classes for prior guards.
- Added explicit role classes for constructor controls:
  - `rzm-ui-btn--primary`
  - `rzm-ui-btn--secondary`
  - `rzm-ui-btn--ghost`
  - `rzm-ui-btn--danger`
  - `rzm-ui-btn--mode`
  - `rzm-ui-btn--icon`
  - `rzm-ui-btn--autofix`
  - `rzm-ui-btn--reset`
  - `rzm-ui-btn--exit`
- Added explicit status and price roles:
  - `rzm-3d-status-badge`
  - `rzm-3d-status-badge--runtime`
  - `rzm-3d-status-badge--price`
  - `rzm-3d-status-card`
  - `rzm-3d-status-card--valid`
  - `rzm-3d-status-card--warning`
  - `rzm-3d-status-card--error`
  - `rzm-3d-price-block`
- Added explicit control grouping role:
  - `rzm-3d-control-group`
- Converted camera and 3D/2D mode controls to role-based button styling instead of anonymous buttons.
- Converted validation and auto-fix buttons to role-based button styling.
- Added Stage 06 CSS token scope in `constructor3d.css` for button roles, statuses, price block, mode switch, focus states, disabled states, control groups, fields, and footer consent states.
- Updated static browser smoke guard to accept the active Stage 06 marker while preserving Stage 05 shell compatibility checks.
- Added `scripts/check-stage06-design-system.mjs` and package script `check:stage06-design-system`.

## Files changed

- `src/static-pages/Constructor3DPage.tsx`
- `src/static-pages/constructor/components/ConstructorHeader.tsx`
- `src/styles/constructor3d.css`
- `scripts/browser-smoke-static.mjs`
- `scripts/check-stage06-design-system.mjs`
- `package.json`
- `package-lock.json`

## Deferred

- Deep CSS purge is still deferred until the constructor state-layer and shell become stable enough to remove old Q/N/Stage CSS safely.
- Full visual QA in a real browser remains blocked in this environment because Playwright Chromium is not installed.
- This stage did not remove legacy configurator code.

## QA summary

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

- `npm run test:constructor3d-e2e` — Playwright Chromium executable is missing in the current environment.
