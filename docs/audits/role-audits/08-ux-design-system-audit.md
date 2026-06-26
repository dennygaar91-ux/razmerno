# Role Audit — UX / Design System

## Scope

Роль владеет design system, visual hierarchy, responsive rules, accessibility/focus visuals, public/admin UI consistency, screenshot-based visual QA и human visual approval requirements.

## Sources Reviewed

- `docs/specification/volume-01-product/README.md`
- `docs/specification/volume-02-constructor/README.md`
- `docs/specification/volume-03-visualization/README.md`
- `docs/planning/current-backlog.md`
- `docs/planning/accepted-backlog-decisions-v1.md`
- `docs/design-system/README.md`
- `docs/design-system/tokens-v1.md`
- `docs/design-system/components-v1.md`
- `docs/ux/release-visual-qa-matrix-v1.md`
- `docs/ux/vercel-visual-qa-findings-v1.md`
- `src/styles/**`
- `src/admin/**`
- `src/static-pages/constructor/components/**`

## Current State

- В репо есть отдельный design-system docs layer и крупный CSS surface.
- Constructor3D styles разложены по многим dedicated layers в `src/styles/constructor3d/**`.
- Есть visual QA matrix и visual findings docs для release-style review.
- Admin UI и public constructor/public pages имеют собственные presentation layers.
- Backlog already isolates visual tasks from technical closure and требует screenshots + human review.

## RPES Alignment

- В backlog/accepted decisions уже закреплено, что visual closure требует screenshots и human review.
- UI surface around constructor, public pages and admin is sufficiently explicit to support role ownership.
- Design-system layering и visual QA docs показывают, что UX/DS рассматривается как отдельный workstream, а не incidental styling.

## Backlog Alignment

- `P1-21 Release / Post-MVP Visual QA Matrix`
- `P2-20 Visual Regression Screenshot Suite`
- `P2-21 Cross-browser / Device Visual QA Execution`
- `P2-22 Accessibility / Focus Visual Pass`
- `P2-23 Checkout Trust-state Visual Hardening`
- `P2-24 Footer / Legal Trust Hardening`
- `P2-25 Admin Visual Consistency Pass`
- `P2-26 Vercel Visual QA Findings Implementation Follow-ups`
- `TASK 08-UX-01`
- `TASK 08-UX-04`
- `TASK 08-UX-05`
- `TASK 08-UX-06`
- `TASK 08-UX-07`
- `P3-10 Advanced Design Token Cleanup`
- `P3-11 Rich Loading / Skeleton / Motion Layer`
- `P3-12 Landing Conversion Visual Polish`

## Gaps

- Visual QA evidence and design-system docs существуют, но backlog всё ещё держит open screenshot/cross-browser/accessibility/design-system cleanup tracks.
- Найден документный drift: `docs/design-system/README.md` формулирует mobile-first направление, тогда как accepted decisions/current implementation focus фиксируют desktop/website first. Это требует явного reconciliation.
- Dedicated customer-facing visual closure evidence across required viewports/browsers не подтверждено audit scope.
- Design system inventory/token cleanup backlog сам признаёт, что единая DS architecture ещё не доказана как полностью clean.

## Risks

- UX risk: conflicting visual guidance documents могут вести к inconsistent implementation decisions.
- Release risk: без executed screenshot matrix нельзя считать UI visual-ready.
- Accessibility risk: наличие CSS/a11y layers не равно verified keyboard/focus quality.

## Recommended Next Tasks

- Провести explicit reconciliation between `docs/design-system/**` and accepted desktop-first decision layer.
- Отдельно собрать current design-system inventory for active public/admin/constructor surfaces.
- Выполнить real screenshot matrix across desktop/tablet/mobile/cross-browser and attach human review.
- Довести token cleanup only after source-of-truth visual rules are reconciled.

## Evidence Required for Closure

- fresh screenshots
- explicit human visual approval
- viewport/browser coverage per backlog task
- merged/main docs that reconcile design-system rules with accepted decisions

## Do Not Touch

- visual concept, mobile UX direction or stepper behavior without accepted decision
- runtime components/styles outside explicit scoped visual task
- pricing/API/production logic from UX audit
- backlog status based on screenshots alone
