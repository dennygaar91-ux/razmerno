# API Contract CI Verification Report v1 — Размерно

Дата: 2026-06-15  
Роль: GitHub Actions / CI Verification Agent  
Статус: verification in progress / P0 closure pending CI evidence

## 1. Executive Summary

Цель проверки — получить реальное подтверждение выполнения новых API / Checkout / Supabase contract tests через GitHub Actions.

Проверка ограничена GitHub Actions, workflow runs, workflow logs, CI status, commits, branches и PRs. Runtime code, tests, API implementation, Supabase implementation, pricing, checkout business logic, constructor, Three.js, UI, design, workflow и package.json не изменялись.

Initial finding before the dedicated CI verification PR:

- commits `06047eeca8cf33f65b3727365886bbd2d5711f04`, `09e49895bc7d45ab60a4fca3a7603066801db326`, `38ac4f95c51439486c257d3a66ea2b1827f96b4f` exist;
- `main` contains `.github/workflows/qa.yml` with `npm run test:checkout-submit-hook` inside `Fast active tests`;
- direct commit workflow lookup for those three commits returned no PR-triggered workflow runs;
- PR #41 had a successful QA run, but its head workflow did not include `npm run test:checkout-submit-hook`, so it is explicitly excluded as invalid evidence;
- therefore P0-11, P0-12 and P0-14 remain open until a valid passing GitHub Actions run is found on a commit whose workflow contains `test:checkout-submit-hook`.

This document is created on a dedicated verification branch to trigger a PR-based GitHub Actions run on current `main` contents, because PR-triggered runs are available through the GitHub connector for job/log verification.

## 2. Commit Verification

Confirmed commits:

1. `06047eeca8cf33f65b3727365886bbd2d5711f04`
   - Message: `test: add order contract fixture`.
   - Adds `tests/fixtures/order-contract-fixture.ts`.

2. `09e49895bc7d45ab60a4fca3a7603066801db326`
   - Message: `test: cover API checkout and Supabase order contracts`.
   - Expands `tests/checkout-submit-hook.test.ts` to cover API / checkout / Supabase order contracts.

3. `38ac4f95c51439486c257d3a66ea2b1827f96b4f`
   - Message: `ci: run checkout API contract tests in fast gate`.
   - Adds `npm run test:checkout-submit-hook` to `.github/workflows/qa.yml`.

Additional main-head confirmation:

- current `main` before this report was `b4b92fb531713575fe62fed8f7f2b802371fea6f`;
- compare `b4b92fb531713575fe62fed8f7f2b802371fea6f..main` was identical;
- therefore the dedicated verification branch starts from current `main` state after `38ac4f95c51439486c257d3a66ea2b1827f96b4f`.

## 3. Workflow Discovery

Workflow file checked:

- `.github/workflows/qa.yml`

Current `main` workflow contains:

- `on: push` to `main`;
- `on: pull_request` to `main`;
- `workflow_dispatch`;
- job `Fast CI gate`;
- `Install dependencies` → `npm ci`;
- `Typecheck frontend` → `npm run typecheck`;
- `Typecheck API` → `npm run typecheck:api`;
- `Build frontend` → `npm run build`;
- `Fast active tests`, including `npm run test:checkout-submit-hook`.

Invalid discovered runs:

- `38ac4f95c51439486c257d3a66ea2b1827f96b4f`: no PR-triggered workflow run found.
- `09e49895bc7d45ab60a4fca3a7603066801db326`: no PR-triggered workflow run found.
- `06047eeca8cf33f65b3727365886bbd2d5711f04`: no PR-triggered workflow run found.
- PR #41 / run `27570780291`: completed successfully, but excluded because the branch workflow did not contain `npm run test:checkout-submit-hook`.
- PR #40 / run `27554246926`: completed with failure and predates the target checkout contract workflow evidence.

Valid workflow discovery for this report is pending the dedicated CI verification PR run.

## 4. Workflow Log Analysis

Required steps to verify in the valid run:

- `Install dependencies`;
- `Typecheck frontend`;
- `Typecheck API`;
- `Build frontend`;
- `Fast active tests`.

Status: pending valid run jobs/logs.

## 5. Checkout Test Verification

Required command:

```bash
npm run test:checkout-submit-hook
```

A workflow file entry is not enough. The command must be found in the actual job log of a passing GitHub Actions run.

Status: pending valid run log evidence.

## 6. API Contract Verification

Expected contract coverage is in `tests/checkout-submit-hook.test.ts` and includes API order flow, checkout submit behavior, Supabase repository/schema contracts and related order persistence/error branches.

Status: pending valid run log evidence.

## 7. P0 Status Review

### P0-11 API Order Flow Tests

Status: open / pending valid GitHub Actions evidence.

Can close only after a passing workflow run proves API contract tests executed.

### P0-12 Checkout Submit Tests

Status: open / pending valid GitHub Actions evidence.

Can close only after a passing workflow run proves `npm run test:checkout-submit-hook` executed.

### P0-14 Supabase Contract Tests

Status: open / pending valid GitHub Actions evidence.

Can close only after a passing workflow run proves Supabase contract checks executed.

### P0-19 Dependency Layer Recovery Verification

Status: reviewed as dependency-related context only. It is not closed by this report unless the valid CI run also proves dependency install stability.

### P1-21 API / Checkout / Supabase Contract Testing

Status: reviewed as related quality backlog item. Its implementation appears present, but completion depends on valid CI evidence.

## 8. Backlog Updates

No `docs/planning/current-backlog.md` update has been made in this initial report commit because closure evidence is not yet available.

If a valid passing workflow is confirmed, only `docs/planning/current-backlog.md` may be updated for P0-11, P0-12 and P0-14, according to the task rules.

## 9. Remaining Risks

1. A successful workflow run without `npm run test:checkout-submit-hook` is invalid evidence.
2. Commit status showing only Vercel is not enough to prove GitHub Actions test execution.
3. Static presence of tests is not enough to close P0 tasks.
4. If the dedicated verification PR run fails or is unavailable, P0-11 / P0-12 / P0-14 must remain open.
5. Live Supabase integration is not proven by deterministic contract tests unless future scope explicitly adds live integration validation.
