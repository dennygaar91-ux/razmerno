# Constructor Mobile VQA Pass 3

## Scope

This is a Constructor presentation-only implementation pass after Vercel Visual QA artifact `27696022541` showed that VQA-001 through VQA-005 were still open or partial after PR #58.

The pass is limited to Constructor3D shell presentation, scene overlay density, mobile stepper readability and WebGL fallback layout.

## Planned

- Make tablet/mobile stepper a true number-first mode.
- Prevent clipped step labels from appearing in mobile screenshots.
- Reduce scene overlay dominance over the wardrobe model.
- Remove static long selected labels from the scene overlay.
- Keep full overlay label text available only on hover.
- Keep WebGL fallback drawing free from floating scene chips, helper text and random controls.
- Keep fallback actions outside the preview overlay.

## Implemented

- Added final CSS layer `100-mobile-vqa-pass.css`.
- Imported `100-mobile-vqa-pass.css` after previous `97`, `98` and `99` layers.
- Added stronger mobile/tablet stepper rules with hidden step copy and compact numbered step buttons.
- Added stronger runtime badge containment rules for narrow viewports.
- Reduced scene label and add-marker size.
- Added fallback rules that hide scene helper/legend/chip/random overlays while fallback is active.
- Updated `ThreeSelectionLayer` presentation so selected markers use short labels in static state; full labels are only shown on hover.

## Not touched

- Pricing engine.
- API / Orders.
- Checkout submit logic.
- Supabase.
- Order payload contract.
- Production / manufacturing logic.
- Furniture geometry generation.
- WebGL detection contract.
- Material / texture parity logic.
- package.json.
- GitHub workflows.
- GitHub issues.

## VQA status after implementation

These statuses are implementation-readiness statuses only. They must not be treated as visual closure before a fresh screenshot artifact is reviewed.

- VQA-001: ready for screenshot verification.
- VQA-002: ready for screenshot verification.
- VQA-003: ready for screenshot verification.
- VQA-004: ready for screenshot verification.
- VQA-005: ready for screenshot verification.

## Required QA

Required before merge:

- GitHub Actions QA success.
- Typecheck frontend.
- Typecheck API.
- Build frontend.
- P1-09 Constructor3D submit E2E.
- P1-10 WebGL fallback E2E.
- P1-13 Material / Texture parity E2E.
- CSS architecture check.
- Production geometry architecture check.

Required after merge:

- Fresh `Vercel Visual QA Screenshots` run on `main`.
- Review at least:
  - `configurator-3d__desktop-1440`
  - `configurator-3d__laptop-1280`
  - `configurator-3d__tablet-768`
  - `configurator-3d__mobile-390`
  - `configurator-3d__mobile-375`
  - `configurator-3d-webgl-fallback__desktop-1440`
  - `configurator-3d-webgl-fallback__mobile-390`

## Backlog note

`P2-26` remains open until a fresh visual artifact confirms closure.
