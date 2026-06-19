# Pricing Parity Audit v1 — Размерно

Дата: 2026-06-14  
Статус: audit-only  
Роль: Pricing Lead  
Scope: проверить соответствие client quote → checkout payload → server recalculation. Код, pricing engine, constructor, checkout, production logic, UI и тесты не менялись.

---

## 1. Executive summary

Pricing parity сейчас **не подтверждён**. По коду есть архитектурно доказанный риск, что пользователь видит одну цену в Constructor3D, checkout payload отправляет эту цену, а сервер сохраняет/отправляет менеджеру другую цену после собственного пересчёта.

Критичный источник расхождения:

1. Клиентский расчёт учитывает выбранные материалы через `materialPricingContext` и передаёт в `calculatePrice()` `producer`, `article`, `thickness` для корпуса и фасада.
2. Клиентский расчёт при наличии `snapshot` применяет `production-panel` pricing и заменяет `catalogPrice` на `productionBundle.appliedPrice.price`.
3. Серверный `calculateServerPrice()` пересчитывает заявку через `calculateCatalogPrice()` без material-specific параметров и без production-panel pricing.
4. Checkout payload содержит `materials.bodyId`, `materials.facadeId`, `materials.backPanelId`, но серверный price recalculation их не использует.
5. Сборка считается правильно как 10%, но base price для сборки на клиенте и сервере может отличаться из-за разных price paths.

Вывод: **перед любыми pricing-правками нужно добавить parity tests. Исправлять формулы до тестов нельзя.**

---

## 2. Проверенные price paths

### 2.1. Client quote path

```text
useConstructorQuote()
  -> buildConstructorMaterialPricingContext()
  -> calculatePrice()
  -> calculateDeliveryQuote()
  -> calculateAssemblyQuote(catalogPrice.total)
  -> if snapshot:
      buildConstructorProductionPricingBundle()
        -> summarizeProductionPanelPricing()
        -> applyProductionPanelPricingToCatalogPrice()
      nextPrice = productionBundle.appliedPrice.price
  -> calculateAssemblyQuote(nextPrice.total)
  -> quote.total
```

Клиентский путь material-aware и production-panel-aware.

### 2.2. Checkout payload path

```text
buildOrderPayloadFromConstructor(snapshot, quote)
  -> productType
  -> dimensions
  -> sections
  -> filling
  -> layout
  -> materials: bodyId / facadeId / facadeKind / backPanelId
  -> style: facadeStyleId / hardwareId
  -> priceBreakdown from quote
  -> totalPrice from quote.total
  -> delivery
  -> assembly
```

Payload сохраняет выбранные материалы и клиентскую цену, но сервер позже перезаписывает цену.

### 2.3. Server recalculation path

```text
api/orders.ts
  -> validateOrder(body)
  -> calculateServerPrice(body)
      -> calculateCatalogPrice({
           type,
           dimensions,
           sections,
           filling,
           facadeStyleMultiplier,
           hardwareLevel
         })
      -> calculateDeliveryQuote()
      -> calculateAssemblyQuote(basePrice.total)
  -> withServerPrice(body, serverPrice)
  -> DB/email
```

Серверный путь защищает от подмены цены, но не повторяет клиентский material-aware и production-panel-aware расчёт.

---

## 3. Parity status by component

| Component | Client | Payload | Server | Parity status | Risk |
|---|---|---|---|---|---|
| Dimensions | Uses current width/height/depth | Sends dimensions | Uses dimensions | Likely OK | Low |
| Product type | Uses selectedFurniture.productType | Sends productType | Uses productType | Likely OK | Low |
| Sections | Uses sections | Sends sections | Uses sections | Likely OK | Low |
| Filling totals | Computes from explicit layout/counts | Sends filling | Uses filling | Mostly OK | Medium if layout and filling diverge |
| Body material | Uses materialId → producer/article/thickness | Sends bodyId | Ignored in server price | Broken | High |
| Facade material | Uses facadeMaterialId → producer/article/thickness | Sends facadeId/facadeKind | Ignored in server price | Broken | High |
| Back panel material | Production-panel path can include HDF bucket | Sends backPanelId | Ignored in server price | Broken | Medium |
| Facade style | Client uses handleless ? 1.08 : 1 | Sends no-handle / regular | Server uses config multiplier: no-handle = 1.15 | Broken | High |
| Hardware level | Client maps handleless to base/comfort through hardcoded basePrice | Sends base/comfort | Server maps config basePrice > 5000 | Mostly aligned for current values | Medium |
| Production-panel materials | Applied on client when snapshot exists | Sends productionExport after server build, not client live bundle | Server does not apply to price | Broken | High |
| Delivery | Same module | Sends delivery | Same module | OK if same address | Low/Medium due text parser |
| Assembly | Same module | Sends assembly | Same module, but different base possible | Formula OK, base risk | High |
| Total price | quote.total | Sends totalPrice | Server overwrites | Not guaranteed | High |

