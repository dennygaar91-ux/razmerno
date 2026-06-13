# Pricing and Order Boundaries — «Размерно»

Дата: 2026-06-13
Тип: protected runtime boundary document.

## 1. Назначение

Документ фиксирует архитектурные границы pricing и order flow. Эти зоны критичны для MVP, потому что напрямую влияют на цену, заявку клиента, серверную проверку, Supabase, email и production export.

На инфраструктурных, дизайн- и UX-этапах менять эти зоны запрещено.

## 2. Protected zones

Без отдельного задания и проверки сценариев не изменять:

- `src/pricing/**`
- `src/shared/lib/price.ts`
- `src/shared/lib/order.ts`
- `src/static-pages/constructor/hooks/useConstructorQuote.ts`
- `src/static-pages/constructor/hooks/useConstructorSubmit.ts`
- `src/static-pages/constructor/adapters/constructorPayload.ts`
- `api/orders.ts`
- `api/_shared/server-price.ts`
- `api/_shared/order-*`
- Supabase write/read contracts
- email sending logic
- production export generation

## 3. Pricing principles

1. Цена должна быть точной, не предварительной.
2. Клиент и сервер должны использовать совместимую pricing-логику.
3. Серверная цена является финальной защитой от клиентских расхождений.
4. Прайс-лист дилера умножается на коэффициент `×1.3`.
5. Распил и присадка не считаются отдельно, если уже включены в цену ЛДСП/МДФ по прайсу.
6. Кромка, кромление и упаковка считаются отдельно.
7. Доставка и сборка добавляются в checkout, а не в базовую цену конструктора.
8. Любые изменения в цене требуют price QA на реальных сценариях.

## 4. Current pricing chain

### Client quote chain

```text
Constructor state
  → useConstructorQuote
  → loadPricingModules
  → src/shared/lib/price.ts
  → src/pricing/engine.ts
  → delivery/assembly modules
  → QuoteState
```

Key files:

- `src/static-pages/constructor/hooks/useConstructorQuote.ts`
- `src/static-pages/constructor/pricingLoader.ts`
- `src/shared/lib/price.ts`
- `src/pricing/engine.ts`
- `src/pricing/delivery.ts`
- `src/pricing/assembly.ts`

### Server pricing chain

```text
api/orders.ts
  → api/_shared/server-price.ts
  → src/pricing/engine.ts
  → src/pricing/delivery.ts
  → src/pricing/assembly.ts
  → final server total
```

Key files:

- `api/orders.ts`
- `api/_shared/server-price.ts`
- `src/pricing/engine.ts`

## 5. Price source metadata

Current price source policy is located in:

```text
src/pricing/pricingPolicy.ts
```

Important fields:

- `CLIENT_PRICE_MULTIPLIER = 1.3`
- dealer file name
- price valid-until date
- rule that board/MDF includes cutting and drilling
- rule that edge material/service and packaging are separate
- `priceAccuracy: "exact"`

Risk: if `validUntil` is already in the past, this is not a code bug by itself, but a business-data freshness risk. Do not silently update this value without a new price file or explicit user decision.

## 6. Order flow chain

### Client submit chain

```text
Constructor UI
  → useConstructorSubmit
  → validateCustomer
  → validateDelivery
  → buildOrderPayloadFromConstructor
  → submitOrder
  → POST /api/orders
```

Key files:

- `src/static-pages/constructor/hooks/useConstructorSubmit.ts`
- `src/static-pages/constructor/adapters/constructorPayload.ts`
- `src/shared/lib/order.ts`

### Server order chain

```text
POST /api/orders
  → request id
  → CORS / origin whitelist
  → method check
  → rate limit
  → honeypot
  → validateOrder
  → calculateServerPrice
  → build production export
  → save order
  → send manager email
  → send customer email
  → response
```

Key files:

- `api/orders.ts`
- `api/_shared/order-validation.ts`
- `api/_shared/order-rate-limit.ts`
- `api/_shared/order-cors.ts`
- `api/_shared/order-email.ts`
- `api/_shared/server-price.ts`
- `api/_shared/order-storage.ts` or Supabase-related shared modules

## 7. Payload contract

Order payload is created in:

```text
src/static-pages/constructor/adapters/constructorPayload.ts
```

It must preserve:

- product type;
- dimensions;
- section count;
- layout model;
- filling summary;
- material ids;
- facade kind;
- back panel id/kind;
- style / hardware id;
- price breakdown;
- total price;
- customer contact;
- delivery data;
- assembly data;
- consent data;
- source;
- honeypot.

