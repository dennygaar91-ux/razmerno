# Fast Active Tests Recovery Report v1 — Размерно

Дата: 2026-06-15  
Роль: Fast Active Tests Failure Investigation / Test Infrastructure Recovery Agent  
Статус: RCA completed / fix implementation blocked by repository write safety / P0 closure not confirmed

## 1. Executive Summary

Цель задачи — найти точную причину падения шага `Fast active tests` в GitHub Actions run `27572949276`, классифицировать root cause и исправить проблему, если она относится к тестовой инфраструктуре.

Точный failing command найден:

```bash
npm run test:checkout-submit-hook
```

Точный failing test найден:

```text
API order flow creates order, persists it and sends manager/customer notifications
```

Фактическая ошибка:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

502 !== 200
```

Underlying runtime error перед assertion:

```text
Node.js 20 detected without native WebSocket support. Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option.
```

Вывод: падение относится к test infrastructure / CI runtime / test mock setup, а не к проверенной бизнес-логике checkout/pricing/constructor/Three.js. Тест пытается проверить mocked Supabase REST contract, но CI запускает Node.js 20, где `@supabase/supabase-js` падает на Realtime/WebSocket runtime requirement до завершения mocked REST-сценария.

Попытки применить fix в рамках scope были выполнены, но GitHub write tool заблокировал оба допустимых варианта:

1. workflow-level fix: смена Node runtime в `.github/workflows/qa.yml` с Node 20 на Node 22;
2. test setup fix: добавление deterministic WebSocket test mock в `tests/checkout-submit-hook.test.ts`.

Из-за отсутствия применённого fix commit и нового passing workflow run задачи P0-11, P0-12 и P0-14 остаются открытыми. API Contract Layer нельзя считать завершённым.

## 2. Workflow Failure Analysis

Анализировался GitHub Actions run:

```text
27572949276
```

Job:

```text
Fast CI gate
```

Результат job:

```text
failure
```

Подтверждённые шаги:

- `Install dependencies` — success;
- `Typecheck frontend` — success;
- `Typecheck API` — success;
- `Build frontend` — success;
- `Fast active tests` — failure;
- `Coverage snapshot` — skipped;
- `Check CSS architecture` — skipped;
- `Check production geometry architecture` — skipped.

Внутри `Fast active tests` были запущены fast commands, включая:

```bash
npm run test:constructor-store
npm run test:constructor-payload
npm run test:production-preview
npm run test:constructor-flow
npm run test:checkout-submit-hook
```

Падение произошло на команде:

```bash
npm run test:checkout-submit-hook
```

Фактический test runner:

```bash
node --no-warnings --import tsx tests/checkout-submit-hook.test.ts
```

Перед падением прошли первые checkout/API/Supabase contract tests, включая:

- legacy checkout submit hook delegates payload and validation;
- active Constructor3D submit hook keeps cooldown, validation and no-reset contracts;
- checkout validation rejects missing email and missing RU phone;
- API validation rejects missing email and missing phone;
- delivery and assembly enabled payloads pass validation;
- checkout submit sends API payload;
- checkout submit returns validation/API failure;
- Supabase env-missing repository contract;
- Supabase DB insert mapping;
- Supabase schema contract;
- Supabase read/status repository contracts.

Первый failing test:

```text
API order flow creates order, persists it and sends manager/customer notifications
```

Assertion failure:

```text
Expected values to be strictly equal:

