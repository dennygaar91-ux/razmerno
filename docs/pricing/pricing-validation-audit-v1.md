# Pricing Validation Audit v1 — Размерно

Дата: 2026-06-14  
Статус: audit-only  
Роль: Pricing Lead  
Scope: проверка источников цены, калькуляторов, валидаторов, тестов и влияния production model на цену. Код, pricing engine, constructor, checkout, production logic и UI не менялись.

---

## 1. Краткий вывод

Pricing-слой уже заметно сильнее раннего MVP: есть нормализованный прайс-каталог, коэффициент `x1.3`, отдельные модули доставки и сборки, серверный пересчёт заявки, production-panel pricing и debug/audit-слои для hardware/services.

Но главный P0-риск остаётся: **клиент и сервер сейчас могут считать одну и ту же заявку по разным путям**.

Клиентский Constructor3D:

- подбирает реальные материалы через `materialPricingContext`;
- передаёт `producer/article/thickness` в `calculatePrice()`;
- при наличии `snapshot` применяет `production-panel` пересчёт материалов/кромки;
- после этого считает сборку от `nextPrice.total`.

Серверный `calculateServerPrice()`:

- пересчитывает цену заново;
- не использует `bodyId/facadeId/backPanelId` из `body.materials`;
- не применяет `production-panel` pricing;
- считает только catalog-price + delivery + assembly.

Это хорошо с точки зрения защиты от подмены клиентской суммы, но плохо с точки зрения точного соответствия UI quote и сохранённой заявки.

---

## 2. Изученные зоны

### Planning

- `docs/planning/README.md`
- `docs/planning/master-development-plan-v1.md`
- `docs/planning/current-backlog.md`
- `docs/planning/mvp-scope.md`
- `docs/planning/architecture-decisions.md`
- `docs/planning/agent-workflow.md`
- `docs/planning/parallelization-rules.md`
- `docs/planning/release-roadmap.md`

### Pricing docs

- `docs/pricing/price-list-analysis.md`
- `docs/pricing/pricing-production-checklist.md`
- `docs/pricing/production-model-pricing-backlog.md`
- `docs/pricing/production-services-pricing-decision-stage21.md`
- `docs/pricing/production-hardware-pricing-decision-stage22.md`
- `docs/pricing/supplier-hardware-catalog-foundation-stage23.md`
- `docs/pricing/confirmed-supplier-price-import-foundation-stage24.md`
- `docs/pricing/price-update-runbook.md`

### Code paths

- `src/pricing/*`
- `src/shared/lib/price.ts`
- `src/shared/lib/pricing-core.ts`
- `src/shared/materials/*`
- `src/static-pages/constructor/pricingLoader.ts`
- `src/static-pages/constructor/hooks/useConstructorQuote.ts`
- `src/static-pages/constructor/adapters/productionPricingPreview.ts`
- `src/static-pages/constructor/adapters/constructorPayload.ts`
- `src/constructor/pricing.ts`
- `src/constructor/priceList.ts`
- `api/_shared/server-price.ts`
- `api/_shared/order-validation.ts`
- `api/orders.ts`
- `api/price-items.ts`
- `api/_shared/price-items-store.ts`
- `db/pricing.sql`
- `scripts/check-price-integrity.mjs`
- pricing-related tests

---

## 3. Pricing architecture map

```text
Dealer Excel price list
  -> scripts/build-price-seed.mjs
    -> src/pricing/seed/price-items.json
    -> db/seed/price-items.jsonl
    -> db/seed/price-items.sql
    -> db/pricing.sql / public.price_items

Static live catalog path
  src/pricing/catalog.ts
    -> src/pricing/engine.ts / calculateCatalogPrice()
      -> src/shared/lib/price.ts / calculatePrice()

Client Constructor3D price path
  useConstructorQuote()
    -> buildConstructorMaterialPricingContext()
    -> calculatePrice() / calculateCatalogPrice()
    -> calculateDeliveryQuote()
    -> calculateAssemblyQuote()
    -> if snapshot:
       buildConstructorProductionPricingBundle()
         -> summarizeProductionPanelPricing()
         -> applyProductionPanelPricingToCatalogPrice()
         -> summarizeProductionHardwarePricing() audit/debug
         -> summarizeProductionServicesPricing() audit/debug
    -> quote.total

Checkout payload path
  buildOrderPayloadFromConstructor()
    -> sends client priceBreakdown / totalPrice / materials / delivery / assembly

Server order path
  api/orders.ts
    -> validateOrder()
    -> calculateServerPrice()
      -> calculateCatalogPrice()
      -> calculateDeliveryQuote()
      -> calculateAssemblyQuote()
    -> withServerPrice()
    -> DB/email payload

Runtime catalog API path
  api/price-items.ts
    -> api/_shared/price-items-store.ts
      -> Supabase price_items if env exists
      -> seed fallback if env absent

Legacy / duplicate pricing paths
  src/shared/lib/pricing-core.ts
  src/shared/lib/price.ts / calculateLegacyPrice(), quickEstimate()
  src/constructor/pricing.ts
  src/constructor/priceList.ts
```

