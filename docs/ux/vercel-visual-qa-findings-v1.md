# Vercel Visual QA Findings v1 — Размерно

Дата: 2026-06-17  
Роль: 08 UX/UI / Design System Agent  
Статус: visual QA review executed / implementation follow-ups open

## 1. Scope

Это UX/UI / Design System review по фактическому GitHub Actions screenshot artifact. В рамках этапа не выполнялись UI/CSS/component fixes, Pricing, API business logic, Three.js runtime/product logic, Production/Manufacturing logic, package/workflow changes и GitHub issues.

Источник истины: `https://github.com/dennygaar91-ux/razmerno`  
Основной QA-документ: `docs/ux/release-visual-qa-matrix-v1.md`  
Главный backlog: `docs/planning/current-backlog.md`

## 2. Artifact Evidence

| Field | Value |
|---|---|
| Artifact name | `vercel-visual-qa-screenshots-27668876861.zip` |
| Artifact id | `7687188747` |
| Artifact size | `39,626,519 bytes` / ~37.8 MB |
| Workflow | `Vercel Visual QA Screenshots` |
| Run id | `27668876861` |
| Branch | `main` |
| Commit SHA | `1e25c93578fc8953212d6bf44c0986a9a8a6e3d1` |
| Target URL | `https://razmerno.vercel.app/` |
| Generated at | `2026-06-17T05:57:16.101Z` |
| Artifact expires | `2026-07-01` |

## 3. Manifest Summary

Manifest files reviewed:

- `manifest.json`
- `manifest.md`

Manifest result:

| Metric | Value |
|---|---:|
| Total planned captures | 37 |
| Screenshots written | 37 |
| OK | 37 |
| Warning | 0 |
| Error | 0 |
| WebGL fallback captures | 2 |
| Console error count | 0 in captured manifest rows reviewed |

All artifact screenshots listed in the manifest were opened and visually reviewed.

## 4. Checked Routes

| Route | Screenshots | Status |
|---|---:|---|
| `/` | 5 | Reviewed |
| `/measurements` | 5 | Reviewed |
| `/materials` | 5 | Reviewed |
| `/assembly` | 5 | Reviewed |
| `/configurator` | 5 | Reviewed |
| `/configurator-3d` | 5 | Reviewed |
| WebGL fallback for `/configurator-3d` | 2 | Reviewed |
| `/admin` | 5 | Reviewed |

## 5. Checked Viewports

| Viewport | Size | Status |
|---|---:|---|
| Desktop | `1440×900` | Reviewed |
| Laptop | `1280×800` | Reviewed |
| Tablet | `768×1024` | Reviewed |
| Mobile | `390×844` | Reviewed |
| Narrow mobile | `375×812` | Reviewed |

## 6. Screenshot Evidence List

Reviewed screenshots:

- `screenshots/home__desktop-1440.png`
- `screenshots/home__laptop-1280.png`
- `screenshots/home__tablet-768.png`
- `screenshots/home__mobile-390.png`
- `screenshots/home__mobile-375.png`
- `screenshots/measurements__desktop-1440.png`
- `screenshots/measurements__laptop-1280.png`
- `screenshots/measurements__tablet-768.png`
- `screenshots/measurements__mobile-390.png`
- `screenshots/measurements__mobile-375.png`
- `screenshots/materials__desktop-1440.png`
- `screenshots/materials__laptop-1280.png`
- `screenshots/materials__tablet-768.png`
- `screenshots/materials__mobile-390.png`
- `screenshots/materials__mobile-375.png`
- `screenshots/assembly__desktop-1440.png`
- `screenshots/assembly__laptop-1280.png`
- `screenshots/assembly__tablet-768.png`
- `screenshots/assembly__mobile-390.png`
- `screenshots/assembly__mobile-375.png`
- `screenshots/configurator__desktop-1440.png`
- `screenshots/configurator__laptop-1280.png`
- `screenshots/configurator__tablet-768.png`
- `screenshots/configurator__mobile-390.png`
- `screenshots/configurator__mobile-375.png`
- `screenshots/configurator-3d__desktop-1440.png`
- `screenshots/configurator-3d__laptop-1280.png`
- `screenshots/configurator-3d__tablet-768.png`
- `screenshots/configurator-3d__mobile-390.png`
- `screenshots/configurator-3d__mobile-375.png`
- `screenshots/configurator-3d-webgl-fallback__desktop-1440.png`
- `screenshots/configurator-3d-webgl-fallback__mobile-390.png`
- `screenshots/admin__desktop-1440.png`
- `screenshots/admin__laptop-1280.png`
- `screenshots/admin__tablet-768.png`
- `screenshots/admin__mobile-390.png`
- `screenshots/admin__mobile-375.png`

