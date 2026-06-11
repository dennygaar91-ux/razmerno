# Stage 12 — 3D scene visual strengthening

## Scope
Improved the active 3D scene as a commercial/product preview while preserving the current interaction model and order/pricing flow.

## Completed
- Added `sceneMode` to Three input: `sizes`, `fill`, `materials`, `checkout`.
- Scene mode now follows the active constructor step.
- Camera adapts to product scene mode.
- Studio lighting strengthened with mode-aware background, directional light and spot light.
- Filling mode ghosts facades so internal zones and filling stay readable.
- Materials/checkout modes keep solid facades for commercial preview.
- Added `hardwareLight` material for rods, hinges and drawer slides.
- Viewer exposes `data-scene-mode` for QA and styling.
- Added Stage 12 marker `data-scene-stage="STAGE12"`.
- Added guard `scripts/check-stage12-3d-scene-visuals.mjs`.
- Extended Three adapter tests for scene modes.

## Not done intentionally
- Did not add assembly animation.
- Did not add exploded view.
- Did not perform deep Three.js chunk optimization.
- Did not make production-grade hardware catalog geometry; hardware remains MVP-level but more visible and honest.

## QA
- typecheck: passed
- build: passed
- qa:static: passed
- validate:config: passed
- check:stage12-3d-scene-visuals: passed
- test:constructor-three: passed