---

## 4. Sources of truth and data sources

| Area | Current source | Status | Audit note |
|---|---|---|---|
| Dealer price source | `Прайс-лист для дилеров до 01.04.26(3).xlsx` | Accepted | Rule: every numeric source price gets `x1.3`. |
| Normalized seed | `src/pricing/seed/price-items.json` | Active for code engine | Used directly by `src/pricing/catalog.ts`. |
| Supabase DB | `public.price_items` | Prepared/runtime API | `retail_price` is generated as `source_price * markup_multiplier`, but live calculator currently does not read it directly. |
| Pricing policy | `src/pricing/pricingPolicy.ts` | Active | Contains `CLIENT_PRICE_MULTIPLIER = 1.3` and calculation rules. |
| Materials | `src/shared/materials/materialCatalog.ts` | Active in client | Client maps selected material to producer/article/thickness. Server order recalculation currently ignores submitted material IDs. |
| Legacy materials | `src/config/materials.json` | Used by server only for old type lookup shape | Imported in `server-price.ts`, but not actually used to pass catalog material article/thickness into engine. |
| Hardware config | `src/config/hardware.json` | Used by server to pick base/comfort | Server maps `hardware.basePrice > 5000` to comfort; not supplier-level. |
| Hardware supplier catalog | `src/pricing/hardwareSupplierCatalog.ts` | Audit/debug | Foundation-only; requires confirmation; live hardware price must not switch to it yet. |
| Delivery | `src/pricing/delivery.ts` | Active | 6000 ₽ Moscow/MKAD, +50 ₽/km outside MKAD. Detection is text-marker based. |
| Assembly | `src/pricing/assembly.ts` | Active | 10% of furniture/base price, excluding delivery. |
| Production panels | `src/pricing/productionPanelPricing.ts` | Active on client when snapshot exists | Applies material/edge recalculation to client quote. Server does not mirror this path. |
| Production hardware | `src/pricing/productionHardwarePricing.ts` | Audit/debug | Not live-ready. |
| Production services | `src/pricing/productionServicesPricing.ts` | Audit/debug | Not live-ready. |
| Legacy constructor pricing | `src/constructor/pricing.ts`, `src/constructor/priceList.ts` | Legacy / risk | Separate calculation model and hardcoded price list. |

---

## 5. Direct answers to audit checklist

### 5.1. Источники данных для цены

Есть несколько источников:

1. Static seed catalog: `src/pricing/seed/price-items.json`.
2. Supabase catalog: `public.price_items` via `/api/price-items`.
3. Pricing policy constants: `src/pricing/pricingPolicy.ts`.
4. Material catalog: `src/shared/materials/materialCatalog.ts`.
5. Hardware foundation catalog: `src/pricing/hardwareSupplierCatalog.ts`.
6. Delivery constants: `src/pricing/delivery.ts`.
7. Assembly constants: `src/pricing/assembly.ts`.
8. Legacy pricing config: `src/config/pricing.json`.
9. Legacy constructor price list: `src/constructor/priceList.ts`.

### 5.2. Где именно считается цена

Live/client:

- `src/static-pages/constructor/hooks/useConstructorQuote.ts`
- `src/shared/lib/price.ts`
- `src/pricing/engine.ts`
- optional: `src/static-pages/constructor/adapters/productionPricingPreview.ts`
- `src/pricing/productionPanelPricing.ts`
- `src/pricing/delivery.ts`
- `src/pricing/assembly.ts`

Server/order:

- `api/orders.ts`
- `api/_shared/server-price.ts`
- `src/pricing/engine.ts`
- `src/pricing/delivery.ts`
- `src/pricing/assembly.ts`

Legacy:

- `src/shared/lib/pricing-core.ts`
- `src/constructor/pricing.ts`

### 5.3. Есть ли несколько источников расчёта

Да. Минимум пять:

1. Catalog engine.
2. Production-panel adjusted price.
3. Server catalog recalculation.
4. Legacy core / quick estimate.
5. Old constructor pricing.

### 5.4. Есть ли расхождения между клиентом и сервером

Да, риск подтверждён архитектурно.

