# Constructor Overlay + Stepper Mobile Simplification v1

## Scope

Targeted Constructor3D presentation implementation after Vercel Visual QA artifact `27685109856` confirmed that VQA-001..VQA-005 remain open or partial after PR #57.

This is not a redesign. This stage is limited to Constructor3D stepper readability, scene overlay density and WebGL fallback presentation.

## Source evidence

- Previous merged PR: #57 `Constructor Stepper, Scene Overlay and Fallback Hardening`.
- Merge commit checked by fresh screenshot artifact: `d8365412f84f3ceca5e7329ca17cffb8b0309c3f`.
- Vercel Visual QA Screenshots run id: `27685109856`.
- Technical capture: PASS.
- Visual readiness: FAIL.

## What changed

- Added final CSS layer `src/styles/constructor3d/99-overlay-stepper-fallback-simplification.css`.
- Imported that layer after `98-stepper-overlay-fallback-hardening.css`.
- Mobile/tablet stepper now uses number-first presentation; step text is carried by the active-step summary instead of cramped pills.
- Runtime badge is constrained on mobile to prevent edge clipping.
- Scene labels and plus markers are scaled down further across desktop/tablet/mobile.
- Inactive labels are quieter; selected/hovered labels remain visible but constrained.
- WebGL fallback hides overlay chips that were competing with the blueprint preview.
- Fallback status, preview and actions are kept in separate rows.

## VQA status after implementation

This PR does not close VQA-001..VQA-005 by itself.

- VQA-001: implementation adjusted; pending screenshot verification.
- VQA-002: implementation adjusted; pending screenshot verification.
- VQA-003: implementation adjusted; pending screenshot verification.
- VQA-004: implementation adjusted; pending screenshot verification.
- VQA-005: implementation adjusted; pending screenshot verification.

## Changed files

- `src/styles/constructor3d.css`
- `src/styles/constructor3d/99-overlay-stepper-fallback-simplification.css`
- `docs/constructor/constructor-overlay-stepper-mobile-simplification-v1.md`

## Out of scope

- Pricing engine.
- API/order flow.
- Supabase.
- Production/manufacturing logic.
- Three.js geometry/runtime detection logic.
- package.json.
- GitHub workflows.
- GitHub issues.
- Landing/info/admin pages.

## QA requirement

Required before merge:

- GitHub Actions QA success.
- Typecheck/build success through QA workflow.
- Existing Constructor3D submit E2E success.
- Existing WebGL fallback E2E success.
- Existing material/texture parity success.

## Visual verification requirement

After merge, run Vercel Visual QA Screenshots on `main` and verify at minimum:

- `configurator-3d__desktop-1440.png`
- `configurator-3d__laptop-1280.png`
- `configurator-3d__tablet-768.png`
- `configurator-3d__mobile-390.png`
- `configurator-3d__mobile-375.png`
- `configurator-3d-webgl-fallback__desktop-1440.png`
- `configurator-3d-webgl-fallback__mobile-390.png`

## Backlog status

`P2-26` remains open until fresh screenshot artifact verifies the result.
