# Deployment Production Notes

This document is the root-level deployment guard required by `scripts/qa-static-checks.mjs`.

## Required checks before production deploy

- `npm run typecheck`
- `npm run typecheck:api`
- `npm run build`
- pricing smoke tests
- checkout/order smoke tests
- 3D/fallback smoke test
- origin whitelist check
- environment variables check

## Important production constraints

- Do not store customer PII in localStorage.
- Do not expose Supabase service credentials to the client.
- Manager email failure should fail order submission.
- Customer email failure after manager/order success should be logged but should not fail the order.
- Public constructor routes must resolve consistently before release.