Boundary rule: this adapter must not be changed as a side effect of UI cleanup.

## 8. Delivery boundary

Delivery belongs to checkout extras, not base constructor price.

Current business rule from project decisions:

- Москва / внутри МКАД: fixed delivery price;
- outside MKAD: distance-based surcharge;
- exact implementation must be checked in `src/pricing/delivery.ts` before changes.

Do not change delivery logic without:

- user confirmation;
- city/zone rules;
- tests for enabled/disabled and address errors.

## 9. Assembly boundary

Assembly is checkout extra.

Current business rule from project decisions:

- assembly enabled by toggle;
- price is percentage of furniture price without delivery;
- current implementation must be checked in `src/pricing/assembly.ts` before changes.

Do not change assembly logic without price QA.

## 10. Customer validation boundary

Client validation lives in:

```text
src/shared/lib/order.ts
```

Important rules:

- name required;
- Russian phone format required;
- email required;
- consent required in submit hook;
- delivery address required when delivery enabled.

Do not weaken validation without explicit product decision.

## 11. Server-side validation boundary

Server validation must remain stricter or equal to client validation.

Do not trust client price, client payload, client source or client validation alone.

Any change in payload fields must be reflected in:

- client payload builder;
- server order type;
- server validator;
- server price recalculation;
- Supabase persistence;
- email templates;
- production export generation;
- tests.

## 12. Email boundary

Order flow includes two email directions:

1. Manager email.
2. Customer confirmation email.

Business rule from project decisions:

- if manager email succeeds but customer email fails, order can still be considered successful;
- failure reason should be logged without PII leakage.

Do not change email behavior without explicit order-flow task.

## 13. Supabase boundary

Supabase-related order persistence is part of protected backend/order flow.

Rules:

- do not store PII in localStorage;
- do not log PII;
- server-side permissions and env variables must be respected;
- admin should receive masked summaries where appropriate.

Do not change Supabase contract during frontend/design tasks.

## 14. Production export boundary

Order submit can trigger production export package generation.

Flow:

```text
OrderRequest
  → buildProductionExportFromOrder
  → buildProductionExportPackage
  → buildCabinetGeometry
  → manufacturing rules / validation / revision
```

Key files:

- `src/constructor/production/orderExportPackage.ts`
- `src/constructor/production/*`
- `src/constructor/geometry/*`

Do not change this layer during pricing/order docs work. It affects manufacturing readiness and future Basis integration.

## 15. Required price QA scenarios before any pricing/order change

Minimum scenarios:

1. Wardrobe 1800×2400×600, 2 sections, shelves.
2. Wardrobe 1800×2400×600, drawers.
3. Wardrobe 1800×2400×600, rod.
4. Wardrobe with 3+ sections.
5. Wardrobe with multi-zone filling.
6. Dresser default.
7. Nightstand default.
8. Body material different from facade material.
9. MDF facade.
10. Handleless / push-to-open style.
11. Delivery disabled.
12. Delivery enabled with valid address.
13. Delivery enabled with missing address.
14. Assembly disabled.
15. Assembly enabled.
16. Invalid phone.
17. Missing email.
18. Honeypot filled.
19. Client price differs from server recalculation.
20. Customer email fails but manager email succeeds.

## 16. Required checks before merging pricing/order changes

At minimum:

- `npm run typecheck`
- `npm run typecheck:api`
- `npm run build`
- relevant order/pricing tests if available;
- manual or automated price scenario comparison;
- GitHub Actions QA workflow.

## 17. Safe work allowed without touching protected logic

Allowed in infrastructure/docs phases:

- document current boundaries;
- add audit reports;
- add docs indices;
- add non-invasive CI checks;
- add backlog items;
- create test plans without changing runtime code.

Not allowed:

- changing formulas;
- changing customer validation;
- changing endpoint behavior;
- changing email templates;
- changing Supabase writes;
- changing production export;
- changing payload structure;
- changing material price mapping.

## 18. Backlog

1. Create `pricing-order-audit-001.md` with actual code-read findings.
2. Create price QA matrix for 20 scenarios.
3. Add automated test coverage for `buildOrderPayloadFromConstructor`.
4. Add client/server price comparison tests.
5. Review current dealer price `validUntil` and request updated price source if needed.
6. Document Supabase order table contract.
7. Document email success/failure matrix.