## 7. Executive Summary

Artifact successfully proves that the main public routes and Constructor routes render on Vercel without screenshot capture failures. Landing, measurements, materials and assembly pages look visually coherent and close to the approved warm premium design direction. The strongest visual debt is concentrated in Constructor3D, especially mobile/tablet and scene overlay presentation.

The most critical issue: the mobile constructor shell collapses visually. Header, brand/title, reset action and stepper overlap; the scene is pushed below a long controls card; the 3D/fallback area contains clipped labels and oversized scene controls. This conflicts with the product decision that the 3D scene should be the main working interface and that mobile should remain usable.

Public info pages are not blocking. They need polish around copy density, section rhythm and long mobile pages, but they are understandable and use a consistent visual language. Admin shows an expected protected access screen, not a product blocker, but visually it is outside the public design system and should be hardened before admin is treated as part of MVP operations.

## 8. Overall Visual Quality Score

| Area | Score | Notes |
|---|---:|---|
| Landing | 8.1/10 | Clear promise, CTA visible, coherent sections; mobile is long but readable. |
| Info pages | 8.3/10 | Measurements/materials/assembly are consistent and readable; mainly polish debt. |
| Constructor | 5.0/10 | Core flow renders, but shell/stepper/scene overlays are visually unstable. |
| Mobile | 5.2/10 | Public pages work; Constructor mobile has blocking visual collapse. |
| Design system consistency | 6.5/10 | Public pages are consistent; Constructor/admin diverge. |
| Accessibility / visual usability | 6.0/10 | Tap targets mostly large, but mobile density, contrast and state clarity are uneven. |
| Visual polish | 6.6/10 | Strong public visual base; major Constructor polish needed before release confidence. |

## 9. Findings Table

