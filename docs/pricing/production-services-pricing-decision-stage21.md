# Stage 21 — services pricing decision audit

## Purpose

This stage does not switch live checkout pricing to production-services pricing. It adds a decision layer that compares the current catalog services/produc­tion baseline with the production-model estimate for cutting, edge service, drilling and packaging.

## Decision rules

Production-services pricing remains blocked/manual-review when one of these conditions is true:

- no catalog services + production baseline is available;
- at least one service bucket uses a fixed MVP rate instead of a catalog service price;
- delta is high: at least 25% versus baseline or at least 10,000 ₽ absolute delta.

Production-services pricing becomes a candidate only when the delta is stable and no fixed MVP-rate bucket is present. Even then it still requires production norm confirmation before live integration.

## Current recommendation

Keep live services pricing on the existing catalog formula until manufacturing norms are confirmed for:

- cutting / panel processing;
- edge banding service;
- drilling / boring operations;
- packaging.

Use the decision summary in the debug panel for manager/engineering review.
