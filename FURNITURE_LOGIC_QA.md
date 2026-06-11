# Furniture Logic QA

This document is the root-level furniture logic guard required by `scripts/qa-static-checks.mjs`.

## Configuration checks

- Width, height and depth must respect min/max limits.
- Section width must not fall below the configured minimum.
- Filling logic must remain tied to concrete sections/zones.
- Facades and handles must not contradict selected filling/facade state.
- Materials must remain mapped to pricing and visualization data.
- Production warnings shown to customers must be client-safe and actionable.

## Pricing checks

- Client price must come from the same canonical configuration state as the visual model.
- Dealer catalog prices must use the approved multiplier: client price = catalog price × 1.3.
- Delivery and assembly must be added separately from the base furniture price.
