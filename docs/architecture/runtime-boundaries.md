# Runtime Boundaries — «Размерно»

Дата: 2026-06-13
Тип: architecture boundary document.

## 1. Назначение

Документ фиксирует runtime-границы проекта: где заканчивается frontend, где начинается API, как связаны pricing/order/production/admin слои и какие зоны нельзя менять без отдельного задания.

## 2. Главный принцип

В проекте «Размерно» нельзя смешивать изменения разных runtime-слоёв в одном этапе.

Пример запрещённого смешения:

- одновременно менять UI конструктора;
- менять pricing;
- менять order submit;
- менять API;
- менять production export.

Даже если изменение кажется маленьким, оно может сломать заявку, цену, Supabase запись, email или production JSON.

## 3. Frontend runtime

### Entry

- `src/main.tsx`
- `src/App.tsx`

### Responsibilities

Frontend отвечает за:

- отрисовку страниц;
- routing;
- работу конструктора;
- клиентскую валидацию;
- отображение цены;
- отправку заявки через shared order client;
- отображение 3D/2D fallback;
- admin UI shell.

### Not responsible for

Frontend не должен быть единственным источником истины для:

- финальной цены;
- production export;
- записи заявки;
- email delivery;
- Supabase security;
- server-side validation.

## 4. Constructor runtime

### Active route

- `/constructor`
- `/configurator`
- `/constructor-3d`
- `/configurator-3d`

Active implementation:

- `src/static-pages/Constructor3DPage.tsx`

### Legacy route

- `/constructor-legacy`
- `/configurator-legacy`

Legacy implementation:

- `src/static-pages/ConstructorPage.tsx`

### Shared layers

Both active and legacy constructor may use:

- `src/static-pages/constructor/store/*`
- `src/static-pages/constructor/hooks/useConstructorPageState.ts`
- `src/static-pages/constructor/hooks/useConstructorQuote.ts`
- `src/static-pages/constructor/hooks/useConstructorSubmit.ts`
- `src/static-pages/constructor/adapters/constructorPayload.ts`

### Boundary rule

Любое изменение shared constructor hooks/store/adapters требует проверки, что не сломаны:

- active 3D constructor;
- legacy constructor route;
- checkout submit;
- quote calculation;
- validation blocking;
- order payload contract.

## 5. Pricing runtime

### Client pricing path

```text
Constructor state
  → useConstructorQuote
  → loadPricingModules
  → src/shared/lib/price.ts
  → src/pricing/engine.ts
  → QuoteState
```

### Server pricing path

```text
api/orders.ts
  → api/_shared/server-price.ts
  → src/pricing/engine.ts
  → delivery/assembly pricing
  → final server price
```

### Boundary rule

Pricing changes are protected. Do not change without:

- separate task;
- known price scenarios;
- comparison client/server;
- regression tests;
- explicit user approval.

## 6. Order runtime

### Client submit path

```text
Constructor UI
  → useConstructorSubmit
  → buildOrderPayloadFromConstructor
  → src/shared/lib/order.ts
  → POST /api/orders
```

### Server order path

```text
api/orders.ts
  → request context
  → CORS/origin/rate-limit/honeypot
  → validateOrder
  → calculateServerPrice
  → Supabase order write
  → emails
  → production export package
  → response
```

### Boundary rule

Order flow is critical. Do not modify in infrastructure/design/refactor tasks.

## 7. API runtime

### Current API zones

| Path | Responsibility | Protected |
|---|---|---:|
| `api/orders.ts` | Main order endpoint | yes |
| `api/admin/orders.ts` | Admin orders listing | yes |
| `api/admin/order-status.ts` | Admin status update | yes |
| `api/admin/production-review.ts` | Production review update | yes |
| `api/_shared/*` | Shared server modules | yes |

### Boundary rule

API files must not import browser-only modules. API typecheck is separate through `npm run typecheck:api`.

## 8. Supabase runtime

Supabase is accessed from server/API/admin-related flows. On current infrastructure phases:

- do not change table assumptions;
- do not change PII handling;
- do not change admin auth;
- do not change storage/write behavior;
- do not log personal data.

## 9. Production/export runtime

### Path

```text
OrderRequest
  → buildProductionExportFromOrder
  → buildProductionExportPackage
  → buildCabinetGeometry
  → manufacturing rules
  → validation report
  → revisions/review
```

### Main directories

- `src/constructor/production/`
- `src/constructor/geometry/`

### Boundary rule

Production/export logic is protected. It affects future manufacturing, Basis integration and admin review. Do not change without separate production-focused task.

## 10. Admin runtime

### Frontend

- `src/admin/AdminOrdersPage.tsx`
- `src/admin/AdminOrderDetailPage.tsx`
- `src/admin/ProductionReviewPanel.tsx`
- `src/admin/adminClient.ts`

### Server

- `api/admin/*`
- `api/_shared/admin-*`

### Boundary rule

Admin is MVP-critical but not part of current infrastructure documentation pass. Do not refactor admin while changing constructor or docs unless task explicitly says so.

## 11. CSS runtime

CSS layers:

```text
src/styles/base.css
src/index.css
src/styles/constructor.css
src/styles/constructor3d.css
src/styles/constructor3d/*
```

Boundary rules:

1. Do not purge CSS without visual QA.
2. Do not mix landing CSS cleanup with constructor CSS cleanup.
3. Do not change import order without build and visual checks.
4. Legacy constructor CSS must be quarantined before deletion.

## 12. GitHub Actions runtime

Current QA workflow:

- `.github/workflows/qa.yml`

It runs:

- `npm ci`;
- `npm run typecheck`;
- `npm run typecheck:api`;
- `npm run build`;
- `npm run check:css-architecture`;
- `npm run check:production-geometry-architecture`.

Boundary rule:

CI failures should be treated as blockers. If a failure is unrelated/flaky, document it before retrying.

## 13. Safe change categories

| Change type | Safe without special approval? | Notes |
|---|---:|---|
| Docs-only architecture/audit files | yes | Current phase. |
| Adding QA workflow | yes, if non-invasive | Already done. |
| Updating protected runtime code | no | Requires separate task. |
| CSS purge | no | Requires visual baseline. |
| Constructor state refactor | no | Requires tests and ownership docs. |
| Pricing/order changes | no | Requires dedicated scenario QA. |
| Admin/API/Supabase changes | no | Requires dedicated backend/admin task. |

## 14. Required report after any stage

Every stage must include:

- what was planned;
- what was done;
- what was not done;
- why not done;
- risks;
- backlog.
