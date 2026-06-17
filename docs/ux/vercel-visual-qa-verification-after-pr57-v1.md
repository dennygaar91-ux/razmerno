# Vercel Visual QA Verification after PR #57 — Размерно

Дата: 2026-06-17  
Роль: 08 UX/UI / Design System Agent  
Статус: visual verification executed / P2-26 remains open

## 1. Scope

Это UX/UI / Design System visual verification по fresh screenshot artifact после merge PR #57 и PR #60.

В рамках проверки не выполнялись implementation changes, UI/CSS/component changes, Pricing, API, Three.js product/runtime logic, Production/Manufacturing, workflow/package changes и GitHub issues actions.

## 2. Source of truth

- Репозиторий: `https://github.com/dennygaar91-ux/razmerno`
- Главный backlog: `docs/planning/current-backlog.md`
- Проверяемый backlog item: `P2-26 Vercel Visual QA Findings Implementation Follow-ups`
- Previous visual report: `docs/ux/vercel-visual-qa-findings-v1.md`

## 3. Related merges

- PR #57 — `Constructor Stepper, Scene Overlay and Fallback Hardening`
  - implementation merge commit: `d8365412f84f3ceca5e7329ca17cffb8b0309c3f`
- PR #60 — `Harden Vercel Visual QA Screenshot Timeout Diagnostics`
  - pipeline merge commit / artifact commit: `75082c9d595438cd0407ecab287f4a887537667d`

## 4. Fresh artifact evidence

- Workflow: `Vercel Visual QA Screenshots`
- Workflow run id: `27705896411`
- Artifact: `vercel-visual-qa-screenshots-27705896411`
- Artifact id: `7702467233`
- Size: `38,738,945 bytes`
- Digest: `sha256:dd525cc7a3dbb61d959d966baca89d6975f3b71c75bcc0c72d07581ac22f2d9d`
- Branch/ref: `main`
- Commit SHA: `75082c9d595438cd0407ecab287f4a887537667d`
- Expired: `false`
- Expires: `2026-07-01`
- Target URL: `https://razmerno.vercel.app/`

## 5. Manifest summary

```text
Artifact generated: yes
Total planned: 37
Completed: 37
Screenshots written: 37
OK: 37
Warnings: 0
Errors: 0
Timeouts: 0
Failed captures: 0
Skipped captures: 0
Console errors: 0
WebGL fallback captures: 2
```

Interpretation: screenshot capture pipeline is fixed after PR #60. Technical capture status is PASS. Visual verification is still required and is documented below.

## 6. Screenshots checked

Primary VQA screenshots:

- `screenshots/configurator-3d__desktop-1440.png`
- `screenshots/configurator-3d__laptop-1280.png`
- `screenshots/configurator-3d__tablet-768.png`
- `screenshots/configurator-3d__mobile-390.png`
- `screenshots/configurator-3d__mobile-375.png`
- `screenshots/configurator-3d-webgl-fallback__desktop-1440.png`
- `screenshots/configurator-3d-webgl-fallback__mobile-390.png`

Secondary quick scan:

- `home__*`
- `measurements__*`
- `materials__*`
- `assembly__*`
- `configurator__*`
- `admin__*`

Secondary pages were not re-audited in depth because this verification is scoped to VQA-001—VQA-005 after PR #57. Quick scan did not reveal a new blocker on public pages. Admin protected screen remains visually raw/internal and stays covered by the existing P2-25/VQA-010 track.

## 7. VQA status summary

| VQA | Previous severity | Status after PR #57 | Evidence screenshots | Assessment |
|---|---:|---|---|---|
| VQA-001 | Blocker | closed | `configurator-3d__mobile-390.png`, `configurator-3d__mobile-375.png`, `configurator-3d__tablet-768.png` | Mobile constructor shell no longer visually collapses. Header/reset/stepper no longer overlap. Scene is visible before the settings card. |
| VQA-002 | High | partial | `configurator-3d__desktop-1440.png`, `configurator-3d__laptop-1280.png`, `configurator-3d__tablet-768.png`, `configurator-3d__mobile-390.png`, `configurator-3d__mobile-375.png` | Labels/markers are calmer than before, but active `+` and inactive zone bubbles still compete with the model; on mobile the scene crop also makes overlay feel heavier. |
| VQA-003 | High | partial | `configurator-3d__desktop-1440.png`, `configurator-3d__laptop-1280.png`, `configurator-3d__tablet-768.png`, `configurator-3d__mobile-390.png`, `configurator-3d__mobile-375.png` | Mobile/tablet compact stepper is readable; desktop/laptop stepper labels are still visibly truncated (`Разм`, `Напо`, `Мате`, `Заяв`) and therefore not fully closed. |
| VQA-004 | High | closed | `configurator-3d__mobile-390.png`, `configurator-3d__mobile-375.png`, `configurator-3d__tablet-768.png` | Mobile hierarchy now reads as scene-first: user sees working scene/model before detailed settings; price/CTA remain below in settings card. |
| VQA-005 | High | open | `configurator-3d-webgl-fallback__desktop-1440.png`, `configurator-3d-webgl-fallback__mobile-390.png` | Fallback still looks crowded. On mobile the CTA overlays the preview, bottom chip overlaps the drawing, and helper text/preview area feel clipped. Desktop fallback is usable but still crowded at the bottom overlay. |

## 8. Detailed findings

### VQA-001 / Blocker — Mobile constructor shell visually collapses

Status: closed.

Evidence:

- `configurator-3d__mobile-390.png`
- `configurator-3d__mobile-375.png`
- `configurator-3d__tablet-768.png`

Visual assessment:

