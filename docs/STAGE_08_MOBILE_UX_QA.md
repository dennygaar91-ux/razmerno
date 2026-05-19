# Stage 8 — Mobile UX final QA

Status: complete.

## Implemented

- Mobile-first vertical constructor flow.
- Compact mobile hero.
- Mobile action grid.
- Simplified save/share block on small screens.
- Viewer-first order in the constructor shell.
- Config and summary placed after viewer.
- Sticky config navigation adapted for mobile.
- Mobile checkout panel constrained to viewport height.
- Mobile sticky bottom CTA with preliminary price, sections and elements.
- Sticky CTA opens checkout directly.
- Sticky CTA is hidden while checkout is open via `has-checkout-open` root state.

## QA notes

- Desktop keeps the regular layout because `.rp-mobile-cta` is hidden by default.
- Mobile sticky CTA uses safe-area bottom spacing.
- Sticky config navigation is lifted above the mobile CTA.
- Checkout overlay is protected from CTA overlap.
- No calculation or order payload logic was changed in this stage.

## Stage progress

Stage 8 — Mobile UX: 100%.