Клиент передаёт в engine конкретные `producer/article/thickness` для корпуса и фасада, а также может применить `production-panel` пересчёт. Серверный `calculateServerPrice()` пересчитывает без этих material-specific параметров и без production-panel path.

### 5.5. Корректно ли применяется коэффициент `x1.3`

В основных источниках — да:

- DB schema генерирует `retail_price = source_price * markup_multiplier`.
- Seed содержит `markupMultiplier: 1.3` и `retailPrice`.
- `pricingPolicy.ts` фиксирует `CLIENT_PRICE_MULTIPLIER = 1.3`.
- `check-price-integrity.mjs` проверяет множитель и retail price.

Риск: множитель дублируется вручную в fallback-ставках и legacy price list. Это не ошибка текущего расчёта, но риск будущего рассинхрона.

### 5.6. Корректно ли считается доставка

Формула соответствует решению:

- внутри МКАД / Москва: 6000 ₽;
- за МКАД: 6000 ₽ + 50 ₽/км.

Риск: зона определяется по текстовым маркерам адреса. Для неизвестного адреса при включённой доставке цена становится 6000 ₽ с предупреждающим сообщением, что может быть слишком оптимистично для МО.

### 5.7. Корректно ли считается сборка

Формула соответствует решению: 10% от стоимости мебели без доставки.

Клиент после `production-panel` пересчёта считает сборку от `nextPrice.total`. Сервер считает сборку от `basePrice.total`, но серверный `basePrice` сейчас не повторяет клиентский `production-panel` и material-specific path. Поэтому формула верная, но base может отличаться.

### 5.8. Корректно ли учитываются материалы

Частично.

Client path учитывает выбранные материалы через `materialPricingContext` и article/thickness. Server path принимает `materials` в payload, но не использует их в `calculateServerPrice()`.

### 5.9. Корректно ли учитывается кромка

Частично.

Catalog engine считает кромку по приближённой формуле `edgeLengthM`. Production-panel pricing считает кромку по `productionModel.edgeBanding`. Client может применять production-panel edge price. Server — нет.

### 5.10. Корректно ли учитывается упаковка

Частично.

Catalog engine учитывает упаковку через service `гофрокартон` или fallback. Production-services debug считает упаковку как stretch + carton, но live-price не меняет. Нужно финально решить, входит ли stretch в live packaging для MVP.

### 5.11. Есть ли мёртвый pricing-код

Да, есть legacy / quarantine-код:

- `src/shared/lib/pricing-core.ts`
- `calculateLegacyPrice()`
- `quickEstimate()`
- `src/constructor/pricing.ts`
- `src/constructor/priceList.ts`

Не всё можно удалять сразу: часть может использоваться для quick estimate / migration / fallback. Но нужны import guards и quarantine-статус.

### 5.12. Есть ли дублирование pricing-логики

Да. Дублирование есть между:

- catalog engine и old constructor pricing;
- static seed and Supabase runtime API;
- catalog material formula and production-panel material formula;
- catalog hardware formula and production hardware debug formula;
- catalog services formula and production services debug formula;
- `CLIENT_PRICE_MULTIPLIER` and hardcoded `1.3` in fallbacks/legacy paths.

---

## 6. Found risks

| ID | Risk | Level | Consequence | Fix complexity | Recommendation |
|---|---|---:|---|---:|---|
| PVA-01 | Client/server price divergence | High | User sees one total, saved order/email may contain another total. Trust and conversion risk. | L | Add parity tests first. Then make server use same material context and controlled production-panel path, or disable client production-panel live application until server parity exists. |
| PVA-02 | Static seed vs Supabase runtime split | High | `/api/price-items` can show Supabase prices while live calculator uses bundled seed. Price updates may not affect actual quote. | M/L | Decide source of truth: seed build artifact or Supabase runtime. Document it and test it. |
| PVA-03 | Multiple calculators | High | Agents can accidentally modify/import the wrong pricing path. | M | Quarantine legacy pricing and add import guard tests. |
| PVA-04 | `x1.3` duplicated in fallback constants | Medium | Future multiplier change will not propagate consistently. | S/M | Centralize all fallback multipliers through `pricingPolicy.ts`. |
| PVA-05 | Delivery zone text parser | Medium | Unknown/ambiguous MO addresses may be priced as 6000 ₽. | S/M | Add stronger validation or explicit zone/distance input for MO. |
| PVA-06 | Assembly validation uses client-provided base before server overwrite | Medium | Possible mismatch between validation and final server quote. | S | Validate final server assembly after server price build, not only client-provided base. |
| PVA-07 | Packaging model mismatch | Medium | Live catalog counts carton only; production debug counts carton + stretch. | M | Decide MVP packaging formula and add tests. |
| PVA-08 | Edge appears in materials and also in quote service grouping | Medium | Total is not necessarily double-counted, but breakdown can confuse manager/client. | S/M | Define canonical breakdown taxonomy. |
| PVA-09 | Hardware supplier catalog is foundation-only | Medium/High | Production hardware estimate must not become live until confirmed supplier prices exist. | L | Keep decision layer blocked until supplier prices are imported and coverage is 100%. |
| PVA-10 | Production services/drilling norms not live-ready | Medium | Services cannot be production-grade without confirmed norms. | L | Keep audit/debug only. Confirm cutting/drilling/packaging norms before integration. |
| PVA-11 | Tests are mostly smoke/positive checks | High | Regressions in parity, material selection, packaging and server overwrite can pass. | M | Add mandatory pricing parity suite. |
| PVA-12 | Docs overstate production-model live pricing | Medium | Agents may assume server already uses production-panel live price. | S | Clarify docs: client applies production-panel; server parity still unresolved. |
| PVA-13 | Legacy price list still contains hardcoded catalog | Medium | Wrong source may be used accidentally by future agents. | S/M | Add `check:no-legacy-pricing-imports` for active constructor/server paths. |

