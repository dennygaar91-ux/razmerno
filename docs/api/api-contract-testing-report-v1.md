# API Contract Testing Report v1 — Размерно

Дата: 2026-06-15  
Роль: API / Contract Testing Agent  
Статус: completed / confirmed by API Contract Completion Agent

## 1. Executive Summary

Цель этапа — закрыть критический контрактный слой API / Checkout / Supabase вокруг создания заявки:

- P0-11 API Order Flow Tests;
- P0-12 Checkout Submit Tests;
- P0-14 Supabase Contract Tests.

Runtime-логика продукта не менялась. Pricing formulas, Constructor3D, Three.js, production model, UI и бизнес-правила расчёта цены не изменялись.

Добавлен и подключён контрактный тестовый слой вокруг цепочки:

```text
UI / Constructor submit
↓
Payload
↓
Validation
↓
API handler
↓
Supabase persistence contract
↓
Notification flow
```

Финальное подтверждение выполнено API Contract Completion Agent: GitHub Actions QA run `27574321147` завершился успешно на Node 22 runtime.

## 2. Order Flow Map

### 2.1 UI / Checkout submit

Источник submit-контракта:

- `src/static-pages/constructor/hooks/useConstructorSubmit.ts`.

Проверяемые обязательства:

- активный Constructor3D submit использует `validateCustomer`;
- delivery validation выполняется через pricing delivery validator;
- при ошибках submit переводит пользователя на шаг `checkout`;
- payload создаётся через `buildOrderPayloadFromConstructor`;
- source фиксируется как `constructor-store-adapter`;
- повторная отправка защищена cooldown `30_000 ms`;
- успешная отправка вызывает draft save, но не вызывает model reset.

### 2.2 Payload

Источник payload-контракта:

- `src/static-pages/constructor/adapters/constructorPayload.ts`;
- `src/shared/lib/order.ts`.

Проверяемые обязательства:

- submit отправляет `POST /api/orders`;
- payload получает `orderId`;
- `Idempotency-Key` отправляется вместе с заявкой;
- `source`, `configVersion` и `utm` добавляются клиентским submit layer;
- customer email/phone/name проходят клиентскую validation.

### 2.3 API / Validation

Источник API-контракта:

- `api/orders.ts`;
- `api/_shared/order-validation.ts`.

Проверяемые обязательства:

- missing email rejected;
- missing/invalid RU phone rejected;
- delivery enabled requires address;
- assembly enabled validates base/rate;
- invalid server-pricing payload rejected;
- unsupported method rejected;
- rate-limit/cooldown request protection returns 429.

### 2.4 Persistence

Источник persistence-контракта:

- `api/_shared/order-db.ts`;
- `api/_shared/supabase-orders.ts`;
- `db/orders.sql`;
- `supabase/deploy/deploy-all.sql`.

Проверяемые обязательства:

- API payload maps to expected `orders` insert fields;
- raw client IP is hashed before DB insert;
- initial email statuses are `pending`;
- missing Supabase env returns deterministic skipped result;
- schema includes required order, assembly, email and production export fields;
- RLS/no-public-access policy remains present;
- `order_status_events` contract remains present.

### 2.5 Notification flow

Источник notification-контракта:

- `api/orders.ts`;
- `api/_shared/order-email.ts`.

Проверяемые обязательства:

- successful order sends manager and customer notifications;
- manager email failure returns API failure;
- customer email failure after manager notification keeps order successful;
- customer email failure is represented as `email.customer = failed` and `customerError = logged`.

## 3. API Contract Coverage

Добавлено покрытие:

- success order creation;
- validation failure;
- invalid payload/server price failure;
- unsupported method;
- persistence failure;
- manager notification failure;
- customer notification failure-success branch;
- deterministic rate-limit branch.

## 4. Checkout Contract Coverage

Добавлено покрытие:

- active Constructor3D submit source contract;
- missing email;
- missing phone;
- API success submit;
- API failure submit;
- duplicate/cooldown source contract;
- delivery enabled validation;
- assembly enabled validation;
- no model reset source guard.

## 5. Supabase Contract Coverage

Добавлено покрытие:

- insert mapping contract via `toOrderDbInsert`;
- PII-safe client IP hashing;
- repository env-missing contract;
- email status update env-missing contract;
- schema/static migration contract;
- read/admin row mapping contract;
- status transition event mapping contract;
- status enum guard.

## 6. Added Tests

Updated:

- `tests/checkout-submit-hook.test.ts`.

Created:

- `tests/fixtures/order-contract-fixture.ts`.

The existing package command covers the expanded contract suite:

```bash
npm run test:checkout-submit-hook
```

The command is wired into `.github/workflows/qa.yml` Fast active tests and was confirmed through passing QA run `27574321147`.

## 7. Workflow Evidence

Final passing workflow evidence:

- Workflow: `QA`.
- Run: `27574321147`.
- Run number: `148`.
- Conclusion: `success`.
- Job: `Fast CI gate`.
- Successful steps: `Install dependencies`, `Typecheck frontend`, `Typecheck API`, `Build frontend`, `Fast active tests`, coverage/artifact and architecture guards.

The CI runtime was changed from Node 20 to Node 22 to resolve the Supabase Realtime/WebSocket runtime mismatch found in previous runs.

## 8. Missing Coverage

Remaining outside this task:

- real Supabase container/RLS integration tests with live local Supabase;
- browser-level Constructor3D submit E2E with Playwright mocked API;
- pricing client/server parity fixes and golden fixtures are still P0-13, not part of this task.

## 9. Backlog Updates

After successful workflow confirmation, `docs/planning/current-backlog.md` was updated:

- P0-11 closed;
- P0-12 closed;
- P0-14 closed;
- P0-19 confirmed closed as dependency/runtime recovery evidence;
- P1-21 verified as present and not duplicated.

## 10. Remaining Risks

1. Supabase tests are deterministic contract tests, not live database integration tests.
2. Checkout cooldown is protected through source contract and API rate-limit branch; full React hook behavioral testing would require a dedicated React hook test environment.
3. P0-13 pricing parity remains unresolved by design and must be handled by a separate Pricing Agent.
