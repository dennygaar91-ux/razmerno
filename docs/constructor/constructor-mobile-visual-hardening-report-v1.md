# Constructor Mobile Visual Hardening Report v1

## Scope

Implementation stage for Constructor UX/UI shell findings from `docs/ux/vercel-visual-qa-findings-v1.md`.

Primary scope:

- VQA-001 mobile constructor shell collapse;
- VQA-002 oversized scene labels/add markers;
- VQA-003 constructor stepper overlap/readability;
- VQA-004 mobile 3D-first hierarchy violation;
- VQA-005 crowded/clipped WebGL fallback mobile state.

Secondary safe scope:

- VQA-006 desktop fallback crowding, partially through shared fallback spacing;
- VQA-007 runtime/price status text concatenation;
- VQA-008 weak contrast for `Выйти на сайт`;
- VQA-009 scene composition/framing, lightly through scene/container constraints.

Out of scope:

- pricing engine;
- API/order business logic;
- Supabase/order flow;
- production/manufacturing logic;
- package.json;
- GitHub workflows;
- GitHub issues;
- full visual redesign;
- Three.js runtime/model generation architecture.

## What changed

- Added a mobile active-step summary to `ConstructorStagebar` so narrow layouts can show progress without crowded sublabels.
- Added a final targeted CSS layer: `src/styles/constructor3d/97-mobile-visual-hardening.css`.
- Imported the new CSS layer last from `src/styles/constructor3d.css`.
- Reordered the mobile Constructor3D workspace visually so the scene appears before controls.
- Converted the mobile drawer into a compact bottom-sheet-like panel with bounded scrolling and sticky price/CTA footer.
- Reduced mobile/tablet scene labels and add markers so overlays stop dominating the furniture model.
- Improved WebGL fallback layout for mobile: status, SVG preview and actions no longer compete for the same edge space.
- Added runtime/price status spacing to prevent text concatenation such as `3D недоступноСтоимость обновлена`.
- Strengthened `Выйти на сайт` contrast through existing dark/white design tokens.

## Findings status

| Finding | Status | Notes |
| --- | --- | --- |
| VQA-001 | Implemented, pending fresh screenshot verification | Header/stepper/scene/drawer hierarchy hardened for mobile. |
| VQA-002 | Implemented, pending fresh screenshot verification | Labels and plus markers reduced; non-selected mobile labels compacted. |
| VQA-003 | Implemented, pending fresh screenshot verification | Tablet/mobile stepper modes added through CSS and active summary markup. |
| VQA-004 | Implemented, pending fresh screenshot verification | Mobile visual order is now scene-first; controls are secondary. |
| VQA-005 | Implemented, pending fresh screenshot verification | Fallback mobile layout now uses status / preview / actions rows. |
| VQA-006 | Partially implemented | Shared fallback spacing improves desktop too; no separate desktop visual re-capture yet. |
| VQA-007 | Implemented, pending fresh screenshot verification | Runtime and quote status now have flex gap/wrap and visual separator. |
| VQA-008 | Implemented, pending fresh screenshot verification | Exit button contrast strengthened without new tokens. |
| VQA-009 | Partially implemented | Scene container/framing constraints improved; no Three.js runtime/camera changes. |
| VQA-010 | Not touched | Admin protected screen remains outside this Constructor shell stage. |

## Changed files

- `src/static-pages/constructor/components/ConstructorStagebar.tsx`
- `src/styles/constructor3d.css`
- `src/styles/constructor3d/97-mobile-visual-hardening.css`
- `docs/constructor/constructor-mobile-visual-hardening-report-v1.md`

## Backlog status

`docs/planning/current-backlog.md` was not changed in this implementation PR. `P2-26 Vercel Visual QA Findings Implementation Follow-ups` remains open until a fresh screenshot artifact verifies the visual result.

## QA commands

Planned minimum checks after PR creation:

- `npm run typecheck`
- `npm run build`
- relevant constructor checks available in the current repository scripts without package/workflow changes.

Package scripts and workflows were intentionally not changed in this implementation stage.

## Risk notes

- This stage is CSS/layout-first and does not include fresh screenshot artifact generation.
- P2-26 should not be fully closed until a new Vercel screenshot pass confirms the visual result across the required viewports.
- Scene overlay reduction is intentionally conservative and does not modify Three.js runtime label placement logic.
- The accidental temporary `.keep-probe` write to `main` was immediately removed; the final implementation branch does not rely on that file and no functional project file was changed in main by that probe.

## Follow-up backlog

- Keep P2-26 open until fresh screenshot artifact verification.
- After PR merge, run Vercel Visual QA screenshot pipeline again and compare `/configurator-3d` mobile/tablet/fallback screenshots.

## PR evidence

To be completed after PR creation and GitHub Actions QA completion:

- PR: pending.
- Branch: `constructor-mobile-visual-hardening-vqa`.
- Final commit SHA: pending.
- GitHub Actions QA run id: pending.
