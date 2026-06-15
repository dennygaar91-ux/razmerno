# API Contract Testing Report v1 — Размерно

Дата: 2026-06-15  
Роль: API / Contract Testing Agent  
Статус: completed / confirmed by API Contract Completion Agent

## 1. Executive Summary

Цель этапа — закрыть контрактный слой API / Checkout / Supabase вокруг создания заявки:

- P0-11 API Order Flow Tests;
- P0-12 Checkout Submit Tests;
- P0-14 Supabase Contract Tests.

Runtime-логика продукта не менялась. Constructor, pricing, checkout business logic, API business logic, Supabase production logic, Three.js и UI не изменялись.

## 2. Contract Scope

Покрытая цепочка:

```text
Constructor/Checkout submit → payload → validation → API handler → Supabase persistence contract → notification flow
```

Проверяемые источники:

- `src/static-pages/constructor/hooks/useConstructorSubmit.ts`;
- `src/static-pages/constructor/adapters/constructorPayload.ts`;
- `src/shared/lib/order.ts`;
- `api/orders.ts`;
- `api/_shared/order-validation.ts`;
- `api/_shared/order-db.ts`;
- `api/_shared/supabase-orders.ts`;
- `api/_shared/order-email.ts`;
- `db/orders.sql`;
- `supabase/deploy/deploy-all.sql`.

## 3. Added Tests

Created:

- `tests/fixtures/order-contract-fixture.ts`.

Updated:

- `tests/checkout-submit-hook.test.ts`.

Command:

```bash
npm run test:checkout-submit-hook
```

The command is wired into `.github/workflows/qa.yml` inside `Fast active tests`.

## 4. API Contract Coverage

Covered:

- API order creation success;
- invalid payload/server price failure;
- unsupported method;
- persistence failure;
- manager notification failure;
- customer notification failure after manager notification;
- deterministic request cooldown/rate-limit branch;
- required email and RU phone validation.

## 5. Checkout Contract Coverage

Covered:

- active Constructor3D submit source contract;
- customer validation;
- delivery and assembly validation;
- API success submit;
- API failure submit;
- idempotency key behavior;
- cooldown/no-reset source guard.

## 6. Supabase Contract Coverage

Covered:

- insert mapping via `toOrderDbInsert`;
- PII-safe client IP hashing;
- env-missing deterministic repository behavior;
- email status update env-missing behavior;
- schema/static migration contract;
- RLS/no-public-access policy presence;
- admin row mapping;
- status transition event mapping.

## 7. Workflow Evidence

Final evidence:

- Workflow: `QA`.
- Run: `27574702631`.
- Run number: `153`.
- Conclusion: `success`.
- Job: `Fast CI gate`.
- Successful required steps: `Install dependencies`, `Typecheck frontend`, `Typecheck API`, `Build frontend`, `Fast active tests`.

The runtime blocker was fixed by moving QA runtime to Node 22.

## 8. Backlog Updates

After successful workflow confirmation:

- P0-11 closed;
- P0-12 closed;
- P0-14 closed;
- P0-19 closed;
- P1-21 verified as present and not duplicated.

## 9. Remaining Risks

1. Supabase tests are deterministic contracts, not live Supabase/RLS integration tests.
2. Browser-level Constructor3D submit E2E is outside this API contract block.
3. P0-13 Pricing Golden Fixtures & Parity remains separate and open.