502 !== 200
```

Location from log:

```text
tests/checkout-submit-hook.test.ts:394:10
```

Runtime shown by GitHub Actions:

```text
Node.js v20.20.2
```

## 3. Root Cause

Root cause:

```text
CI запускает Fast active tests на Node.js 20.20.2. Тест `tests/checkout-submit-hook.test.ts` включает server/API branch, где `setRequiredServerEnv()` задаёт Supabase env и `callOrderHandler()` вызывает реальный `api/orders.ts`. Внутри handler вызывается `insertOrderRecord()`, который создаёт Supabase client через `@supabase/supabase-js`. При создании клиента Supabase Realtime layer требует native WebSocket или explicit `ws` transport. В Node.js 20 native WebSocket отсутствует, а test setup не предоставляет WebSocket/transport mock. Поэтому handler попадает в catch `orders.submit_failed` и возвращает 502 вместо ожидаемого 200.
```

Почему это не бизнес-логика:

- тестовый сценарий должен проверять mocked Supabase REST insert через `globalThis.fetch`;
- `installServerFetchMock()` уже мокает URL `supabase.example.test/rest/v1/orders`;
- ошибка возникает раньше/ниже уровня contract intent — на runtime requirement Supabase Realtime/WebSocket в Node 20;
- продуктовый API handler и checkout business rules не требуют изменения для устранения именно этого CI падения.

## 4. Scope Classification

Классификация:

- A — test infrastructure: yes;
- B — fixture: no direct data fixture issue found;
- C — mock: yes, missing WebSocket/Supabase transport mock for Node 20 test runtime;
- D — workflow: yes, workflow pins Node 20 while dependency/runtime expects native WebSocket unless transport is provided;
- E — real product bug: not confirmed by this run.

Primary classification:

```text
A / C / D — test infrastructure + mock + CI runtime mismatch
```

Not classified as product bug within this task because the failure prevents the mocked API/Supabase contract from executing as intended. However, there is a remaining release risk: if production serverless runtime is Node 20, a separate API/Infrastructure Agent must explicitly decide whether production should use Node 22 or configure Supabase Realtime transport. This task did not change product runtime code.

## 5. Fixes Applied

No fix commit was successfully applied.

Attempted fix 1:

```text
File: .github/workflows/qa.yml
Change: node-version 20 → 22
Reason: Node 22 provides native WebSocket and aligns CI runtime with Supabase client requirement.
Result: blocked by GitHub write tool safety.
```

Attempted fix 2:

```text
File: tests/checkout-submit-hook.test.ts
Change: add deterministic WebSocket mock in test setup and install it before server/API contract branches.
Reason: preserve Node 20 workflow while making the mocked Supabase REST contract deterministic.
Result: blocked by GitHub write tool safety.
```

Because both permitted infrastructure/test-scope write attempts were blocked, no repository source/test/workflow fix exists in this branch from this agent.

## 6. Verification Results

Original workflow run verification:

| Check | Result |
|---|---|
| Install dependencies / `npm ci` | passed in run `27572949276` |
| Typecheck frontend / `npm run typecheck` | passed in run `27572949276` |
| Typecheck API / `npm run typecheck:api` | passed in run `27572949276` |
| Build frontend / `npm run build` | passed in run `27572949276` |
| Fast active tests | failed in run `27572949276` |
| `npm run test:checkout-submit-hook` | failed inside Fast active tests |

New passing workflow run after fix:

```text
Not available. No fix commit was applied, therefore no valid passing post-fix workflow run exists.
```

## 7. P0 Status Review

### P0-11 API Order Flow Tests

Status: open / not verified.

Reason:

- API order flow contract test exists;
- exact failing test is part of API order flow coverage;
- no passing GitHub Actions run proves the test suite passing after fix.

### P0-12 Checkout Submit Tests

Status: open / not verified.

Reason:

- `npm run test:checkout-submit-hook` is wired into Fast active tests;
- the command failed in run `27572949276`;
- no passing post-fix run exists.

### P0-14 Supabase Contract Tests

Status: open / not verified.

Reason:

- Supabase deterministic contract tests exist;
- the failure is specifically in the Supabase-backed API branch under Node 20 runtime;
- no passing post-fix run exists.

### P0-19 Dependency Layer Recovery Verification

Status: added to `docs/planning/current-backlog.md`, open / verification pending.

Finding:

- P0-11, P0-12, P0-14 and P1-21 existed already;
- P0-19 was missing and was added as dependency/runtime recovery verification item;
- P0-19 closure condition requires a real passing GitHub Actions workflow run with install, typecheck, API typecheck, build, Fast active tests and `npm run test:checkout-submit-hook`.

### P1-21 Reset Action Separation

Status: present in `docs/planning/current-backlog.md`.

## 8. Backlog Updates

Updated:

- `docs/planning/current-backlog.md` — added missing `P0-19 Dependency Layer Recovery Verification`.

Not changed:

- P0-11 remains open;
- P0-12 remains open;
- P0-14 remains open;
- P1-21 was not duplicated.

Reason:

- P0-11, P0-12 and P0-14 can be closed only after a passing workflow run;
- run `27572949276` failed;
- no valid post-fix passing workflow run exists.

## 9. Remaining Risks

1. `Fast active tests` still cannot be considered recovered.
2. `npm run test:checkout-submit-hook` still lacks a passing GitHub Actions run after the discovered failure.
3. P0-11, P0-12 and P0-14 remain open.
4. API Contract Layer cannot be considered complete.
5. The safest next fix is either:
   - run Fast CI gate on Node 22; or
   - keep Node 20 and add explicit deterministic WebSocket/Supabase transport mock for the test suite.
6. If production runtime is also Node 20, a separate API/Infrastructure Agent must decide production runtime policy; this recovery task should not change API business logic.