---

## 7. Mandatory tests before changing pricing

1. **Client/server parity: base wardrobe**  
   Same order payload must produce equal client and server totals.

2. **Client/server parity: selected material**  
   Changing body/facade material must change both client and server totals identically.

3. **Client/server parity: production-panel pricing**  
   If client applies `production-panels`, server must either apply the same path or the client must not use it as live total.

4. **Assembly base test**  
   Assembly must be `10%` of furniture price excluding delivery, including any approved material/production-panel price adjustments.

5. **Delivery matrix test**  
   Cases: delivery off, Moscow, within MKAD, outside MKAD with km, outside MKAD without km, unknown address.

6. **Coefficient integrity test**  
   All seed and DB rows: `retail = source * 1.3`. Also test fallback constants do not use raw `1.3` outside policy.

7. **Seed/Supabase parity test**  
   For production: Supabase row count and sampled rows must match active seed/import batch, or source must be explicitly `seed`.

8. **Edge no-double-count test**  
   `total` must count edge once, regardless of whether edge appears in `materials` or service display grouping.

9. **Packaging formula test**  
   Confirm whether live packaging is carton only or carton + stretch. Lock it with tests.

10. **Hardware decision guard test**  
    Production hardware must remain `blocked`/audit-only while any SKU is foundation/fixed/confirmation-required.

11. **Services decision guard test**  
    Production services must remain audit-only/blocked while norms are fixed/fallback or not confirmed.

12. **Legacy import guard**  
    Active constructor/server/order paths must not import `src/constructor/pricing.ts`, `src/constructor/priceList.ts`, or `calculatePriceCore()` except in explicitly allowed tests/legacy fallback.

13. **Server overwrite test**  
    A malicious client `totalPrice` must be ignored, and server result must be deterministic.

14. **Breakdown taxonomy test**  
    `body + facades + filling + hardware + services + edgeBanding + delivery + assembly` must reconcile with `total` according to one documented formula.

---

## 8. Recommendations

### P0 before implementation

1. Do not change pricing formulas before adding parity tests.
2. Decide and document the live source of truth:
   - Option A: bundled seed is live source, Supabase is admin/catalog API only;
   - Option B: Supabase is live source, pricing engine becomes async/server-backed;
   - Option C: seed is build-time mirror of Supabase, release blocked if they diverge.
3. Align server pricing with client pricing:
   - use submitted material IDs to resolve producer/article/thickness;
   - either apply `production-panel` pricing server-side from submitted/validated production export;
   - or keep production-panel pricing debug-only on client until server parity exists.
4. Quarantine legacy pricing with import guards.
5. Clarify packaging formula.
6. Keep hardware/services production pricing audit-only until confirmed supplier prices and production norms exist.

### For the next Pricing Agent

Recommended next task: **Pricing Parity Test Foundation**.

Do only tests first:

- no formula change;
- no UI change;
- no checkout rewrite;
- no production model rewrite.

The next agent should create a suite that fails on the current client/server divergence, then implement the smallest safe fix in a separate task.

---

## 9. QA status

No tests were executed in this audit stage. This was intentionally docs-only and analysis-only.

Changed files:

- `docs/pricing/pricing-validation-audit-v1.md`

Not changed:

- source code;
- pricing engine;
- constructor;
- checkout;
- production logic;
- UI;
- tests.
