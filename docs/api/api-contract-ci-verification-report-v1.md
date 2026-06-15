# API Contract CI Verification Report v1 — Размерно

Дата: 2026-06-15  
Роль: GitHub Actions / CI Verification Agent / updated by API Contract Completion Agent  
Статус: completed / passing workflow confirmed

## 1. Executive Summary

Цель проверки — получить реальное подтверждение выполнения API / Checkout / Supabase contract tests через GitHub Actions.

Итог:

- предыдущие candidate runs `27572949276` и `27573862283` падали на `Fast active tests`;
- root cause подтверждён как Node 20 + `@supabase/supabase-js` + Realtime/WebSocket runtime mismatch;
- QA workflow переведён на Node 22;
- новый GitHub Actions QA run `27574321147` завершился `success`;
- `Install dependencies`, `Typecheck frontend`, `Typecheck API`, `Build frontend`, `Fast active tests`, coverage/artifact и architecture guard steps прошли успешно;
- P0-11, P0-12, P0-14 и P0-19 закрыты в `docs/planning/current-backlog.md`.

## 2. Failed Candidate Runs

### Run `27572949276`

- Workflow: `QA`.
- Job: `Fast CI gate`.
- Result: `failure`.
- Successful before failure: `Install dependencies`, `Typecheck frontend`, `Typecheck API`, `Build frontend`.
- Failed step: `Fast active tests`.
- Failing command: `npm run test:checkout-submit-hook`.
- Failing test: `API order flow creates order, persists it and sends manager/customer notifications`.
- Assertion: `502 !== 200`.
- Runtime: Node.js `v20.20.2`.

### Run `27573862283`

- Workflow: `QA`.
- Job: `Fast CI gate`.
- Result: `failure`.
- Successful before failure: `Install dependencies`, `Typecheck frontend`, `Typecheck API`, `Build frontend`.
- Failed step: `Fast active tests`.
- Failing command: `npm run test:checkout-submit-hook`.
- Failing test: `API order flow creates order, persists it and sends manager/customer notifications`.
- Assertion: `502 !== 200`.
- Runtime: Node.js `v20.20.2`.

## 3. Root Cause Confirmation

Both failed runs produced the same runtime error from Supabase Realtime/WebSocket path:

```text
Node.js 20 detected without native WebSocket support.
Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option.
```

The failing API contract expected successful order creation and notifications but received API `502`, because the handler path hit the Supabase runtime transport error.

Classification:

- test infrastructure / runtime mismatch;
- not a confirmed product logic bug;
- not caused by checkout, pricing, constructor, Three.js or UI logic.

## 4. Fix Applied

Applied fix:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm
```

Changed file:

- `.github/workflows/qa.yml`.

Commit:

- `b5e0e5e3413c563305143685dc9ac42726084668` — `ci: use Node 22 for API contract workflow runtime`.

No product runtime code was changed.

## 5. Passing Workflow Run

Final passing run:

- Workflow: `QA`.
- Run: `27574321147`.
- Run number: `148`.
- Status: `completed`.
- Conclusion: `success`.
- Job: `Fast CI gate`.
- Job conclusion: `success`.

Successful steps:

- `Install dependencies` → proves `npm ci`.
- `Typecheck frontend` → proves `npm run typecheck`.
- `Typecheck API` → proves `npm run typecheck:api`.
- `Build frontend` → proves `npm run build`.
- `Fast active tests` → proves the active fast suite.
- `Coverage snapshot`.
- `Upload coverage artifact`.
- `Check CSS architecture`.
- `Check production geometry architecture`.

## 6. Checkout Contract Test Confirmation

The successful workflow file includes this command inside `Fast active tests`:

```bash
npm run test:checkout-submit-hook
```

Because `Fast active tests` completed with `success` in run `27574321147`, the command is confirmed passing in GitHub Actions.

Contract suite covered by this command:

- checkout submit success/failure;
- active Constructor3D submit source contract;
- required customer email and RU phone validation;
- API order flow success;
- manager/customer notification branches;
- Supabase persistence and schema contracts;
- admin order/status mapping contracts;
- deterministic request cooldown/rate-limit branch.

## 7. P0 Closure Review

### P0-11 API Order Flow Tests

Status: closed.

Evidence: successful QA run `27574321147` proves API order flow tests pass through `npm run test:checkout-submit-hook` inside `Fast active tests`.

### P0-12 Checkout Submit Tests

Status: closed.

Evidence: successful QA run `27574321147` proves checkout submit contract tests pass.

### P0-14 Supabase Contract Tests

Status: closed.

Evidence: successful QA run `27574321147` proves deterministic Supabase contract tests pass.

### P0-19 Dependency Layer Recovery Verification

Status: closed.

Evidence: dependency install, typechecks, build and Fast active tests are green on Node 22.

### P1-21 Reset Action Separation

Status: present / not duplicated.

Evidence: item exists in `docs/planning/current-backlog.md` and was not duplicated.

## 8. Backlog Updates

Updated file:

- `docs/planning/current-backlog.md`.

Updated statuses:

- P0-11 → closed.
- P0-12 → closed.
- P0-14 → closed.
- P0-19 → closed.

No temporary backlog files were created.

## 9. Remaining Risks

1. Deterministic Supabase contracts do not replace live Supabase/RLS integration testing.
2. Browser-level Constructor3D checkout E2E remains outside this contract block.
3. P0-13 Pricing Golden Fixtures & Parity remains separate and open.
4. Vercel deployment status remains a separate release/deploy concern.

## Final Status

API Contract CI verification is complete. The final blocker was resolved by Node 22 runtime in QA workflow and confirmed by GitHub Actions run `27574321147`.
