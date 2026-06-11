# Stage 2 — Cleanup active code without UX changes

Date: 2026-06-10
Source archive: `razmerno-constructor-stage01-technical-stabilization.zip`
Scope: safe cleanup only; no constructor UX redesign, no pricing/order/3D business logic changes.

## 1. What changed

### 1.1 Root historical artifacts moved out of runtime root

Moved 106 root-level historical files into `docs/history/**`:

- `STAGE_*.txt` and `STAGE_*.md` → `docs/history/stage-reports/`
- `razmerno_*_classes.txt` → `docs/history/class-inventories/`

A machine-readable manifest was added:

- `docs/history/STAGE_02_ROOT_ARTIFACTS_MOVE_MANIFEST.json`

This removes root-level historical noise without deleting project history.

### 1.2 Root QA handoff documents restored

Added the root files required by `scripts/qa-static-checks.mjs`:

- `QA_MANUAL_CHECKLIST.md`
- `DEPLOYMENT_PRODUCTION.md`
- `FURNITURE_LOGIC_QA.md`

These are intentionally root-level because the existing static QA script requires them there.

### 1.3 Static QA script made compatible with extracted checkout consent component

Updated `scripts/qa-static-checks.mjs` so it validates privacy consent across the legacy checkout flow after the submit block was extracted:

- `src/configurator/CheckoutDrawer.tsx`
- `src/configurator/checkout/CheckoutSubmitBlock.tsx`

The previous check incorrectly required privacy text and `personalData` to be present directly in `CheckoutDrawer.tsx`, even though consent UI now lives in `CheckoutSubmitBlock.tsx`.

### 1.4 Legacy 3D marker style restored for current test bridge

Added minimal `.three-plus-marker` styles to `src/index.css` because the legacy marker test expects the marker class to be present in the global CSS layer while old `src/configurator/**` tests are still active.

This is a compatibility repair, not a UX redesign.

## 2. What was deliberately not changed

### 2.1 No active constructor UX changes

No layout, visible flow, pricing, checkout behavior, 3D behavior or order flow was intentionally changed in this stage.

### 2.2 No deletion of `src/configurator/**`

The legacy configurator module remains in place because tests and scripts still reference it. It is still a migration risk, but deleting it now would be unsafe.

### 2.3 No CSS dead-selector purge yet

A deep selector purge was not performed because it requires route-by-route visual QA. Stage 2 only removed root-level historical noise and fixed QA compatibility.

## 3. File cleanup summary

| Category | Action | Count |
|---|---:|---:|
| Root stage reports/audits | moved to `docs/history/stage-reports` | 56 |
| Root class inventories | moved to `docs/history/class-inventories` | 50 |
| Root QA handoff docs | added/restored | 3 |
| Static QA script | updated | 1 |
| Legacy marker CSS | restored | 1 |

Total historical root artifacts moved: 106.

## 4. Checks

Passed:

- `npm install --no-audit --no-fund`
- `npm run typecheck`
- `npm run build`
- `npm run check:root-docs`
- `npm run qa:static`
- `npm run validate:config`
- `npm run test:three-layout-markers`
- `npm run test:ui-e2e`
- `npm run test:pricing-final`
- `npm run test:three-final`
- `npm run test:geometry`
- `npm run test:layout-state`
- `npm run test:compartment-ui`

Blocked / not counted as application failure:

- `npm run test:browser` was attempted but did not complete inside the current tool timeout. It spawned Vite preview and began the Playwright suite, but the run was stopped by the environment timeout before usable per-test failure details were produced.

## 5. Remaining risks

### High

- Two constructor branches still exist: current `/constructor` / `/configurator` and newer `/constructor-3d` / `/configurator-3d`.
- `src/configurator/**` is still a legacy dependency for tests and scripts.
- Autosave/draft lifecycle still exists in code and should be addressed later according to the updated product decision.

### Medium

- `src/index.css` still contains legacy/shared selectors and needs a later design-system cleanup after active route consolidation.
- Browser tests need a dedicated successful run in an environment with enough time and Playwright support.

### Low

- Historical files are preserved under `docs/history/**`, so repository size is not reduced much yet; the cleanup primarily reduces active-root noise.

## 6. Stage 2 conclusion

Stage 2 completed the safe cleanup scope without changing the active product UX. The project root is now cleaner, root-doc static QA passes, the stale privacy-consent check is corrected, and the previously failing legacy 3D marker style test now passes.
