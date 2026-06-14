# Testing Critical Findings v1 — Размерно

Статус: COMPLETED / audit-only.  
Дата: 2026-06-14.  
Роль: QA Lead.

## 0. Scope

Документ фиксирует критические QA findings, обнаруженные при завершении полного `docs/qa/testing-audit-v1.md`.

Не изменялись:

- код;
- тесты;
- конфигурация;
- CI/CD;
- pricing;
- constructor;
- Three.js;
- checkout;
- production;
- admin;
- API/Supabase.

## 1. Critical findings summary

| ID | Severity | Finding | Impact | Required action |
|---|---|---|---|---|
| QA-CF-01 | P0 | CI workflow does not run main unit/integration/E2E/smoke tests | Regressions can merge despite existing tests | Add required fast test job |
| QA-CF-02 | P0 | No coverage tooling/thresholds | Test coverage cannot be measured or enforced | Add coverage command and thresholds |
| QA-CF-03 | P0 | Latest checked commit has Vercel failure status | Deployment may be broken or stale | Investigate Vercel build/deploy logs |
| QA-CF-04 | P0 | No GitHub workflow runs observed for latest checked commit | CI may not be executing/visible for latest commits | Verify workflow triggers/checks/branch protection |
| QA-CF-05 | P0 | API orders handler lacks direct branch tests | Order flow can fail in production despite typecheck/build | Add mocked API handler tests |
| QA-CF-06 | P0 | Supabase integration lacks local/schema/RLS tests | DB/schema/security regressions can pass QA | Add Supabase schema/migration contract tests |
| QA-CF-07 | P0 | Active checkout submit flow lacks mocked success/error tests | Customer order submission can regress silently | Add active submit hook and E2E submit tests |
| QA-CF-08 | P0 | Pricing lacks golden fixtures and client/server parity | Exact price promise can break silently | Add golden/parity pricing tests |

## 2. Evidence summary

- `.github/workflows/qa.yml` runs `npm ci`, infrastructure inventory, `typecheck`, `typecheck:api`, `build`, CSS architecture check and production geometry architecture check, but not the main test suites.
- `package.json` contains many unit/integration/E2E/smoke scripts that are not wired into current CI.
- Code search found no dedicated coverage script/config/thresholds.
- Checked commit status reported Vercel failure.
- Checked commit workflow runs returned no runs.
- Existing checkout tests cover legacy payload/hook and active payload partially, but not active submit success/error/cooldown behavior.
- Existing pricing tests cover catalog/engine/delivery/final smoke, but not golden exact-price matrix or server/client parity.
- Supabase layer has env fallback and static deploy guards, but no local migration/RLS/schema integration suite.

## 3. Required backlog additions

### P0 backlog

1. `QA-P0-01 — Add required CI fast test job`
   - Include active constructor, pricing, production and API-safe tests.
   - Do not include flaky browser tests until stabilized.

2. `QA-P0-02 — Add coverage tooling and thresholds`
   - Add coverage command.
   - Define minimum thresholds for pricing, constructor store, API shared layer and production export.

3. `QA-P0-03 — Add API orders handler tests`
   - Cover method, origin, env, rate limit, honeypot, validation, server pricing, DB insert, manager/customer email branches.

4. `QA-P0-04 — Add active checkout submit tests`
   - Cover validation, quote missing, success, failure, cooldown and no-reset model invariant.

5. `QA-P0-05 — Add pricing golden fixtures`
   - 5–10 deterministic configurations with exact totals.

6. `QA-P0-06 — Add pricing client/server parity tests`
   - Same constructor/order payload should produce same total client/server.

7. `QA-P0-07 — Add Supabase schema/migration contract tests`
   - Validate orders/status/price tables and required columns/policies.

8. `QA-P0-08 — Investigate Vercel failure and missing workflow-runs`
   - Verify Vercel logs, GitHub Actions triggers and required checks.

## 4. Release recommendation

Do not treat the project as QA-complete or production-ready until at least the P0 backlog above is resolved.

Runtime work can continue only in low-risk audit/planning mode, or with explicit acceptance that current CI does not enforce the existing test inventory.
