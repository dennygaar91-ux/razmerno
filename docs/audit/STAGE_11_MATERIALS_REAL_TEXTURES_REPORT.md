# Stage 11 — Materials and real textures

## Scope
Connected the constructor material step to explicit real texture mapping and improved the material zoom-preview without changing pricing/order flow.

## Completed
- Kept MVP material set based on real decor assets under `public/decors/**`.
- Added `src/shared/materials/materialVisuals.ts` as an explicit material visual mapping layer.
- Added `src/shared/materials/materialVisuals.test.ts`.
- Ensured Three.js material path uses `TextureLoader`, material catalog texture URLs and repeat rules.
- Added a dedicated material zoom-preview with explicit “Выбрать этот декор” action.
- Added Stage 11 marker `data-material-stage="STAGE11"`.
- Added guard `scripts/check-stage11-materials-textures.mjs`.

## Not done intentionally
- Did not change pricing formulas.
- Did not add search by materials.
- Did not replace full material catalog; existing real catalog remains source of truth.

## QA
- typecheck: passed
- build: passed
- qa:static: passed
- validate:config: passed
- check:stage11-materials-textures: passed
- test:material-visuals: passed
