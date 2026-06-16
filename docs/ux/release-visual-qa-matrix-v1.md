# P1-21 Release / Post-MVP Visual QA Matrix v1

Дата: 2026-06-16  
Роль: 08 UX/UI / Design System Agent  
Статус: documentation / planning only

## 1. Executive Summary

P1-21 создаёт release/post-MVP visual QA matrix для текущего состояния `main`. Это не редизайн и не исправление UI, а карта проверки: какие экраны, состояния и viewport нужно проверить перед release hardening.

Подтверждённые входные данные: P1-09 Constructor3D Submit E2E, P1-10 WebGL Fallback E2E и P1-13 Material / Texture Parity закрыты в `main`. P1-13 доказывает canonical materialId parity, но не pixel-perfect texture comparison.

По source/docs-аудиту не найден подтверждённый P0 visual blocker. Ограничение: live browser screenshot QA в рамках этой docs-only задачи не выполнялся, поэтому матрицу нужно отдельно прогнать в реальных viewport/browser.

Главные release risks: mobile/tablet/cross-browser visual gap, footer legal placeholder links, отсутствие visual regression screenshot suite, fallback perception, checkout trust states, material preview confidence.

## 2. Scope

In scope: UX/UI inventory, design system inventory, visual QA matrix, release readiness criteria, blockers/risks, post-MVP visual backlog, update `docs/planning/current-backlog.md`.

Out of scope: UI redesign, CSS, React components, Constructor3D runtime, Three.js, pricing, API/orders, production layer, package/workflow/tests, GitHub issues.

Reviewed: `current-backlog.md`, `master-development-plan-v1.md`, `release-roadmap.md`, `project-reconciliation-report-v1.md`, P1-09/P1-10/P1-13 reports, `docs/qa/**`, `src/App.tsx`, public static pages, Constructor3D page/components, admin UI, base/header/info/home/constructor CSS layers. Requested `docs/planning/project-status-review-v2.md` was not found in current `main`.

## 3. Current Product Visual State

Stable areas:

- `/configurator` and aliases route to active Constructor3D; legacy constructor is isolated behind legacy routes.
- Landing has coherent structure: header, hero, how, kit, products, materials slider, measurements teaser, FAQ, final CTA, footer.
- Constructor3D has shell/stagebar/drawer/scene/footer separation and dedicated panels for sizes, filling, materials and checkout.
- WebGL fallback and material parity have E2E/state evidence from P1-10/P1-13.
- Design tokens exist for background, dark, muted, line, orange, yellow, font, container and easing.
- Constructor3D CSS is split into scene, filling, materials, validation, checkout, a11y, price clarity, 2D fallback and composition layers.

Visual debt:

- No dedicated screenshot visual regression suite.
- Cross-browser/mobile/tablet visual proof is not complete.
- Footer document/legal links are placeholders and footer copy says legal data will be added before public launch.
- Admin UI contains demo/API fallback presentation and should be release-scoped only if admin is part of MVP operations.
- Material visual confidence still needs screenshot validation; parity is data/state proof.

## 4. UX/UI Inventory

| Area | Release matrix | Notes |
|---|---:|---|
| Home / landing | Yes | Product understanding + conversion entry. |
| Header/navigation | Yes | CTA must route to active Constructor3D. |
| Footer | Yes | Placeholder legal links are release trust risk. |
| Measurements / Materials / Assembly pages | Yes | Public nav surfaces must stay visually consistent. |
| Constructor3D route | Yes | Main conversion flow. |
| Sizes step | Yes | Type, dimensions, sections, exact width mode. |
| Filling step | Yes | Section/zone selection, add menu, facades, random preset, validation. |
| Materials step | Yes | Body/facade swatches, filters, zoom preview, back panel preview. |
| Checkout | Yes | Contacts, delivery, assembly, quote, consent, submit. |
| Loading/calculating | Yes | Suspense, scene loading, quote recalculation. |
| Success/error/warning | Yes | Submit, validation, quote, runtime states. |
| WebGL fallback | Yes | Must look intentional, not broken. |
| Mobile/tablet/desktop | Yes | Must be executed separately. |
| Admin UI | Conditional | Include if admin is part of release scope. |

## 5. Design System Inventory

| System area | Current state | QA focus | Classification |
|---|---|---|---|
| Colors | Shared CSS vars exist. | Orange = primary/action, yellow = warning, dark = structure. | Stable, verify. |
| Typography | Montserrat stack defined. | Check weight/scale consistency across landing/info/constructor/admin. | P2 debt. |
| Spacing/radii | Large rounded sections + pill controls. | Check drawer density and mobile gaps. | P2 polish. |
| Buttons/inputs | CTA, icon +/- controls, text inputs, material buttons. | Hit areas, disabled state, error helper. | P1. |
| Cards/chips/tabs | Landing cards, stagebar, material tabs, admin chips. | Active/inactive/readability. | P2. |
| Alerts/status | ValidationAssist, quote/runtime/admin statuses. | Severity and blocking semantics. | P1. |
| Focus/keyboard | A11y CSS layer exists. | Verify visible focus and logical tab order. | P1. |
| Loading/fallback | Suspense, scene loading, WebGL fallback. | Must not look like crash/stuck state. | P1. |
| Responsive | CSS exists, proof incomplete. | Execute mobile/tablet matrix. | P1 if mobile release scope. |

