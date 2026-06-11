# Stage 1 — Technical stabilization and project revision

Date: 2026-06-10
Source archive: `razmerno-constructor-stageQ10_Q11-reset-wcag-qa(1).zip`
Scope: audit only, no product UX changes, no pricing/order/3D logic changes.

## 1. Active constructor branch

### Active public routes

The active routing is defined in `src/App.tsx`.

| Route | Page component | Status | Notes |
|---|---|---|---|
| `/` / `/index.html` | `src/static-pages/HomePage.tsx` | active | Landing page |
| `/measurements` / `/measurements.html` | `src/static-pages/MeasurementsPage.tsx` | active | Measurements page |
| `/materials` / `/materials.html` | `src/static-pages/MaterialsPage.tsx` | active | Materials page |
| `/assembly` / `/assembly.html` | `src/static-pages/AssemblyPage.tsx` | active | Assembly info page |
| `/configurator`, `/constructor`, `/constructor.html` | `src/static-pages/ConstructorPage.tsx` | active legacy/current desktop constructor | This is the main non-3D-first constructor route. It still uses a landing-style header and older shell. |
| `/configurator-3d`, `/constructor-3d`, `/constructor3d` | `src/static-pages/Constructor3DPage.tsx` | active Q10/Q11 3D route | This is the newer 3D-oriented route and should be treated as the future active branch. |
| `/admin`, `/admin/*` | `src/admin/AdminOrdersPage.tsx` | active admin | Lazy-loaded admin area. |

### Active constructor conclusion

There are currently **two active constructor experiences**:

1. `src/static-pages/ConstructorPage.tsx` — active on `/configurator` and `/constructor`.
2. `src/static-pages/Constructor3DPage.tsx` — active on `/configurator-3d`, `/constructor-3d`, `/constructor3d`.

This is a product and architecture risk. The next implementation phases must choose `Constructor3DPage` as the target branch for the 3D-first rewrite, then later route `/configurator` and `/constructor` to the same active implementation after QA.

## 2. Active page and shell map

### Current `/constructor` / `/configurator`

Entry:
- `src/static-pages/ConstructorPage.tsx`

Main shell/components:
- `src/static-pages/constructor/components/ConstructorHeader.tsx`
- `src/static-pages/constructor/components/ConstructorSidebar.tsx`
- `src/static-pages/constructor/components/ConstructorScene.tsx`
- `src/static-pages/constructor/components/ConstructorCheckoutLayout.tsx`
- `src/static-pages/constructor/components/ConstructorStepper.tsx`

Important issue:
- `ConstructorHeader.tsx` still contains full landing navigation and CTA `Собрать шкаф`. This conflicts with the approved constructor direction: compact constructor header.

### Current `/constructor-3d` / `/configurator-3d`

Entry:
- `src/static-pages/Constructor3DPage.tsx`

3D route-specific dependencies:
- `src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx`
- `src/static-pages/constructor/three/ThreeFurnitureViewer.tsx`
- `src/static-pages/constructor/three/ThreeFurnitureModel.tsx`
- `src/static-pages/constructor/three/ThreeSelectionLayer.tsx`
- `src/static-pages/constructor/three/threeSceneAdapter.ts`
- `src/static-pages/constructor/three/useWebGLAvailable.ts`
- `src/static-pages/constructor/three/useThreeSceneQuality.ts`

This branch already contains important future-facing pieces: WebGL diagnostics, scene quality detection, 3D route aliases, reset dialog, scene modes, WCAG markers and basic 3D-first shell tests.

## 3. Active 3D viewer and 2D fallback

### Active 3D viewer candidates

| Path | Status | Notes |
|---|---|---|
| `src/static-pages/constructor/three/ThreeFurnitureViewer.tsx` | active for new 3D route | Target for future 3D-first work. |
| `src/configurator/three/ThreeViewer.tsx` | legacy/older configurator layer | Still has tests and store bridges, but not imported by active `src/App.tsx` route directly. |

### Active fallback candidates

| Path | Status | Notes |
|---|---|---|
| `src/static-pages/constructor/components/ConstructorRealisticSvgModel.tsx` | active/current visual fallback candidate | Used in static constructor layer. |
| `src/static-pages/constructor/components/ConstructorSceneCanvas.tsx` | active/current scene rendering layer | Needs deeper review in Stage 3/4. |
| `src/configurator/Visualization.tsx` | legacy emergency SVG fallback | Used by old `src/configurator/ConfiguratorPage.tsx`, which is not routed by `src/App.tsx`. |
| `src/configurator/three/ProductionModel2DView.tsx` | legacy/older 2D layer | Still tested, but belongs to older configurator module. |

Conclusion: the repo has **two fallback families**: static-pages constructor fallback and old configurator fallback. This must be consolidated later.

