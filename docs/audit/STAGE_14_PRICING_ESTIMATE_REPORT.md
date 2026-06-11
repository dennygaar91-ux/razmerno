# Stage 14 — Exact price and estimate

Status: completed.

## Implemented
- Preserved exact-price language in the active constructor.
- Kept price fixed in the drawer footer next to the primary CTA.
- Added Stage 14 pricing markers around the price block and checkout estimate.
- Guarded the customer price policy `CLIENT_PRICE_MULTIPLIER = 1.3`.
- Guarded against weak wording such as preliminary/approximate price in the active constructor.

## Notes
The full production-depth estimate remains connected to existing pricing modules; no formula rewrite was done in this combined pass.
