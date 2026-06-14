# CI Required Checks Policy v1 — Размерно

Статус: policy / infrastructure-only.
Дата: 2026-06-14.

## Required GitHub branch protection check

Для ветки `main` нужно вручную включить required status check:

- `QA / Fast CI gate`

## Blocking checks inside the gate

- `npm ci`
- `node scripts/infrastructure-audit-report.mjs --check`
- `npm run typecheck`
- `npm run typecheck:api`
- `npm run build`
- fast active constructor tests
- fast pricing tests
- production/geometry smoke tests
- `node scripts/coverage-report.mjs`
- `npm run check:css-architecture`
- `npm run check:production-geometry-architecture`

## Optional checks for later pipelines

- Playwright full matrix
- mobile browser matrix
- visual regression
- Vercel preview smoke
- Supabase contract validation
- production golden snapshots
- bundle/performance budgets

## Notes

This policy does not change product code. It defines which GitHub Actions job should be configured as a required branch protection check.
