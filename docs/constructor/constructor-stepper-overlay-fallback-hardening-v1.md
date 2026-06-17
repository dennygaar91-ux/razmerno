# Constructor Stepper + Scene Overlay Scale + WebGL Fallback Layout Hardening v1

## Scope

Implementation stage after Vercel Visual QA Screenshots #2 for Constructor3D visual release blockers.

Source visual evidence before this iteration:

- Workflow run id: `27677120045`
- Commit SHA: `c48f1f8c8631ab14c8670e122968d4a7e1d9e6b7`
- Branch/ref: `main`
- Screenshots: `37/37`
- Capture status: technical PASS, visual release readiness FAIL

This implementation targets:

- Constructor stepper readability;
- scene overlay label / add marker scale and density;
- WebGL / blueprint fallback layout.

## Findings addressed

| Finding | Starting status after VQA #2 | Implementation status in this PR | Closure status |
| --- | --- | --- | --- |
| VQA-001 | partial | further hardened | ready for screenshot verification |
| VQA-002 | open | overlay scale/density reduced | ready for screenshot verification |
| VQA-003 | open | stepper sublabels hidden, labels constrained, responsive modes strengthened | ready for screenshot verification |
| VQA-004 | partial | scene-first hierarchy preserved, overlays made quieter | ready for screenshot verification |
| VQA-005 | partial | fallback status/preview/actions separated and random chip hidden in fallback | ready for screenshot verification |

No finding is marked closed in this document because closure requires a fresh screenshot artifact after implementation.

## What changed

Added `src/styles/constructor3d/98-stepper-overlay-fallback-hardening.css` as the last Constructor3D CSS layer.

The new layer:

- hides secondary stepper sublabels to prevent desktop/tablet collisions;
- constrains step title overflow and keeps active state readable;
- keeps mobile stepper compact-first with active step summary from the previous shell work;
- reduces default scene labels from dominant pills to small helper badges;
- keeps selected/hovered labels slightly stronger while still compact;
- reduces `+` marker size on desktop/tablet/mobile;
- reduces random helper chip scale;
- separates fallback status, preview and actions into predictable grid rows;
- prevents fallback actions and random chip from overlaying the SVG/2D preview;
- avoids clipped fallback status text on mobile.

Imported the new CSS layer from `src/styles/constructor3d.css` after `97-mobile-visual-hardening.css`.

## Scope guard

Not changed:

- pricing engine;
- server/client price logic;
- checkout submit logic;
- API order flow;
- Supabase;
- order payload contract;
- production/manufacturing logic;
- drilling/hardware/material pricing logic;
- WebGL detection contract;
- Three.js geometry generation;
- camera/math/product model generation;
- GitHub issues;
- package.json;
- GitHub workflows.

## Changed files

- `src/styles/constructor3d.css`
- `src/styles/constructor3d/98-stepper-overlay-fallback-hardening.css`
- `docs/constructor/constructor-stepper-overlay-fallback-hardening-v1.md`

## QA plan

Required checks after PR creation:

- GitHub Actions QA / Fast CI gate;
- existing Constructor3D submit E2E guard and test if present in workflow;
- existing WebGL fallback E2E guard and test if present in workflow;
- existing material/texture parity checks if present in workflow;
- build/typecheck as included in QA workflow.

Local QA was not run in this GitHub-only pass.

## Visual verification requirement

After PR QA and merge, run Vercel Visual QA Screenshots again.

Minimum screenshots to inspect:

- `configurator-3d__desktop-1440.png`
- `configurator-3d__laptop-1280.png`
- `configurator-3d__tablet-768.png`
- `configurator-3d__mobile-390.png`
- `configurator-3d__mobile-375.png`
- `configurator-3d-webgl-fallback__desktop-1440.png`
- `configurator-3d-webgl-fallback__mobile-390.png`

Acceptance for closure:

- no stepper overlap;
- active step readable;
- model visually dominates overlays;
- labels and `+` markers are compact and non-debug-like;
- fallback mobile is not clipped/crowded;
- fallback actions do not cover preview;
- 3D-first hierarchy is preserved.

## Current status

Technical implementation: completed in branch `constructor-stepper-overlay-fallback-hardening`.

Visual status: pending fresh screenshot verification.

Backlog status: `P2-26` remains open until screenshot artifact evidence confirms VQA-001—VQA-005. A targeted `current-backlog.md` status note is still required before final closure of the stage if this PR is accepted.