---

## 4. Detailed findings

### PAR-01 — Body/facade material parity is broken

**Level:** High  
**Where:** client `useConstructorQuote()` vs server `calculateServerPrice()`  
**Consequence:** material changes can affect UI quote but not server quote.

Client passes:

- `bodyProducer`
- `bodyArticle`
- `bodyThicknessMm`
- `facadeProducer`
- `facadeArticle`
- `facadeThicknessMm`
- `facadeMaterialKind`

Server passes none of these into `calculateCatalogPrice()`.

**Required test:**

- Same wardrobe, same dimensions.
- Body/facade material A vs material B.
- Client total must change.
- Server total must change identically.

Expected current result: likely fail.

---

### PAR-02 — Production-panel pricing is client-live but server-absent

**Level:** High  
**Where:** `useConstructorQuote()` and `productionPricingPreview.ts` vs `server-price.ts`  
**Consequence:** quote shown to user may use `source: "production-panels"`, but server order price falls back to `source: "catalog"`.

Client:

```text
nextPrice = productionBundle.appliedPrice.price
```

Server:

```text
basePrice = calculateCatalogPrice(...)
```

No production-panel application.

**Required test:**

- Build a snapshot that triggers production-panel pricing.
- Compare `quote.price.source` to server price source.
- Compare total before delivery/assembly.

Expected current result: fail if snapshot exists.

---

### PAR-03 — Facade style multiplier differs between client and server

**Level:** High  
**Where:** client `handleless ? 1.08 : 1` vs server `facade-styles.json`  
**Consequence:** handleless order can be priced differently.

Client currently uses hardcoded:

```text
facadeStyleMultiplier: handleless ? 1.08 : 1
```

Server uses config:

```text
no-handle = 1.15
regular = 1.0
```

Payload sends `facadeStyleId: snapshot.handleless ? "no-handle" : "regular"`, so server chooses `1.15` for no-handle. Client uses `1.08`.

**Required test:**

- Same wardrobe, `handleless=false` vs `handleless=true`.
- Compare client/server delta.

Expected current result: fail for handleless.

---

### PAR-04 — Assembly formula is correct, but assembly base can diverge

**Level:** High  
**Where:** `calculateAssemblyQuote()` is shared, but base price differs.

Formula is correct:

```text
assembly = 10% * basePrice
```

But client calculates assembly after `nextPrice` and server calculates after server `basePrice`. If client `nextPrice` differs from server `basePrice`, assembly also diverges.

**Required test:**

- Use production-panel enabled quote with assembly enabled.
- Verify client assembly base equals server assembly base.

Expected current result: likely fail.

---

### PAR-05 — Delivery parity is mostly OK, but unknown address remains risky

**Level:** Medium  
**Where:** shared `delivery.ts`.

Both client and server use the same module. Base formula is aligned:

- Moscow/MKAD: 6000 ₽;
- outside MKAD: 6000 ₽ + 50 ₽/km.

Risk remains because unknown address returns 6000 ₽ with a message that distance may be needed.

**Required test:**

- delivery off;
- Москва;
- Московская область 20 км;
- Московская область without km;
- unknown address.

Expected current result: formula tests pass, UX/business rule may require stricter validation.

---

### PAR-06 — Checkout payload stores client price but server overwrites it

**Level:** Medium/High  
**Where:** `buildOrderPayloadFromConstructor()` and `withServerPrice()`.