## 4. Active state/store map

### New static constructor state

Active state for `ConstructorPage` and `Constructor3DPage`:
- `src/static-pages/constructor/store/constructorStore.ts`
- `src/static-pages/constructor/store/constructorSelectors.ts`
- `src/static-pages/constructor/hooks/useConstructorPageState.ts`

This store already contains:
- `furniture`
- `dimensions`
- `sectionLayout`
- `compartmentLayout`
- `fillingLayout`
- `facadeLayout`
- `zoneFacadeLayout`
- `selectedSectionId`
- `selectedCompartmentId`
- `advancedSizes`
- `advancedFill`
- `sceneRenderMode`
- `sceneViewMode`
- `validation`
- `reset`
- `addShelfToCompartment`
- `applyRandomPresetToSection`
- `applyAutoFixForIssue`

This is the strongest current foundation for the approved 3D-zone direction.

### Legacy configurator state

Older module:
- `src/configurator/context.tsx`
- `src/configurator/state/*`
- `src/configurator/store/*`
- `src/configurator/model/*`

This appears to be the earlier configurator implementation and is still covered by many tests. It should not be deleted immediately because pricing/geometry tests may still depend on it, but it is a legacy risk for future confusion.

## 5. Active pricing path

### Static constructor pricing

Active hook:
- `src/static-pages/constructor/hooks/useConstructorQuote.ts`

Key dependencies:
- `src/static-pages/constructor/pricingLoader.ts`
- `src/pricing/engine.ts`
- `src/pricing/delivery.ts`
- `src/pricing/assembly.ts`
- `src/pricing/materialPricing.ts`
- `src/static-pages/constructor/adapters/productionPricingPreview.ts`

Important behavior:
- The quote can use production-panel pricing if a production preview snapshot exists.
- Delivery and assembly are added on top of base/project pricing.
- The code already supports the accurate-price direction, but later stages must verify every new zone/3D action updates the same pricing source.

## 6. Active checkout/order flow

### Static constructor checkout

Active submit hook:
- `src/static-pages/constructor/hooks/useConstructorSubmit.ts`

Payload adapter:
- `src/static-pages/constructor/adapters/constructorPayload.ts`

Shared order client:
- `src/shared/lib/order.ts`

Server endpoint:
- `api/orders.ts`

Server-side order path:
- validates origin/rate-limit/honeypot/order payload;
- recalculates server price;
- builds production export;
- inserts order into Supabase;
- sends manager email;
- sends customer email if manager path succeeded;
- logs customer email failure without failing a successful manager/order path.

## 7. File classification

### Active

- `src/App.tsx`
- `src/main.tsx`
- `src/static-pages/*`
- `src/static-pages/constructor/**`
- `src/shared/**`
- `src/pricing/**`
- `src/constructor/geometry/**`
- `src/constructor/production/**`
- `api/**`
- `supabase/**`
- `public/**`
- `src/styles/base.css`
- `src/styles/header.css`
- `src/styles/info-pages.css`
- `src/styles/constructor.css`
- `src/styles/constructor3d.css`
- `src/index.css`

### Legacy / needs consolidation

- `src/configurator/ConfiguratorPage.tsx`
- `src/configurator/CheckoutDrawer.tsx`
- `src/configurator/ConfigHeader.tsx`
- `src/configurator/HorizontalStepper.tsx`
- `src/configurator/Visualization.tsx`
- `src/configurator/three/**`
- `src/configurator/store/**`
- `src/configurator/state/**`
- `src/configurator/model/**`

Reason: this module is not routed by `src/App.tsx`, but many scripts/tests still reference it. It must be treated carefully and removed only after active replacements and test migration.

### Archive/history candidates

The repository root contains 105 stage report/class files. These are not runtime files and should move to `docs/history` during Stage 2.

Examples:
- `STAGE_CONSTRUCTOR_*`
- `STAGE_R*_*`
- `STAGE_N*_*`
- `razmerno_constructor_stage*_classes.txt`
- `razmerno_home_v*_classes.txt`

### Delete candidates after QA

Potential candidates, not for immediate deletion in Stage 1:
- old root stage/class files after moving useful history to `docs/history`;
- inactive legacy `src/configurator/**` after active route and tests are migrated;
- duplicate old scene/fallback components after Stage 3/4 confirms active 3D/2D path;
- old CSS selectors tied only to inactive classes.

## 8. Duplicate logic found

### Constructor components

There are two constructor families:

1. `src/static-pages/constructor/**` — current active/future branch.
2. `src/configurator/**` — older branch with its own header, stepper, checkout drawer, store bridge, viewer and fallback.

### Viewer components

Duplicate viewer families:

1. `src/static-pages/constructor/three/**`
2. `src/configurator/three/**`

### Fallback logic

Duplicate fallback families:

