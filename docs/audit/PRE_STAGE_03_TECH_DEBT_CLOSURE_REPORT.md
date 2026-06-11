# Pre-Stage 3 — Technical debt closure

Date: 2026-06-10
Source archive: `razmerno-constructor-stage02-cleanup-active-code.zip`

## Goal

Close the technical debt found after Stage 2 before starting Stage 3. No Stage 3 runtime-stability work was started in this pass.

## Completed

### 1. Primary constructor route fixed

`src/App.tsx` now treats the 3D-first constructor as the primary constructor experience:

- `/constructor`
- `/constructor.html`
- `/configurator`
- `/constructor-3d`
- `/constructor3d`
- `/configurator-3d`

all resolve to `Constructor3DPage`.

The old constructor remains available only through explicit legacy routes:

- `/constructor-legacy`
- `/configurator-legacy`

This removes the product risk where the user-facing constructor and the 3D-first constructor could diverge.

### 2. Autosave disabled before Stage 3

Autosave/draft restore was intentionally disabled for the current MVP pass:

- removed `useConstructorDraftLifecycle(...)` calls from `Constructor3DPage.tsx`;
- removed `useConstructorDraftLifecycle(...)` calls from legacy `ConstructorPage.tsx`;
- converted `useConstructorDraftLifecycle.ts` into a compatibility no-op;
- the hook no longer calls `saveConstructorDraft(...)` or `restoreConstructorDraftToStore(...)`;
- existing old drafts can still be cleared safely through `clearConstructorDraft(...)` if a legacy component calls the seam.

This matches the product decision: autosave is deferred and should not be part of the required MVP before Stage 3.

### 3. Pre-Stage 3 guard added

Added `scripts/check-pre-stage3-debt.mjs` and package script:

```bash
npm run check:pre-stage3-debt
```

The guard checks:

- primary constructor routes render `Constructor3DPage`;
- legacy constructor is reachable only through explicit legacy routes;
- active 3D constructor does not start draft autosave;
- legacy constructor page does not start draft autosave;
- draft lifecycle hook does not save/restore local drafts;
- active 3D viewport test id is preserved.

## Files changed

- `src/App.tsx`
- `src/static-pages/Constructor3DPage.tsx`
- `src/static-pages/ConstructorPage.tsx`
- `src/static-pages/constructor/hooks/useConstructorDraftLifecycle.ts`
- `src/static-pages/constructor/components/ConstructorDraftRow.tsx`
- `scripts/check-pre-stage3-debt.mjs`
- `package.json`
- `package-lock.json`
- `docs/audit/PRE_STAGE_03_TECH_DEBT_CLOSURE_REPORT.md`

## Checks

Passed:

- `npm install --no-audit --no-fund`
- `npm run typecheck`
- `npm run build`
- `npm run qa:static`
- `npm run check:pre-stage3-debt`
- `npm run check:legacy-runtime-imports`
- `node scripts/browser-smoke-static.mjs`
- `npm run validate:config`
- `npm run test:ui-e2e` — 5/5
- `npm run test:pricing-final` — 3/3
- `npm run test:three-final` — 2/2
- `npm run test:geometry` — 29/29
- `npm run test:layout-state` — 2/2
- `npm run test:compartment-ui` — 2/2
- `npm run test:three-layout-markers` — 4/4

Blocked by environment:

- `npm run test:constructor3d-e2e` / Playwright browser tests. Playwright starts the suite, but Chromium executable is not installed in the environment: `/home/oai/.cache/ms-playwright/chromium_headless_shell-1223/...`.

## Remaining technical debt after this pass

### Still open, but no longer blocking Stage 3

1. `src/configurator/**` remains in the repository as legacy/test-backed code. It is not the primary user-facing constructor route anymore.
2. Full browser QA still requires Playwright browser installation in the execution environment.
3. Full CSS cleanup remains deferred until the constructor shell is rebuilt, because aggressive CSS deletion before the shell work is high-risk.
4. Full legacy deletion remains deferred until the new 3D-first branch passes later QA and no tests depend on old modules.

## Stage 3 readiness

Stage 3 can now start safely. The main route points to the 3D-first constructor, autosave is disabled, and a guard exists to prevent these decisions from regressing.
