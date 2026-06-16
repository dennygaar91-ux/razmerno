# Order Notification / Failure Handling Contract Tests v1

Дата: 2026-06-16  
Роль: 04 API / Orders Agent  
Статус: completed in PR / CI success confirmed

## 1. Executive Summary

Этот документ фиксирует contract для API/order flow вокруг отказов уведомлений. Главный MVP-инвариант: если core order persistence прошла успешно и manager notification прошёл успешно, отказ customer confirmation email не ломает заявку. Такой отказ фиксируется как `customer: failed`, клиент получает успешный response, а причина отказа логируется только в безопасном виде.

PR #52 подтвердил contract на GitHub Actions QA run #219 (`27639437300`), conclusion `success`, head commit `60b6c29dd0e28eb7c22cb109e23723209444eda2`.

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

Тест подключён в существующий CI через импорт в:

- `tests/checkout-submit-hook.test.ts`.

Поэтому `npm run test:checkout-submit-hook` запускает и прежний checkout/API/Supabase suite, и новый notification failure contract suite без изменения `package.json` и `.github/workflows/qa.yml`.

## 10. QA / CI Evidence

Confirmed PR workflow:

- PR: #52 `API Order Notification Failure Contracts`.
- Head commit: `60b6c29dd0e28eb7c22cb109e23723209444eda2`.
- Workflow: `QA`.
- Run number: #219.
- Run id: `27639437300`.
- Job: `Fast CI gate`.
- Conclusion: `success`.

Relevant successful steps:

- `Typecheck frontend`;
- `Typecheck API`;
- `Build frontend`;
- `Fast active tests`;
- `P1-09 Constructor3D submit E2E guard`;
- `P1-09 Constructor3D submit E2E`;
- `P1-10 WebGL fallback E2E guard`;
- `P1-10 WebGL fallback E2E`;
- `P1-13 Material / Texture parity guard`;
- `P1-13 Material / Texture parity E2E`;
- `Coverage snapshot`;
- `Check CSS architecture`;
- `Check production geometry architecture`.

Commands covered by existing workflow:

```bash
npm run typecheck
npm run typecheck:api
npm run build
npm run test:checkout-submit-hook
npm run check:constructor-submit-e2e
npm run test:constructor-submit-e2e
npm run check:webgl-fallback-e2e
npm run test:webgl-fallback-e2e
npm run check:material-texture-parity
npm run test:material-texture-parity
```

The new standalone test uses mocks/test doubles only and is executed via `npm run test:checkout-submit-hook`.

## 11. Known Limitations

- No live email provider calls.
- No live Supabase/RLS verification.
- Tests use mocks/test doubles.
- Vercel deployment remains unresolved under P1-22.

## 12. Remaining Risks

- Manager notification failure business behavior remains strict `502`; product may later decide to convert it to success-with-warning after operational review.
- Duplicate replay returns skipped email statuses because the API does not fetch the previous order email statuses in this MVP contract.
- Full live Supabase duplicate constraint behavior still requires deployment/RLS verification outside deterministic tests.

## 13. Closure Review

Pre-merge closure criteria met in PR #52:

1. PR CI succeeded on current head commit `60b6c29dd0e28eb7c22cb109e23723209444eda2`.
2. API/order tests passed via `Fast active tests`.
3. PII-safe notification failure tests passed via `npm run test:checkout-submit-hook`.
4. PR merge and main content verification remain the final closure actions.
