# Order Notification / Failure Handling Contract Tests v1

Дата: 2026-06-16  
Роль: 04 API / Orders Agent  
Статус: implementation in PR / CI evidence pending

## 1. Executive Summary

Этот документ фиксирует contract для API/order flow вокруг отказов уведомлений. Главный MVP-инвариант: если core order persistence прошла успешно и manager notification прошёл успешно, отказ customer confirmation email не ломает заявку. Такой отказ фиксируется как `customer: failed`, клиент получает успешный response, а причина отказа логируется только в безопасном виде.

## 2. Scope

В scope входят только API/order flow, server-side validation, Supabase order persistence contract, notification failure handling, idempotent duplicate order handling, safe API responses, deterministic tests и backlog evidence.

Не входят UI, CSS, Constructor, Three.js, Pricing logic, Production/manufacturing layer, Vercel dashboard verification, GitHub issues и PR #51.

## 3. Existing Order Flow

1. `POST /api/orders` обрабатывается в `api/orders.ts`.
2. CORS/origin/no-store/request-id headers применяются до validation.
3. Runtime readiness проверяется через `assertServerEnvReady()`.
4. Rate limit проверяется через `getClientKey()` и `isRateLimited()`.
5. Payload валидируется через `validateOrder()` из `api/_shared/order-validation.ts`.
6. Server price пересчитывается через `calculateServerPrice()` и `withServerPrice()`.
7. Production export строится через `buildProductionExportFromOrder()`.
8. DB insert payload строится через `toOrderDbInsert()`.
9. Persistence выполняется через `insertOrderRecord()` в `api/_shared/supabase-orders.ts`.
10. Manager notification отправляется через `sendEmail()` с `buildManagerText()` и `buildManagerAttachments()`.
11. Customer confirmation отправляется через `sendEmail()` с `buildClientText()`.
12. Email statuses сохраняются через `updateOrderEmailStatus()`.
13. Логи пишутся через `logEvent()` и safe notification failure reason.

## 4. Order Success Contract

Order считается созданной, когда core persistence успешно вставила заявку в storage layer. Happy path включает:

- persistence success;
- manager notification success;
- customer confirmation success;
- response `200` с `ok: true`, `orderId`, `receivedAt` и email statuses.

## 5. Notification Failure Contract

Customer confirmation failure после успешной persistence и успешной manager notification не ломает заявку:

- API response остаётся `200` / `ok: true`;
- `email.customer` возвращается как `failed`;
- `email.customerError` возвращается только как `logged`;
- raw provider details не попадают в клиентский response;
- failure reason логируется без customer PII.

Manager notification failure по текущему коду остаётся API error contract:

- заявка уже может быть сохранена;
- `manager_email_status` обновляется как `failed`;
- API response возвращает safe `502` с пользовательским сообщением;
- raw provider details не раскрываются клиенту;
- failure reason логируется без customer PII.

Это поведение зафиксировано как текущий contract, без изменения бизнес-правила на success-with-warning.

## 6. Idempotency Contract

`orderId` используется как practical idempotency key. Если storage возвращает duplicate order id, API трактует это как idempotent replay:

- новая заявка не создаётся;
- повторные manager/customer notifications не отправляются;
- response возвращается `200` / `ok: true`;
- response включает `idempotent: true`;
- email statuses для replay возвращаются как `skipped`.

## 7. Validation Contract

Validation errors возвращают safe `400` без внутренних technical details. Контракт покрывает:

- missing email;
- missing phone;
- invalid RU phone;
- delivery enabled without address;
- invalid payload shape.

## 8. PII-Safe Logging Contract

Notification failure logs не должны содержать:

- customer name;
- customer phone;
- customer email;
- delivery address;
- customer comment.

Разрешено логировать:

- `requestId`;
- `orderId`;
- event name;
- notification stage;
- generic sanitized reason;
- high-level provider failure marker.

## 9. Test Coverage

Добавлен deterministic contract test file:

- `tests/order-notification-failure-contract.test.ts`.

Он покрывает:

- happy path notifications;
- customer email failure success contract;
- manager email failure safe error contract;
- duplicate order id idempotent replay;
- validation cases;
- PII-safe log assertions;
- provider error response sanitization.

Existing coverage remains in:

- `tests/checkout-submit-hook.test.ts`.

## 10. QA / CI Evidence

CI evidence pending until PR run completes.

Expected relevant commands:

```bash
npm run typecheck:api
npm run test:checkout-submit-hook
node --no-warnings --import tsx tests/order-notification-failure-contract.test.ts
```

The new standalone test uses mocks/test doubles only.

## 11. Known Limitations

- No live email provider calls.
- No live Supabase/RLS verification.
- Tests use mocks/test doubles.
- Vercel deployment remains unresolved under P1-22.
- GitHub connector blocked direct QA workflow modification in this session; if the standalone test cannot be wired into existing CI without workflow/package changes, closure must remain pending.

## 12. Remaining Risks

- Manager notification failure business behavior remains strict `502`; product may later decide to convert it to success-with-warning after operational review.
- Duplicate replay returns skipped email statuses because the API does not fetch the previous order email statuses in this MVP contract.
- Full live Supabase duplicate constraint behavior still requires deployment/RLS verification outside deterministic tests.

## 13. Closure Review

Can be closed only after:

1. PR CI succeeds on the current head commit.
2. API/order tests pass.
3. PII-safe notification failure tests pass.
4. PR is merged into `main`.
5. `main` content verification confirms code, tests, docs and backlog update.