| ID | Severity | Category | Route | Viewport | Screenshot filename | Problem | Why it matters | Recommended fix | Owner agent | Backlog item? |
|---|---|---|---|---|---|---|---|---|---|---|
| VQA-001 | Blocker | responsive / layout / visual hierarchy | `/configurator`, `/configurator-3d` | mobile-390, mobile-375 | `configurator__mobile-390.png`, `configurator-3d__mobile-390.png` | Mobile constructor shell visually collapses: logo/title overlap, reset button competes with title, stepper labels overlap and scene appears after a long controls card. | Mobile core flow is not release-safe; user cannot confidently understand where they are or why the 3D-first product starts with a long form. | Rebuild mobile constructor shell as scene-first + bottom sheet; simplify mobile header; make stepper single-line/compact; keep price/CTA sticky without overlapping content. | 08 UX/UI / Design System Agent + 02 Constructor Agent | Yes |
| VQA-002 | High | 3D/fallback presentation / visual hierarchy | `/configurator`, `/configurator-3d` | desktop-1440, laptop-1280, tablet-768, mobile-390, mobile-375 | `configurator__desktop-1440.png`, `configurator__tablet-768.png`, `configurator__mobile-390.png` | Scene labels and add markers are oversized and cover the furniture model; the large “+”, section label and `2.1` bubble become the dominant visual object. | The model preview loses trust and selection state becomes noisy instead of helpful. It also looks like a debug overlay, not a finished configurator. | Introduce responsive marker scale, clamp label width, hide full labels unless selected/hovered, and prioritize model readability. | 06 Three.js / Visualization Agent + 02 Constructor Agent + 08 UX/UI / Design System Agent | Yes |
| VQA-003 | High | component consistency / responsive | `/configurator`, `/configurator-3d` | desktop-1440, tablet-768, mobile-390 | `configurator__desktop-1440.png`, `configurator__tablet-768.png`, `configurator__mobile-390.png` | Constructor stepper overlaps: circles, labels and sublabels collide; active step text is clipped. | The stepper is the main orientation component. If it is unreadable, users lose progress context. | Redesign stepper for three responsive modes: full desktop, compact tablet, icon+short label mobile. Remove sublabels on narrow layouts. | 08 UX/UI / Design System Agent + 02 Constructor Agent | Yes |
| VQA-004 | High | responsive / visual hierarchy | `/configurator`, `/configurator-3d` | mobile-390, mobile-375 | `configurator__mobile-390.png`, `configurator-3d__mobile-375.png` | Mobile constructor violates the intended 3D-first experience: the scene is below the full dimensions panel and starts only after significant scroll. | Most traffic is expected from phones; the core product promise is visual configuration, not a long form before the model. | Move scene preview to top on mobile, keep controls in bottom sheet/accordion, and make CTA/price persistent but non-overlapping. | 08 UX/UI / Design System Agent + 02 Constructor Agent | Yes |
| VQA-005 | High | 3D/fallback presentation / responsive | `/configurator-3d` fallback | mobile-390 | `configurator-3d-webgl-fallback__mobile-390.png` | WebGL fallback mobile state is understandable but visually broken: fallback banner, preview, action buttons and bottom status crowd and clip each other. | Unsupported-device users are already at risk; fallback must feel intentional and safe, not broken. | Build a dedicated mobile fallback card: headline, short explanation, large 2D preview, one primary action, secondary retry link, no overlapping bottom chips. | 06 Three.js / Visualization Agent + 08 UX/UI / Design System Agent | Yes |
| VQA-006 | Medium | 3D/fallback presentation / layout | `/configurator-3d` fallback | desktop-1440 | `configurator-3d-webgl-fallback__desktop-1440.png` | Desktop fallback works visually, but bottom action buttons and section/size chips crowd the preview edge; fallback message is thin and partially hidden by scene controls. | Fallback is usable, but still feels like a layered runtime state rather than a designed alternate mode. | Separate fallback status from scene controls; reserve bottom area for actions; make fallback reason and next action more explicit. | 06 Three.js / Visualization Agent + 08 UX/UI / Design System Agent | Yes |
| VQA-007 | Medium | typography / copy density / interaction state | `/configurator`, `/configurator-3d` | all captured constructor viewports | `configurator__desktop-1440.png`, `configurator-3d-webgl-fallback__desktop-1440.png` | Runtime copy is concatenated: “3D работает в упрощённом режимеСтоимость обновлена” / “3D недоступноСтоимость обновлена”. | It weakens trust in the exact-price promise and makes the status area look untested. | Split runtime status and quote status into separate inline items with spacing, punctuation and responsive wrapping. | 08 UX/UI / Design System Agent + 02 Constructor Agent | Yes |
| VQA-008 | Medium | color/token / accessibility | `/configurator`, `/configurator-3d` | desktop-1440, laptop-1280, tablet-768 | `configurator__desktop-1440.png`, `configurator-3d__desktop-1440.png` | Header action “Выйти на сайт” appears nearly invisible on a light background. | Low contrast harms navigation and can make the exit/back action feel broken. | Apply tokenized text color/ghost button state; verify contrast in constructor header. | 08 UX/UI / Design System Agent | Yes |
| VQA-009 | Medium | layout / 3D presentation | `/configurator`, `/configurator-3d` | desktop-1440, laptop-1280 | `configurator__desktop-1440.png`, `configurator-3d__desktop-1440.png` | Scene composition leaves a large empty light area to the right while the model and labels cluster left. | The model preview feels unbalanced and less premium; the wardrobe looks pale and partially lost against the background. | Recenter model, tune camera/framing by viewport, increase model contrast/shadow subtly, and reserve overlay bounds. | 06 Three.js / Visualization Agent | Yes |
| VQA-010 | Medium | admin presentation / component consistency | `/admin` | desktop-1440, tablet-768, mobile-390 | `admin__desktop-1440.png`, `admin__mobile-390.png` | Admin access screen is expected as a protected state, but it is visually raw and does not share the product design system: no card shell, no branded CTA, sparse form styling. | Not a public product blocker, but if admin is part of MVP operations it looks like an unfinished technical page. | Wrap admin login into a design-system card, apply shared typography/buttons/inputs, and add a clear internal-only label. | 08 UX/UI / Design System Agent | Yes, covered by P2-25 |
| VQA-011 | Medium | checkout/order flow presentation | `/configurator`, `/configurator-3d` | all | `configurator__desktop-1440.png` and related constructor screenshots | Artifact covers only initial constructor state, not checkout fields, submit progress, success/error/cooldown or delivery/assembly quote states. | Release matrix requires checkout trust-state evidence; current artifact cannot prove conversion-state quality. | Add a second screenshot artifact run or forced-state capture for checkout empty/valid/error/success/cooldown states. | 08 UX/UI / Design System Agent + 04 API / Orders Agent only for visual API state fixtures | Yes, covered by P2-23 |
| VQA-012 | Medium | accessibility / interaction state | public + constructor | all | all screenshots | Focus states and keyboard path are not visible in static screenshots; disabled/error/warning visual semantics are only partially represented. | Accessibility readiness cannot be claimed from this artifact alone. | Run dedicated keyboard/focus screenshot pass with forced focus/error/disabled states. | 08 UX/UI / Design System Agent | Yes, covered by P2-22 |
| VQA-013 | Low | spacing / copy density | `/`, `/measurements`, `/materials`, `/assembly` | mobile-390, mobile-375 | `home__mobile-390.png`, `measurements__mobile-390.png`, `materials__mobile-390.png`, `assembly__mobile-390.png` | Public mobile pages are readable, but long vertical pages rely on many repeated cards and dense copy blocks. | It does not block understanding, but conversion pages may feel lengthy and repetitive on phones. | After core constructor fixes, compress repeated public mobile sections and strengthen section breaks/anchor navigation. | 08 UX/UI / Design System Agent | Yes, P3/P2 polish |
| VQA-014 | Low | visual polish / spacing | `/`, `/materials`, `/assembly` | desktop-1440, laptop-1280 | `home__desktop-1440.png`, `materials__desktop-1440.png`, `assembly__desktop-1440.png` | Public page rhythm is generally good, but several sections use large rounded cards with similar treatments, creating mild sameness. | Low release risk; affects premium polish more than usability. | Later polish pass: vary section rhythm slightly while keeping token/radius consistency. | 08 UX/UI / Design System Agent | Yes, P3 |

