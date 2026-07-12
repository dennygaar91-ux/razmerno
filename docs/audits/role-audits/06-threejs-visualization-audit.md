# Role Audit — Three.js / Visualization

## Scope

Роль владеет customer-facing 3D scene, camera/framing, selection overlays, WebGL fallback, material/texture presentation и visual runtime usability inside active constructor path.

## Sources Reviewed

- `docs/specification/volume-03-visualization/README.md`
- `docs/specification/volume-09-architecture/README.md`
- `docs/planning/current-backlog.md`
- `docs/planning/accepted-backlog-decisions-v1.md`
- `src/static-pages/constructor/three/**`
- `src/static-pages/constructor/components/ConstructorScene*.tsx`
- `src/static-pages/constructor/components/ThreeSceneBoundary.tsx`
- `src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx`
- `src/configurator/three/**`
- `tests/browser/webgl-fallback.spec.ts`
- `tests/browser/material-texture-parity.spec.ts`
- `docs/visualization/webgl-fallback-e2e-report-v1.md`
- `docs/visualization/material-texture-parity-report-v1.md`

## Current State

- Active constructor имеет dedicated Three.js layer в `src/static-pages/constructor/three/**`.
- Есть scene adapter, camera helpers, quality hooks, WebGL availability hook и selection layer.
- Есть scene-related UI components: render switch, status, validation card, production debug, fallback/status.
- Legacy/older visualization layer также остаётся в `src/configurator/three/**`.
- В tests и docs присутствует отдельное подтверждение по WebGL fallback и material/texture parity.

## RPES Alignment

- Three.js действительно рассматривается как main visual interface, а не просто cosmetic preview.
- WebGL fallback выделен как отдельный usable path, а не hidden failure mode.
- Scene связан с material presentation, selection and structure awareness, что соответствует RPES III.

## Backlog Alignment

- `P0-05 Three.js Stability`
- `P0-06 WebGL / 2D Fallback`
- `P1-10 WebGL Fallback E2E`
- `P1-13 Material / Texture Parity`
- `P2-26 Vercel Visual QA Findings Implementation Follow-ups`
- `P2-26A Scene Overlay Marker Density Pass`
- `P2-26B WebGL Fallback Visual Layout Pass`
- `P2-26C Scene Framing / Camera Fit Pass`
- `M8-P0-03 Three.js runtime stability and fallback readiness`
- `M9-P1-07 Performance baseline`

## Gaps

- В repo остаются две visualization families: active `src/static-pages/constructor/three/**` и older `src/configurator/three/**`.
- Backlog keeps open visual polish/follow-up work for overlays, fallback layout and camera framing.
- Data/state parity по materials и fallback E2E есть, но pixel-level or human-reviewed visual closure не подтверждён audit scope.
- Performance baseline and broader runtime/perf evidence against RPES III still remain separate tasks.

## Risks

- UX risk: overlay density or camera fit can degrade customer trust even when functional tests stay green.
- Technical risk: parallel old/new visualization layers increase maintenance and import-boundary risk.
- Release risk: fallback may be functionally valid but visually weak on unsupported devices.

## Recommended Next Tasks

- Отдельно картировать old/new visualization ownership and allowed dependency boundaries.
- Выполнить screenshot/human-review pass for scene framing, overlay density and fallback layout.
- Подготовить performance baseline evidence for heavy scene scenarios.
- Уточнить which visualization files are active-route critical and which are legacy/quarantine.

## Evidence Required for Closure

- browser screenshot evidence across target viewports
- explicit human visual approval
- runtime/performance evidence for scene/fallback critical flows
- main verification that active routes still use intended visualization layer

## Do Not Touch

- scene behavior, labels/markers policy or fallback UX without accepted decision
- production or pricing logic while addressing visual findings
- broad Three.js refactor in docs-only scope
- mobile redesign outside explicit task