## 6. Release Visual QA Matrix

Minimum viewport set: desktop `1440x900`, laptop `1280x800`, tablet `768x1024`, mobile `390x844`, narrow mobile `360x800`.

Browser set: Chromium, Firefox, Safari/WebKit if release traffic includes macOS/iOS, Android Chrome, iOS Safari.

| Screen/component | State | Viewport | What to verify | Acceptance criteria | Priority | Status | Owner | Action | Release impact |
|---|---|---|---|---|---|---|---|---|---|
| Landing | First load | 1440/1280/390 | Promise, hero hierarchy, CTA. | Product understood; CTA visible; no broken fragments. | P1 | Defined, not executed | UX/UI | Screenshot QA. | Conversion. |
| Header | Desktop/mobile | 1440/390/360 | Logo, nav, burger, CTA route. | Navigation readable; CTA reaches `/configurator`. | P1 | Defined | UX/UI | Manual QA. | Entry flow. |
| Footer | Public release | 1440/390 | Contacts, docs, legal links. | No `#` legal placeholders; no “legal data later” launch copy. | P1 | Static risk found | Product + UX/UI | Replace/hide placeholders. | Trust. |
| Info pages | Default | 1440/390 | Measurements/materials/assembly consistency. | Same design language; readable on mobile. | P2 | Defined | UX/UI | Screenshot QA. | Confidence. |
| Constructor3D shell | Initial load | 1440/1280/390 | Header, stagebar, drawer, scene, price/status. | No blank/broken workspace; current step clear. | P0 if broken | Defined | Constructor + UX/UI | Browser QA. | Core flow. |
| Scene loading | Slow/initial | 1440/390 | Loading/skeleton/status. | Looks intentional and temporary. | P1 | Defined | Visualization + UX/UI | Throttled QA. | Runtime trust. |
| Quote | Calculating/error/updated | 1440/390 | Price label/status. | No conflict with “точная цена”; error distinct. | P1 | Defined | Pricing + UX/UI | Interaction QA. | Price trust. |
| Sizes step | Default/min-max/exact | 1440/768/390 | Type cards, dimensions, sections, disabled controls. | Controls readable; disabled reason clear; exact mode not noisy. | P1/P2 | Defined | Constructor + UX/UI | State QA. | Configuration. |
| Filling step | No selection/selected zone/add menu | 1440/390 | Scene-driven instruction, selected state, add menu, facade controls. | User knows to select zone; add menu does not imply instant mutation. | P1 | Defined | Constructor + UX/UI | Interaction QA. | Core UX. |
| Filling validation | Warning/error/autofix | 1440/390 | Issue copy and checkout block. | Blocking reason and auto-fix are explicit. | P1 | Defined | Constructor + UX/UI | Force invalid states. | Recovery. |
| Materials step | Body/facade/default/filter/zoom | 1440/390 | Active swatches, summary, preview, filters. | Selected material unmistakable; preview not pixelated. | P1/P2 | Parity closed; visual pending | Visualization + UX/UI | Screenshot QA. | Material trust. |
| 3D scene | Cameras/selection/dense config | 1440/1280/390 | Model framing, labels, add marker, clipping. | Model centered; selection visible; no clutter collapse. | P1/P2 | Defined | Visualization + Constructor | Browser QA. | Preview trust. |
| WebGL fallback | Forced fallback | 1440/390 | 2D/blueprint preview and copy. | Looks intentional; user can continue. | P1 | E2E closed; visual pending | Visualization + UX/UI | Screenshot with fallback. | Compatibility. |
| Checkout | Empty/valid/delivery/assembly | 1440/390 | Contact fields, quote rows, toggles, consent, submit. | Required fields clear; total authoritative; CTA state clear. | P1 | Defined | Checkout + UX/UI | Manual QA. | Lead capture. |
| Checkout | Submit progress/success/error/cooldown | 1440/390 | Feedback and retry path. | User does not lose config; success/error actionable. | P1 | Submit E2E closed; visual pending | Checkout + UX/UI | Force states. | Conversion. |
| Accessibility | Keyboard flow | 1440/390 | Tab order, focus rings, labels. | Critical flow usable by keyboard; focus visible. | P1 | Defined | UX/UI | Keyboard QA. | Accessibility. |
| Admin | Login/dashboard/API fallback | 1440/1280 | Demo/API status, table, production status. | Internal-only clarity; no public demo perception. | P2 / P1 if public | Defined | Admin + UX/UI | Admin visual QA. | Ops trust. |
| Legacy fragments | Active routes | 1440/390 | No legacy constructor visuals in `/configurator`. | Active flow is 3D-first only. | P1 | Defined | UX/UI + Architecture | Route QA. | Consistency. |

