# P1-13 Material / Texture Parity — report v1

## 1. Executive Summary

P1-13 continues the already-started Material / Texture Parity task for active Constructor3D. The scope is visual/rendering parity only: the material selected in UI must be reflected by constructor state, 3D preview markers, WebGL fallback/SVG markers, and submit-compatible state.

Final status: **closed in `main`** after PR #46, GitHub Actions QA success, merge and main content verification.

## 2. Previous Partial Implementation

The previous pass added partial runtime/test-marker coverage but stopped before closure. The preserved branch work includes:

- material selection markers in `src/static-pages/constructor/components/MaterialsStepPanel.tsx`;
- 3D preview markers in `src/static-pages/constructor/three/ThreeFurnitureViewer.tsx`;
- browser spec `tests/browser/material-texture-parity.spec.ts`;
- guard-script `scripts/check-p1-13-material-texture-parity.mjs`.

Known previous incident: GitHub issue #1 was modified accidentally in the previous pass. This continuation did not touch GitHub issues.

## 3. Current Material / Texture Behavior

Current material flow:

```text
Material UI selection
↓
buildProjectMaterials / constructor store canonical material ids
↓
threeInput bodyMaterialId / facadeMaterialId
↓
ThreeFurnitureViewer input.material / input.facadeMaterial
↓
3D preview data markers
↓
TwoDFallbackScene input.material / input.facadeMaterial
↓
ConstructorRealisticSvgModel data-material / data-facade-material
↓
submit-compatible state materials.bodyId / materials.facadeId
```

The implementation does not introduce a new material catalog, pricing logic, API contract, Supabase contract, production BOM, or texture asset pipeline.

## 4. Material Parity Contract

P1-13 uses the following minimal contract:

```text
UI material selection
↓
canonical materialId in constructor state
↓
same materialId in 3D preview marker
↓
same materialId in fallback preview marker/state
↓
same materialId remains available before submit
↓
submit-compatible state does not lose selected material
```

For MVP parity, pixel-perfect visual texture comparison is intentionally out of scope. The proof is rendering-state parity through stable E2E markers.

## 5. Data Flow Map

- UI marker: `data-testid="materials-step-panel"` + `data-selected-material`.
- Body material swatch marker: `data-testid="material-swatch-[materialId]"`.
- 3D preview marker: `data-testid="constructor-3d-preview"` + `data-rendered-material`.
- Fallback root marker: `data-testid="webgl-fallback-preview"`.
- SVG fallback marker: `data-material` and `data-facade-material`.
- Submit state proof: intercepted `/api/orders` request contains `materials.bodyId`.

## 6. 3D Preview Parity

`ThreeFurnitureViewer` exposes the selected body and facade material through stable DOM markers:

- `data-rendered-material={input.material}`;
- `data-rendered-facade-material={input.facadeMaterial}`;
- `data-material-id={input.material}`;
- `data-facade-material-id={input.facadeMaterial}`.

The E2E test selects two different canonical material IDs and verifies the marker changes accordingly.

## 7. Fallback Preview Parity

The fallback path already routes selected material IDs into `ConstructorRealisticSvgModel`. P1-13 proves the selected body material through:

- `data-testid="webgl-fallback-preview"` on fallback root;
- descendant SVG/model marker `[data-material]`;
- WebGL-off simulation path `/configurator-3d?rzm_webgl=off`.

## 8. E2E Coverage

Added/continued browser spec:

```text
tests/browser/material-texture-parity.spec.ts
```

Covered scenarios:

1. Open `/configurator-3d`.
2. Go to Materials step.
3. Select material A.
4. Verify 3D preview marker reflects material A.
5. Select material B.
6. Verify 3D preview marker reflects material B.
7. Verify material selection persists across step navigation.
8. Force WebGL unavailable.
9. Verify fallback SVG marker reflects selected material.
10. Verify fallback does not revert to default material.
11. Verify submit path remains available and payload retains selected material.
12. Avoid legacy `/configurator` route and legacy selectors.

Materials covered:

- `ldsp-egger-h1910-buk-lugovoy-st9`;
- `ldsp-egger-u780-seryy-monumentalnyy-st9`.

## 9. Guard-script Coverage

Guard-script:

```text
scripts/check-p1-13-material-texture-parity.mjs
```

It checks:

- required P1-13 files exist;
- `/configurator-3d` is used;
- legacy `/configurator` is not used as an active route;
- at least two canonical materials are tested;
- material IDs exist in the catalog;
- material selection markers exist;
- 3D preview markers exist;
- fallback/SVG material markers exist;
- package scripts exist;
- QA workflow steps exist;
- P1-09 and P1-10 scripts remain present.

## 10. Package Scripts

Added required scripts:

```bash
npm run check:material-texture-parity
npm run test:material-texture-parity
```

Package commands:

```json
"check:material-texture-parity": "node scripts/check-p1-13-material-texture-parity.mjs"
"test:material-texture-parity": "playwright test tests/browser/material-texture-parity.spec.ts --project=chromium-desktop"
```

P1-09 and P1-10 package scripts are preserved.

## 11. QA Workflow Integration

Added required explicit steps to `.github/workflows/qa.yml`:

```text
P1-13 Material / Texture parity guard
P1-13 Material / Texture parity E2E
```

The commands run after P1-10 and after Playwright Chromium installation:

```bash
npm run check:material-texture-parity
npm run test:material-texture-parity
```

## 12. CI Evidence

Final PR head that passed GitHub Actions QA:

```text
08a471503ece858fa887cbe8b47c5d3f2ea289b1
```

GitHub Actions QA evidence:

- PR: #46 `P1-13 Material / Texture Parity`;
- QA run number: #200;
- run id: `27620370555`;
- job: `Fast CI gate`;
- job id: `81667288718`;
- result: `success`;
- merge commit: `7be24a586a3541fab2cdf9e23fa2cc8cedefc2b3`.

Commands explicitly executed by CI:

```bash
npm run check:material-texture-parity
npm run test:material-texture-parity
```

Relevant successful CI steps:

- Typecheck frontend;
- Typecheck API;
- Build frontend;
- Fast active tests;
- P1-09 Constructor3D submit E2E guard;
- P1-09 Constructor3D submit E2E;
- P1-10 WebGL fallback E2E guard;
- P1-10 WebGL fallback E2E;
- P1-13 Material / Texture parity guard;
- P1-13 Material / Texture parity E2E;
- Coverage snapshot;
- Check CSS architecture;
- Check production geometry architecture.

## 13. Remaining Risks

- No pixel-perfect visual texture comparison is included; this is intentionally deferred beyond P1-13.
- The proof is based on canonical rendering-state markers rather than image snapshots.
- Fallback parity is proven through SVG state markers, not through a production-grade engineering 2D drawing mode.

## 14. Closure Review

P1-13 is closed because:

- PR #46 was opened and merged;
- GitHub Actions QA completed successfully on final PR head;
- CI logs/job steps show both P1-13 commands executed successfully;
- backlog is updated with final PR/CI/merge evidence;
- PR is merged into `main`;
- main content verification confirms all P1-13 files are present;
- GitHub issues were not modified in this continuation.