This is correct for security: server must not trust client `totalPrice`.

But without parity, overwrite can silently alter the order after user confirms checkout.

**Required test:**

- Build payload with intentionally modified `totalPrice`.
- Server must ignore modified value.
- For valid unmodified payload, server total must equal client quote.

Expected current result:

- malicious overwrite protection likely passes;
- valid parity likely fails in material/production-panel scenarios.

---

## 5. Scenario matrix for required parity tests

| Scenario | Purpose | Expected current status |
|---|---|---|
| Base wardrobe, regular handles, default material, no delivery, no assembly | Basic parity baseline | May pass if default material matches server fallback |
| Same + Moscow delivery | Delivery parity | Should pass |
| Same + MO 20 km delivery | Delivery distance parity | Should pass |
| Same + assembly | Assembly baseline | May pass if base price same |
| Change body material only | Material parity | Likely fail |
| Change facade material to MDF | Material/facade parity | Likely fail |
| Handleless order | Facade style multiplier parity | Likely fail |
| Snapshot with production-panel pricing | Production-panel parity | Likely fail |
| Snapshot + assembly | Production-panel assembly base | Likely fail |
| Malicious lower `totalPrice` in payload | Security overwrite | Should pass |
| Payload with layout/filling mismatch | Validation/model parity | Needs explicit expected rule |

Evidence update:

- P0-13A adds passing fixtures in `tests/checkout-submit-hook.test.ts`.
- Covered now: default baseline currently matches, body material change diverges, facade material change diverges, no-handle multiplier currently matches, server assembly base is deterministic.
- Not covered in this PR: delivery distance matrix, production-panel parity, quote/order/stored price snapshot parity and malicious lower payload overwrite.
- This evidence does not close P0-13 and does not fix formulas.
- P0-13B evidence candidate: server catalog pricing now consumes selected body/facade material tokens when they are known; body-material and facade-material fixtures now assert parity instead of divergence. Remaining gaps stay open: delivery/assembly matrix, production-panel parity, quote/order/stored price snapshot parity and malicious lower payload overwrite.

---

## 6. Recommended next implementation sequence

### Step 1 — Add tests only

Create a new parity test file, for example:

```text
src/pricing/pricingParity.test.ts
```

or API-level:

```text
api/_shared/server-price.parity.test.ts
```

Tests should build realistic constructor payloads and compare:

```text
clientQuote.total === calculateServerPrice(payload).total
```

No formula changes in this step.

### Step 2 — Decide source of truth

Before fixing, choose one of two safe directions:

#### Option A — Server mirrors client pricing path

Server resolves:

- bodyId;
- facadeId;
- backPanelId;
- material producer/article/thickness;
- production-panel pricing if productionExport/snapshot is valid.

Pros: true parity.  
Cons: more work and careful validation required.

#### Option B — Client stops applying production-panel as live total

Client keeps production-panel as debug/manager preview only until server path is ready.

Pros: safer short term.  
Cons: less production-accurate client quote.

### Step 3 — Fix facade style source

Remove hardcoded client multiplier and use the same facade style config/source as server.

### Step 4 — Add guard against future divergence

Make parity tests required in `qa:all` or pricing QA scripts.

---

## 7. Stop conditions

Next agent must stop and ask for architecture review if the fix requires:

- changing checkout payload contract;
- changing production export contract;
- switching live price to Supabase runtime;
- making pricing engine async;
- enabling production hardware/services live price;
- changing business rules for delivery/assembly.

---

## 8. Final recommendation

Do not continue with broad pricing refactor yet.

The next safe task is:

```text
Pricing Task 002 — Add client/server pricing parity tests
```

Strict scope:

- add tests only;
- no formula changes;
- no checkout/UI changes;
- tests should expose current divergence;
- after tests fail honestly, open a separate task for the smallest safe fix.

---

## 9. QA status

No automated tests were executed in this stage. This audit is documentation-only.

Changed files:

- `docs/pricing/pricing-parity-audit-v1.md`

Not changed:

- source code;
- pricing engine;
- constructor;
- checkout;
- production logic;
- UI;
- tests.
