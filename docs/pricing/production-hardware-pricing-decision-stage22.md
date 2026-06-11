# Stage Constructor 22 — hardware pricing decision layer

## Decision

Hardware pricing remains **audit/debug-only** until supplier-level price lists are connected.

## Why live integration is blocked now

- Current production hardware estimate uses fixed MVP rates.
- There is no supplier-level source for Hettich/Firmax/handles/rods/shelf supports/fasteners.
- Catalog hardware baseline may differ significantly from production hardware estimate.
- Live checkout price should not switch to production hardware pricing until coverage and deltas are stable.

## Current source of truth

- Live price: existing catalog hardware formula.
- Manager/debug layer: production hardware audit and decision summary.

## Next steps

1. Add supplier-level hardware price catalog.
2. Map production hardware items to catalog SKUs.
3. Re-run deltas across base scenarios.
4. Only then prepare controlled live integration behind a feature flag.