## 10. Severity Breakdown

| Severity | Count |
|---|---:|
| Blocker | 1 |
| High | 4 |
| Medium | 7 |
| Low | 2 |
| Total | 14 |

## 11. Category Breakdown

| Category | Count |
|---|---:|
| responsive | 3 |
| layout | 3 |
| visual hierarchy | 3 |
| component consistency | 2 |
| 3D/fallback presentation | 4 |
| typography/copy density | 2 |
| color/token/accessibility | 2 |
| checkout/order flow presentation | 1 |
| admin presentation | 1 |

Some findings intentionally have multiple category tags because the same visual defect affects layout, hierarchy and responsive behavior.

## 12. Route-by-route Review

### 12.1 Home / Landing

Checked files: `home__desktop-1440.png`, `home__laptop-1280.png`, `home__tablet-768.png`, `home__mobile-390.png`, `home__mobile-375.png`.

Findings:

- First screen is coherent: product promise, CTA and hero image are visible.
- Header is readable on desktop and collapses acceptably on mobile.
- CTA visibility is good on desktop and mobile.
- Visual hierarchy is strong enough for release confidence.
- Mobile page is long and card-heavy, but not broken.

Landing status: no blocker. Recommended as polish after constructor hardening.

### 12.2 Measurements

Checked files: `measurements__desktop-1440.png`, `measurements__laptop-1280.png`, `measurements__tablet-768.png`, `measurements__mobile-390.png`, `measurements__mobile-375.png`.

Findings:

- Page is consistent with the public design system.
- Step-by-step measurement story is clear.
- Mobile readability is acceptable.
- Cards and warning callouts are visually understandable.

Measurements status: no blocker.

### 12.3 Materials

Checked files: `materials__desktop-1440.png`, `materials__laptop-1280.png`, `materials__tablet-768.png`, `materials__mobile-390.png`, `materials__mobile-375.png`.

Findings:

- Material page is visually strong and uses the brand palette correctly.
- Material swatches are clear enough for public explanation.
- Mobile layout is long but readable.
- No evidence of broken material cards in static route captures.

Materials status: no blocker. Pixel-perfect texture accuracy is outside this artifact and remains a separate future concern.

### 12.4 Assembly

Checked files: `assembly__desktop-1440.png`, `assembly__laptop-1280.png`, `assembly__tablet-768.png`, `assembly__mobile-390.png`, `assembly__mobile-375.png`.

Findings:

- Assembly story is clear and visually consistent.
- Desktop composition is strong.
- Mobile layout is readable and does not collapse.
- No blocker found.

Assembly status: no blocker.

### 12.5 Constructor / Configurator

Checked files: `configurator__desktop-1440.png`, `configurator__laptop-1280.png`, `configurator__tablet-768.png`, `configurator__mobile-390.png`, `configurator__mobile-375.png`, plus `/configurator-3d` equivalents.

Findings:

- Core screen renders and price/CTA are visible.
- Desktop/tablet scene and controls are present, but the stagebar and scene overlays have major hierarchy issues.
- Mobile constructor is not release-safe: shell overlap, stepper overlap, scene pushed down, markers clipped.
- The scene does not yet feel like the main workspace on mobile.

Constructor status: release blocker for mobile release scope; high-priority hardening required before acquisition traffic.

### 12.6 WebGL Fallback

Checked files: `configurator-3d-webgl-fallback__desktop-1440.png`, `configurator-3d-webgl-fallback__mobile-390.png`.

Findings:

- Fallback is captured and visibly switches to a 2D/blueprint-style preview.
- Desktop fallback is understandable but crowded.
- Mobile fallback looks unstable: buttons, preview and status elements crowd each other.

