# Pricing Parity Completion Report v1 — P0-13

Дата: 2026-06-16

Ветка: `pricing/parity-p0-13`

PR: `#43`

Passing CI: GitHub Actions QA run `27595433250`, run number `174`, conclusion `success`.

## 1. Executive Summary

P0-13 `Pricing Golden Fixtures & Parity` доведена до закрытия.

Цель этапа была подтвердить, что цена не расходится между клиентским pricing path, checkout payload, backend server pricing, persisted order mapping и golden fixtures.

Результат:

- frontend typecheck проходит;
- API typecheck проходит;
- frontend build проходит;
- pricing tests проходят внутри `Fast active tests`;
- golden fixtures заменены с placeholder values на реальные фиксированные expected values;
- parity tests явно проверяют равенство `Frontend Price = Checkout Payload Price = Backend Server Price = Stored Order Price = Golden Fixture Expected Price`;
- CI run `27595433250` завершился `success`.

## 2. Typecheck Failure Root Cause

Первичный CI failure был в `Typecheck frontend`.

Root cause состоял из двух связанных проблем:

1. `src/pricing/pricingGoldenFixtures.ts`
   - material ids в fixtures были фактически обычными string values;
   - pricing/material API ожидает `MaterialToken`;
   - из-за этого вызовы `buildConstructorMaterialPricingContext()` в parity layer не имели корректного type contract.

2. `src/pricing/engine.test.ts`
   - parity test был размещён внутри `src/pricing` и импортировал `api/_shared/*`;
   - frontend `tsc --noEmit` начал пересекать frontend/API boundary;
   - это делало `engine.test.ts` неподходящим местом для backend/order parity checks.

Дополнительно выявлена типовая проблема producer narrowing:

- `AGT` допустим для фасада;
- `AGT` не допустим для корпуса;
- поэтому общий producer union был разделён на `CatalogBodyProducer` и `CatalogFacadeProducer`.

## 3. Pricing Flow Map

Финальный pricing parity flow:

1. `src/pricing/pricingGoldenFixtures.ts`
   - задаёт стабильные fixture inputs и expected values.

2. `tests/pricing-parity.test.ts`
   - строит frontend quote через `calculateFrontendFixtureBasePrice()`;
   - строит checkout payload через `buildCheckoutOrderPayload()`;
   - пересчитывает цену на backend через `calculateServerPrice()`;
   - применяет server price через `withServerPrice()`;
   - мапит order в DB shape через `toOrderDbInsert()`;
   - сравнивает все totals и breakdowns со snapshot/golden expected values.

3. `api/_shared/server-price.ts`
   - server-side pricing использует те же material ids и catalog pricing path;
   - delivery и assembly пересчитываются на серверной стороне;
   - `withServerPrice()` записывает authoritative server values в payload.

4. `src/static-pages/constructor/hooks/useConstructorQuote.ts`
   - frontend quote path синхронизирован с catalog/material pricing context.

## 4. Golden Fixtures

Golden fixtures покрывают следующие сценарии:

| Fixture | Total |
|---|---:|
| `wardrobe-small` | `35433` |
| `wardrobe-medium` | `60564` |
| `wardrobe-large` | `94443` |
| `wardrobe-with-delivery` | `41433` |
| `wardrobe-with-assembly` | `66620` |
| `wardrobe-with-delivery-and-assembly` | `110487` |

Validation fixtures:

| Fixture | Expected state |
|---|---|
| `warning-unknown-delivery-zone` | unknown zone warning, delivery price `6000`, no validation error |
| `error-outside-mkad-without-distance` | outside MKAD warning, delivery price `6000`, validation error requiring distance from MKAD |

## 5. Parity Tests

Added test file:

- `tests/pricing-parity.test.ts`

Updated pricing engine test runner:

- `src/pricing/engine.test.ts`

Explicit assertions include:

- checkout payload total equals frontend quote total;
- backend server total equals frontend quote total;
- server-priced payload total equals backend total;
- stored order `total_price` equals backend total;
- stored/server price breakdown fields match exactly;
- golden expected values match actual server price exactly.

No approximate equality is used.

No pricing tests were skipped.

## 6. Verification Results

Confirmed by GitHub Actions QA run:

- Run id: `27595433250`
- Run number: `174`
- Conclusion: `success`
- Commit: `95f6459a3dfe191868e4ca71ef0f4b20642c31f2`

Required commands covered by CI:

| Command / Step | Result |
|---|---|
| `npm ci` | passed |
| `npm run typecheck` | passed |
| `npm run typecheck:api` | passed |
| `npm run build` | passed |
| `Fast active tests` including `npm run test:pricing-engine` | passed |

`npm run test:pricing-engine` now runs the pricing engine smoke tests and then executes `tests/pricing-parity.test.ts`.

## 7. P0 Closure Review

P0-13 closure criteria:

| Criterion | Status |
|---|---|
| Typecheck passes | passed |
| API typecheck passes | passed |
| Build passes | passed |
| Pricing tests pass | passed |
| Golden fixtures have real expected values | passed |
| Parity tests confirm no price drift | passed |
| CI run is green | passed |

Decision: P0-13 can be closed.

## 8. Backlog Updates

`docs/planning/current-backlog.md` updated:

- `P0-13 Pricing Golden Fixtures & Parity` marked as closed;
- result summary added;
- CI evidence added;
- this report linked as the closure document.

No separate backlog file was created.

## 9. Remaining Risks

Remaining risks are not blockers for P0-13:

1. Golden values are intentionally exact snapshots of current pricing logic. If the pricing policy changes intentionally, fixtures must be updated in the same PR with an explanation.
2. The current parity set covers six core wardrobe scenarios plus two delivery validation scenarios. Future product types such as dresser/nightstand need separate golden parity expansion when their production pricing logic becomes authoritative.
3. Pricing docs should continue to distinguish exact MVP catalog/material pricing from future production-panel pricing depth.

## 10. Next Agent Guidance

Next agent should not reopen P0-13 unless a new pricing drift is detected.

Recommended next work:

1. Continue with the next open P0 item from `docs/planning/current-backlog.md`.
2. If changing pricing/business rules, update `src/pricing/pricingGoldenFixtures.ts` and `tests/pricing-parity.test.ts` in the same PR.
3. Do not bypass `npm run test:pricing-engine`; it is now the pricing parity guard.