1. static constructor SVG/realistic/fallback components;
2. old `src/configurator/Visualization.tsx` and `ProductionModel2DView.tsx`.

### Checkout/order UI

Duplicate checkout UI families:

1. `src/static-pages/constructor/components/Checkout*`
2. `src/configurator/checkout/*`

### Pricing helpers

There are several valid pricing layers, but they need stricter separation:

- `src/pricing/**` — current pricing engine/catalog layer.
- `src/static-pages/constructor/adapters/productionPricingPreview.ts` — active adapter.
- `src/constructor/pricing.ts`, `src/constructor/quickEstimate.ts`, `src/shared/lib/estimate.ts`, `src/shared/lib/price.ts` — need classification during later cleanup.

## 9. Important risks found

### High risk — dual active constructor routes

`/constructor` and `/configurator` point to `ConstructorPage`, while `/constructor-3d` and aliases point to `Constructor3DPage`. The user-facing route is not yet unified around the approved 3D-first experience.

### High risk — active autosave still exists despite the new decision to postpone autosave

`src/static-pages/constructor/hooks/useConstructorDraftLifecycle.ts` is used by `ConstructorPage`. It saves constructor drafts to `localStorage` after 500ms and restores on load. The user has now decided to postpone autosave. This should be removed/disabled in a later scoped stage, not as an unplanned Stage 1 change.

### High risk — legacy `src/configurator/**` still influences QA scripts

`npm run qa:static` fails partly because it checks `src/configurator/CheckoutDrawer.tsx`, even though the active route uses `src/static-pages/ConstructorPage.tsx` / `Constructor3DPage.tsx`. This is a sign that QA scripts still target old code paths.

### Medium risk — root documentation files required by QA are missing

`QA_MANUAL_CHECKLIST.md`, `DEPLOYMENT_PRODUCTION.md`, `FURNITURE_LOGIC_QA.md` are required by `scripts/qa-static-checks.mjs`, but are absent in the root.

### Medium risk — old tests expect old ThreeLayoutMarkers mount

`npm run test:three-layout-markers` fails 1/4 because the old `src/configurator/three/ThreeViewer.tsx` no longer includes `<ThreeLayoutMarkers />`. This is likely stale relative to the newer static-pages 3D branch.

### Medium risk — browser tests cannot run in this environment

`npm run test:browser` fails because Playwright browsers are not installed in the runtime. This is an environment limitation, not an app failure.

### Medium risk — CSS accumulation

`constructor.css` and `constructor3d.css` contain many stage marker classes. They need cleanup after the active route is consolidated.

### Low risk — build bundle size

Production build passes, but `price-catalog` and `three-core` chunks are large. Not a blocker for Stage 1, but this remains a performance topic.

## 10. Checks performed

| Check | Result | Notes |
|---|---:|---|
| `npm install --no-audit --no-fund` | passed | Warning: `three-mesh-bvh@0.7.8` deprecated due three.js compatibility. |
| `npm run typecheck` | passed | TypeScript passes. |
| `npm run build` | passed | Vite build passes. Large chunks visible. |
| `npm run validate:config` | passed | Config ids and manifest hashes valid. |
| `npm run test:ui-e2e` | passed | 5/5 passed. |
| `npm run test:pricing-final` | passed | 3/3 passed. |
| `npm run test:three-final` | passed | 2/2 passed. |
| `npm run test:geometry` | passed | 29/29 passed. |
| `npm run test:layout-state` | passed | 2/2 passed. |
| `npm run test:compartment-ui` | passed | 2/2 passed. |
| `npm run test:three-layout-markers` | failed | 3/4 passed; stale old viewer expectation. |
| `npm run qa:static` | failed | Missing root docs + old `src/configurator/CheckoutDrawer.tsx` string check. |
| `npm run test:browser` | blocked/failed | Playwright browser executable is not installed in this environment. |

Successful directly executable checks: 10/13 = 77%.
If Playwright is treated as environment-blocked rather than app-failed: 10/12 = 83%.

## 11. Stage 1 completion status

### Task 1.1 — active branch identified

Done.

### Task 1.2 — file structure revision

Done at audit level. Actual moving/deletion belongs to Stage 2.

### Task 1.3 — duplicate old logic found

Done. Main duplicate families documented.

### Task 1.4 — baseline checks

Done. Passing/failing checks documented.

## 12. Recommendation before Stage 2

Stage 2 should not start by deleting everything. Safe order:

1. Move root stage/class report files to `docs/history`.
2. Add or restore required root QA docs if they are still required by scripts.
3. Decide whether `qa:static` should target active `src/static-pages/constructor/**` instead of old `src/configurator/**`.
4. Keep legacy `src/configurator/**` until active tests are migrated or deleted deliberately.
5. Only then delete old runtime code.