Fallback status: functional concept visible, but mobile fallback presentation needs high-priority polish.

### 12.7 Admin

Checked files: `admin__desktop-1440.png`, `admin__laptop-1280.png`, `admin__tablet-768.png`, `admin__mobile-390.png`, `admin__mobile-375.png`.

Findings:

- Protected admin state appears expected.
- It does not expose application internals beyond expected access language.
- Visual system is raw and does not match product UI.

Admin status: not a public product blocker; P2 visual consistency item if admin is MVP operations scope.

## 13. Viewport-by-viewport Review

### Desktop 1440×900

Public pages look stable. Constructor desktop renders but has high visual noise in stepper and scene markers. Fallback desktop is understandable but crowded.

### Laptop 1280×800

Public pages remain stable. Constructor has similar shell/scene issues to desktop, with less breathing room.

### Tablet 768×1024

Public pages remain readable. Constructor tablet has stepper collision and scene overlay issues; the left panel/scene vertical stack is acceptable structurally but needs visual hierarchy work.

### Mobile 390×844

Public pages are readable. Constructor mobile has the primary blocker: header/stepper collisions, scene below controls, clipped 3D/fallback area and oversized controls.

### Mobile 375×812

Same pattern as mobile-390 with slightly tighter constraints. It should be treated as a critical target for the mobile constructor hardening pass.

## 14. Design System Violations

1. Constructor stagebar does not follow the calm public-page component rhythm and collapses under responsive constraints.
2. Constructor header ghost action has contrast/token mismatch.
3. Scene labels and add markers are not normalized to responsive token scale.
4. Admin login is not using shared card/button/input system.
5. Public pages are more consistent than constructor/admin; this creates a visible quality gap between marketing and the product flow.

## 15. Mobile-specific Issues

- Constructor mobile is the main release risk.
- The scene should become first-class on mobile; current layout makes it secondary.
- Stepper should lose sublabels on mobile.
- Header should avoid logo/title/button collision.
- Fallback needs a dedicated mobile card instead of desktop overlays squeezed into a narrow viewport.

## 16. Constructor-specific Issues

- Stepper collisions.
- Scene overlay scale too large.
- Camera/model framing not balanced.
- Runtime and price copy merged without spacing.
- 3D-first hierarchy not respected on mobile.
- Checkout state screenshots are missing from this artifact, so checkout trust cannot be verified from the current capture set.

## 17. Fallback-specific Issues

- Desktop fallback is serviceable but crowded.
- Mobile fallback is not visually release-safe.
- Fallback should emphasize: what happened, that configuration can continue, and what action the user can take next.

## 18. Admin-specific Observations

Admin screenshots show an expected protected access state. This is not a public blocker. However, if admin is part of MVP operations, the login state should be visually aligned with the product system and clearly marked as internal/admin.

## 19. Legacy Fragments

No old landing or legacy constructor page was detected in the reviewed screenshots. However, the constructor scene overlays and admin login look like older/internal visual layers compared with the newer public-page design system. This is a design-system consistency issue, not necessarily legacy route leakage.

## 20. What Was Not Checked and Why

Not checked by this artifact:

- Cross-browser rendering beyond Chromium.
- Real iOS Safari / Android Chrome device screenshots.
- Keyboard focus rings and tab order.
- Constructor Filling step selected-zone/add-menu state.
- Constructor Materials step active swatch/zoom state inside the constructor.
- Checkout empty/valid/delivery/assembly/submit progress/success/error/cooldown states.
- Forced validation warning/error/autofix states.
- Long-scroll lower constructor steps beyond the initial route state.

Reason: the artifact captures default route states and WebGL fallback, not full interaction-state matrix. This is expected from the current screenshot pipeline and should become follow-up capture work, not a false closure.

## 21. Recommended Next Implementation Blocks

Recommended order:

1. Constructor mobile shell hardening: header, stepper, scene-first layout, bottom-sheet control model.
2. Scene overlay scale/framing hardening: labels, add marker, selected zone chip, camera bounds.
3. WebGL fallback presentation hardening: especially mobile.
4. Constructor status/price/header copy polish: separate runtime status and quote status.
5. Checkout trust-state screenshot capture and visual hardening.
6. Accessibility/focus visual pass.
7. Admin access page design-system alignment.
8. Public pages polish only after constructor release risks are under control.

## 22. Final Status

```text
Visual QA Review — executed with findings.
```

Screenshots were opened and reviewed. Product visual findings were created. Visual QA is not “all clear”; it is a completed review with a critical implementation backlog centered on Constructor mobile and scene/fallback presentation.
