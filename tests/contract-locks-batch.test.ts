import assert from "node:assert/strict";
import test from "node:test";
import { assertCatalogSourceConsistency } from "../api/_shared/server-price.js";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage.js";
import { buildBasisScriptPlan } from "../src/constructor/basisAdapter.js";
import { createDefaultProject } from "../src/constructor/schema.js";
import {
  buildOrderPayloadFromConstructor,
  type ConstructorSnapshot,
} from "../src/static-pages/constructor/adapters/constructorPayload.js";
import type { QuoteState } from "../src/static-pages/constructor/types.js";
import {
  createCanonicalConstructorSnapshot,
  extractProductionConfigFingerprint,
} from "../src/static-pages/constructor/validation/canonicalContract.js";
import { validateConstructorSystemConsistency } from "../src/static-pages/constructor/validation/systemConsistency.js";
import { makeValidOrder } from "./fixtures/order-contract-fixture.js";

const FORBIDDEN_BASIS_AUTO_B3D_CLAIMS = [
  "document:create-b3d",
  '"documentType":"b3d"',
  "автоматической генерации",
] as const;

test("pricing contract lock: catalog source consistency matrix", () => {
  assert.equal(assertCatalogSourceConsistency("supabase_success", "supabase"), true);
  assert.equal(assertCatalogSourceConsistency("supabase_success", "seed_fallback"), false);
  assert.equal(assertCatalogSourceConsistency("supabase_empty", "seed_fallback"), true);
  assert.equal(assertCatalogSourceConsistency("supabase_failed", "seed_fallback"), true);
  assert.equal(assertCatalogSourceConsistency("seed_fallback", "seed_fallback"), true);
  assert.equal(assertCatalogSourceConsistency("seed_fallback", "supabase"), false);
});

test("pricing contract lock: production export fingerprint is pricing-independent", () => {
  const baseline = buildProductionExportFromPayload(makeValidOrder());
  const priced = buildProductionExportFromPayload({
    ...makeValidOrder(),
    totalPrice: 1,
    priceBreakdown: {
      body: 1,
      facades: 1,
      filling: 1,
      hardware: 1,
      production: 1,
      materials: 1,
      edgeBanding: 1,
      services: 1,
      delivery: 1,
      assembly: 1,
    },
  });
  assert.deepEqual(
    extractProductionConfigFingerprint(baseline),
    extractProductionConfigFingerprint(priced),
  );
});

test("order flow contract lock: production export replay is deterministic", () => {
  const first = buildProductionExportFromPayload(makeValidOrder());
  const second = buildProductionExportFromPayload(makeValidOrder());
  assert.deepEqual(first, second);
});

test("order flow contract lock: persisted export package invariants", () => {
  const pack = buildProductionExportFromPayload(makeValidOrder());
  assert.equal(pack.schema, "razmerno.production-export.v1");
  assert.equal(pack.source, "api-order");
  assert.equal(pack.basis.status, "manual-json-ready");
  assert.equal(pack.review.visibleToClient, false);
  assert.equal(pack.revisions.length, 1);
  assert.ok(pack.productionModel.panels.length > 0);
  assert.ok(pack.validation.summary.panels > 0);
});

test("constructor state contract lock: canonical snapshot replay is stable", () => {
  const snapshot: ConstructorSnapshot = {
    furniture: "wardrobe",
    width: 1800,
    height: 2400,
    depth: 600,
    fill: "shelves",
    sections: 2,
    compartments: 2,
    handleless: false,
    material: "white",
    deliveryEnabled: false,
    assemblyEnabled: false,
    deliveryAddress: "",
    contact: { name: "Иван", phone: "+7 999 111-22-33", email: "ivan@example.ru", company: "" },
    consent: true,
  };
  const quote: QuoteState = {
    total: 50000,
    materials: 30000,
    hardwareAndFilling: 8000,
    services: 7000,
    extra: 5000,
    message: "Ориентировочная стоимость",
    price: {
      body: 10000,
      facades: 9000,
      filling: 3000,
      hardware: 4000,
      production: 2500,
      delivery: 0,
      total: 45000,
      isPreliminary: true,
      materials: 30000,
      edgeBanding: 1500,
      services: 5500,
      source: "catalog",
      debug: {
        bodyAreaM2: 1,
        facadeAreaM2: 1,
        backAreaM2: 1,
        edgeLengthM: 1,
        boardPriceM2: 1,
        facadePriceM2: 1,
        edgePriceM: 1,
      },
    },
    deliveryQuote: { enabled: false, address: "", zone: "unknown", distanceKm: 0, price: 0, message: "" },
    assemblyQuote: { enabled: false, rate: 0.1, basePrice: 45000, price: 0, message: "" },
    formatPrice: (value) => `${value} ₽`,
  };
  const payload = buildOrderPayloadFromConstructor(snapshot, quote, {
    source: "constructor-store-adapter",
    acceptedAt: "2026-06-23T18:00:00.000Z",
  });
  const productionExport = buildProductionExportFromPayload(payload);
  const first = createCanonicalConstructorSnapshot(snapshot, quote, payload, productionExport);
  const second = createCanonicalConstructorSnapshot(snapshot, quote, payload, productionExport);
  assert.deepEqual(first, second);
  assert.equal(validateConstructorSystemConsistency(first).length, 0);
});

test("basis boundary lock: legacy basis script plan uses manual plan command id", () => {
  const plan = buildBasisScriptPlan(createDefaultProject());
  const firstCommand = plan.commands[0];
  assert.equal(firstCommand?.id, "document:plan-basis-3d-doc");
  assert.equal((firstCommand?.payload as { documentType?: string }).documentType, "basis-manual-plan");
  const serialized = JSON.stringify(plan);
  for (const forbidden of FORBIDDEN_BASIS_AUTO_B3D_CLAIMS) {
    assert.ok(!serialized.includes(forbidden), `forbidden claim: ${forbidden}`);
  }
});

test("basis boundary lock: v3 export JSON has no auto-b3d claims", () => {
  const pack = buildProductionExportFromPayload(makeValidOrder());
  const serialized = JSON.stringify(pack);
  assert.equal(pack.basis.status, "manual-json-ready");
  for (const forbidden of FORBIDDEN_BASIS_AUTO_B3D_CLAIMS) {
    assert.ok(!serialized.includes(forbidden), `forbidden claim: ${forbidden}`);
  }
});