## 7. MVP Release Readiness Criteria

MVP visual readiness requires:

1. Landing explains product and CTA clearly.
2. CTA opens active Constructor3D flow.
3. Header/footer do not look unfinished.
4. Constructor3D initial load shows usable stagebar, drawer and scene.
5. Sizes / Filling / Materials / Checkout are visually distinct and navigable.
6. Price/status visuals do not conflict with exact-price promise.
7. Warning/error states explain what blocks checkout.
8. WebGL fallback looks intentional.
9. Material choice visually matches selected state and preview.
10. Checkout fields, quote, consent and submit are trustworthy.
11. Submit success/error states preserve configuration context.
12. Mobile core flow does not collapse if mobile is in release scope.
13. Focus/keyboard basics are visible.
14. No legacy visual fragments appear in active critical flows.
15. No fake/placeholder public-launch blocks undermine trust.

## 8. Visual Blockers

Confirmed P0 visual blockers: none found from source/docs audit only.

P1 release blockers / release confidence blockers:

| Blocker | Area | Required action |
|---|---|---|
| Mobile/tablet/cross-browser visual matrix not executed | Global | Run this matrix before release. |
| Footer legal placeholders | Footer | Replace real links/copy or hide until ready. |
| WebGL fallback visual perception not screenshot-verified | Constructor3D | Capture fallback screenshots. |
| Checkout trust states not screenshot-verified | Checkout | Capture empty/valid/error/success states. |
| Material visual perception not screenshot-verified | Materials/3D | Capture real decor screenshots. |

## 9. Post-MVP Visual Backlog

Reflect in `docs/planning/current-backlog.md`:

P2:

- Visual regression screenshot suite.
- Cross-browser and device visual QA execution.
- Mobile/tablet Constructor3D polish after matrix execution.
- Accessibility/focus pass.
- Material texture screenshot confidence pass.
- Checkout trust-state visual hardening.
- Admin visual consistency pass if admin is release scope.
- Footer/legal trust hardening before public launch.

P3:

- Advanced token cleanup across public/admin/constructor layers.
- Rich skeleton/loading animation system.
- Post-MVP landing conversion polish from analytics.
- Visual animation/micro-interaction layer.
- Pixel-level material/texture comparison if texture fidelity becomes a differentiator.

## 10. Risks

| Risk | Severity | Area | Impact | Owner | Timing |
|---|---|---|---|---|---|
| Screenshot suite absent | High | Global | Visual regressions can pass CI. | UX/UI + QA | Before release hardening. |
| Mobile constructor debt | High if mobile scope | Constructor3D | Flow may fail on phone. | UX/UI + Constructor | Before acquisition. |
| Footer placeholders | High public launch | Footer | Trust/legal perception loss. | Product + UX/UI | Before public launch. |
| Fallback perceived as crash | Medium-high | WebGL fallback | Unsupported-device abandonment. | Visualization + UX/UI | Before release. |
| Checkout trust gaps | High | Checkout | Conversion loss. | Checkout + UX/UI | Before release. |
| Material confidence gap | Medium | Materials/3D | Lower purchase confidence. | Visualization + UX/UI | P2. |
| Accessibility gaps | Medium-high | Global | Lower quality and usability. | UX/UI | P2/P1 if strict release. |
| Admin demo/API fallback confusion | Medium | Admin | Operational confusion. | Admin + UX/UI | Before admin launch. |

## 11. Recommended Next Actions

1. Execute this matrix in real browsers/viewports and capture screenshots.
2. Resolve footer legal placeholders before public launch.
3. Add visual regression screenshot suite as P2 task.
4. Run mobile Constructor3D visual QA before mobile traffic.
5. Keep P1-21 closed only as matrix/documentation completion; do not treat it as executed visual QA.
6. Do not start redesign from this task; use matrix results for scoped follow-up work.

Recommended next block: execute the visual QA matrix / screenshot pass, unless Product/Planning selects another open block.

## 12. Closure Review

| Criterion | Status |
|---|---|
| `docs/ux/release-visual-qa-matrix-v1.md` created | Done |
| Screen/state/viewport visual QA matrix included | Done |
| Release readiness criteria included | Done |
| Post-MVP visual backlog included | Done |
| Risks/blockers included | Done |
| `docs/planning/current-backlog.md` updated | Done in same PR |
| P1-21 marked closed in backlog | Done in same PR |
| Follow-up tasks added to current backlog | Done in same PR |
| PR created and merged | To verify after PR/merge |
| Code/package/workflow/tests unchanged | To verify by changed files |
| GitHub issues unchanged | No issue actions used |
