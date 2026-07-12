# Role Audit — API / Orders

## Scope

Роль владеет order submit contract, idempotency policy, notification policy, order persistence, admin order APIs и server-side validation/security around request flow.

## Sources Reviewed

- `docs/specification/volume-07-customer-platform/README.md`
- `docs/specification/volume-08-admin-platform/README.md`
- `docs/specification/volume-09-architecture/README.md`
- `docs/planning/current-backlog.md`
- `docs/planning/accepted-backlog-decisions-v1.md`
- `api/orders.ts`
- `api/admin/**`
- `api/_shared/**`
- `tests/checkout-submit-hook.test.ts`
- `tests/pii-logging-sanitization.test.ts`
- `tests/api-env-diagnostics.test.ts`

## Current State

- В repo есть полноценный order API path: `api/orders.ts` + shared order modules.
- Есть admin endpoints для orders, status, production detail/review и login.
- Есть tests для submit contract, idempotency, notification branches, persistence schema checks и PII sanitization.
- Supabase persistence layer и rate limit/idempotency helpers выделены в shared server modules.
- Admin summary/frontend files существуют, что связывает API order data с internal operations view.

## RPES Alignment

- Order flow рассматривается как отдельный server contract layer.
- Notification failures и persistence path уже выделены как отдельные branches.
- Admin platform уже имеет API foundation для order list/detail/status/review paths.

## Backlog Alignment

- `P0-04 Checkout Reliability`
- `P0-11 API Order Flow Tests`
- `P0-12 Checkout Submit Tests`
- `API Order Notification Failure Contracts`
- `Duplicate Submit / Payload-match Idempotency`
- `Manager Notification Failure Policy`
- `Live Provider / Supabase Order Flow Verification`
- `Production Export Failure Contract with API`
- `M8-P0-04 Notification failure policy`
- `M8-P0-05 Duplicate submit and idempotency policy`
- `M8-P1-03 PII and logging audit`

## Gaps

- RPES том VII описывает customer auth/cabinet/projects lifecycle; в `src` в audit scope не найден отдельный явный customer cabinet/auth UI layer, сопоставимый этому объёму.
- Live provider / Supabase order flow verification как release evidence остаётся отдельной backlog-задачей; локальный код и tests не равны live verification.
- Production export failure behavior и full runtime contract against real providers остаются отдельным evidence track в backlog.
- API/admin foundation заметна, но full customer-facing platform continuity from submit to cabinet is not verified from current `src` inventory.

## Risks

- Product risk: RPES customer platform promise шире, чем подтверждённый current repo UI surface.
- Release risk: branch/local tests могут скрыть gaps в live provider behavior.
- Ops risk: notification and persistence policies могут быть реализованы в коде, но не полностью подтверждены against live environment.

## Recommended Next Tasks

- Отдельно зааудировать customer platform implementation against RPES VII: auth trigger, saved config restore, projects/orders list, order detail.
- Подготовить live verification evidence pack for provider/Supabase order flow.
- Зафиксировать API/admin/customer order lifecycle map from create to manager handling to customer visibility.
- Отдельно проверить RPES VIII admin expectations against current admin UI/API surface.

## Evidence Required for Closure

- merged/main API contract updates where needed
- live provider/Supabase verification evidence
- test evidence for idempotency and notification policies
- admin/customer lifecycle verification on main
- backlog update with explicit evidence references

## Do Not Touch

- API order semantics without accepted decision
- Supabase schema/migrations/RLS as part of docs-only audit
- pricing source-of-truth while resolving order issues
- customer auth UX flow without explicit scope
