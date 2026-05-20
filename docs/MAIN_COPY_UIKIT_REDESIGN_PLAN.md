# Main copy UIKit redesign plan

Branch: main-copy.

Base commit: c2944dbf0ac473cf5b752421364b035b8e392c71.

This branch is a clean copy of main. It must not use the experimental ui-update branch.

## Rules

- Preserve the existing content and business logic.
- Use UIKit files as visual source of truth.
- Use reference screenshots as layout and spacing source of truth.
- Do not replace working pages with simplified mock pages.
- Redesign existing pages gradually.
- Keep constructor logic intact.
- One page or block per step.

## Stages

1. Clone main and audit UIKit.
2. Add UIKit assets/components safely.
3. Redesign landing without changing product meaning.
4. Redesign constructor visual layer without removing logic.
5. Redesign account/dashboard.
6. Redesign checkout visual layer.
7. Mobile UX.
8. Build, QA and PR.

## Progress

Stage 1 — Clone main and audit UIKit: complete.

Stage 2 — Safe UIKit foundation: complete.

Stage 3 — Landing redesign: complete.

Stage 4 — Constructor visual layer: complete.

Stage 5 — Account visual layer: complete.

Stage 6 — Checkout visual layer: complete.

Completed safely:

- Created `main-copy` branch from clean `main`.
- Added UIKit source audit.
- Added `uikit-bridge.css` with design tokens only.
- Imported UIKit bridge from `main.jsx`.
- Added Header UIKit override layer without rewriting Header logic.
- Added Hero UIKit override layer without changing Hero content or structure.
- Added TrustBar UIKit override layer without changing TrustBar content or structure.
- Added Value UIKit override layer without changing Value content or structure.
- Added HowItWorks UIKit override layer without changing HowItWorks content or structure.
- Added Measure UIKit override layer without changing Measure content or structure.
- Added Materials UIKit override layer without changing Materials content or structure.
- Added ConstructorTeaser UIKit override layer without changing ConstructorTeaser content or structure.
- Added Assembly UIKit override layer without changing Assembly content or structure.
- Added FearFaq UIKit override layer without changing FAQ state logic, questions, answers or CTA.
- Added Footer UIKit override layer without changing footer links, contacts or text.
- Added `ConstructorUIKit.css` and imported it last in existing `ConstructorPage.jsx`.
- Preserved constructor state, pricing, zone logic, storage, remote estimate, checkout drawer and order payload.
- Added `AccountUIKit.css` and imported it last in existing `AccountPage.jsx`.
- Preserved account layout, sidebar, active order, progress, history, saved projects and links.
- Added `CheckoutUIKit.css` and imported it in existing `CheckoutDrawer.jsx`.
- Preserved checkout validation, delivery logic, assembly +10%, payment mode, agreement, payload, submit and success state.

Current rule: no route replacement, no constructor logic changes.