- Compact constructor header is stable.
- `Сбросить` no longer overlaps title/logo.
- Stepper is separated into its own card and does not collide with header.
- Scene appears before the detailed settings card.
- The page no longer looks like a broken long form at first viewport.

Remaining notes:

- Scene crop could still be improved, but this belongs to VQA-002/scene framing rather than VQA-001 shell collapse.

### VQA-002 / High — Scene labels and + markers oversized / covering model

Status: partial.

Evidence:

- `configurator-3d__desktop-1440.png`
- `configurator-3d__laptop-1280.png`
- `configurator-3d__tablet-768.png`
- `configurator-3d__mobile-390.png`
- `configurator-3d__mobile-375.png`

Visual assessment:

- PR #57 reduces the previous debug-like feeling.
- Inactive labels are quieter than before.
- However, the active orange `+` marker still sits directly on the furniture content and remains visually dominant.
- The inactive numeric marker around the second handle still competes with the model on desktop/tablet.
- On mobile, the model is cropped to the right/bottom, so the marker feels more intrusive than it should.

Remaining issue:

- Need one more visual pass on scene overlay scale/opacity/placement and mobile scene framing.

Recommended owner:

- 06 Three.js / Visualization Agent + 08 UX/UI / Design System Agent.

### VQA-003 / High — Constructor stepper overlaps / loses readability

Status: partial.

Evidence:

- `configurator-3d__desktop-1440.png`
- `configurator-3d__laptop-1280.png`
- `configurator-3d__tablet-768.png`
- `configurator-3d__mobile-390.png`
- `configurator-3d__mobile-375.png`

Visual assessment:

- Mobile compact stepper is now readable and does not overlap.
- Tablet stepper is also acceptable in compact mode.
- Desktop/laptop stepper no longer visually collides, but labels are still truncated: `Разм`, `Напо`, `Мате`, `Заяв`.
- This means the stepper is technically stable but not fully readable on larger layouts.

Remaining issue:

- Desktop/laptop stepper should either show full labels or intentionally switch to a shorter, designed label system. Current truncation looks accidental.

Recommended owner:

- 08 UX/UI / Design System Agent + 02 Constructor Agent.

### VQA-004 / High — Mobile constructor violates 3D-first hierarchy

Status: closed.

Evidence:

- `configurator-3d__mobile-390.png`
- `configurator-3d__mobile-375.png`
- `configurator-3d__tablet-768.png`

Visual assessment:

- Mobile flow now starts with constructor context, status, stepper and working scene.
- User sees model/scene before detailed parameters.
- Settings card, price and CTA are lower in the flow and no longer dominate the first viewport.
- The product feels closer to a visual configurator, not just a dense parameter form.

Remaining notes:

- Scene overlay polish remains under VQA-002.

### VQA-005 / High — WebGL fallback mobile crowded/clipped

Status: open.

Evidence:

- `configurator-3d-webgl-fallback__desktop-1440.png`
- `configurator-3d-webgl-fallback__mobile-390.png`

Visual assessment:

- Fallback is technically captured and clearly intentional.
- Mobile fallback still has visible layout crowding:
  - primary CTA overlays the drawing preview;
  - bottom section chip overlaps the preview area;
  - upper helper text feels clipped behind the preview stack;
  - preview/card hierarchy is too compressed.
- Desktop fallback is more usable but still has crowded bottom overlays and truncated stepper labels.

Remaining issue:

- Fallback needs a dedicated fallback layout pass, especially for mobile.

Recommended owner:

- 06 Three.js / Visualization Agent + 08 UX/UI / Design System Agent.

## 9. Severity changes

Before PR #57 visual verification:

- Blocker: 1
- High: 4

After fresh artifact verification:

- Blocker: 0 for the checked VQA-001—VQA-005 scope.
- High closed: VQA-001, VQA-004.
- High partial: VQA-002, VQA-003.
- High open: VQA-005.

Interpretation:

PR #57 materially improved Constructor3D release safety, especially mobile shell and mobile 3D-first hierarchy. It does not fully close P2-26 because overlay readability, stepper label truncation and fallback crowding remain.

## 10. P2-26 status

P2-26 remains open.

Reason:

- VQA-001: closed.
- VQA-002: partial.
- VQA-003: partial.
- VQA-004: closed.
- VQA-005: open.

P2-26 cannot be closed because fresh screenshots still show unresolved overlay/readability/crowding issues.

## 11. Recommended next step

Run a focused follow-up implementation stage:

Title:

`Constructor Overlay, Stepper Label and WebGL Fallback Visual Polish`

Owners:

- 02 Constructor Agent — shell/stepper component behavior.
- 06 Three.js / Visualization Agent — scene overlay/marker placement and fallback preview composition.
- 08 UX/UI / Design System Agent — responsive visual rules, label hierarchy, fallback layout acceptance.

Scope:

1. Fix desktop/laptop stepper truncation.
2. Reduce/relocate scene labels and `+` markers so they do not dominate the model.
3. Reframe mobile scene to avoid model crop and bottom `мм` clipping.
4. Create dedicated mobile fallback layout where CTA/chips do not overlay the drawing.
5. Re-run Vercel Visual QA Screenshots and perform another visual verification.

## 12. What was not checked and why

- No code implementation was checked beyond visual screenshot output.
- No runtime interaction was manually tested because this task is screenshot-based visual verification.
- No Pricing/API/Production/Manufacturing behavior was checked because it is outside UX/UI visual verification scope.
- No GitHub issues were touched by design.
- Public pages were only quick-scanned, not deeply re-audited, because this verification is scoped to Constructor3D VQA-001—VQA-005.
