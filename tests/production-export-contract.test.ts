import assert from "node:assert/strict";

import type { OrderRequest } from "../api/_shared/order-types";
import { makeValidOrder } from "./fixtures/order-contract-fixture";
import {
  buildProductionExportFromOrder,
  buildProductionExportFromPayload,
} from "../src/constructor/production/orderExportPackage";
import type { ProductionExportPackage } from "../src/constructor/production/types";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const FORBIDDEN_EXPORT_PATTERNS = [
  /"totalPrice"/,
  /"priceBreakdown"/,
  /"price_breakdown"/,
  /"customer_name"/,
  /"customer_phone"/,
  /"customer_email"/,
  /"customerEmail"/,
  /"manualPricingDraft"/,
  /"manual_total_price"/,
  /"catalog_source_used"/,
  /"pricing_source_diagnostic"/,
  /"pricing_fallback_reason"/,
  /"honeypot"/,
  /"client_ip"/,
  /"user_agent"/,
  /"manager_email_status"/,
  /"operations:approve"/,
] as const;

const PII_FIXTURES = {
  name: "Иван Петров",
  phone: "+7 999 111-22-33",
  email: "client@example.com",
} as const;

function makeProductionPayload(overrides: Partial<OrderRequest> = {}): OrderRequest {
  return makeValidOrder({
    consent: {
      personalData: true,
      privacyVersion: "2026-05-24",
      acceptedAt: "2026-06-23T18:00:00.000Z",
    },
    customer: { ...PII_FIXTURES, comment: "Позвонить после 12:00" },
    ...overrides,
  });
}

function assertForbiddenFieldsAbsent(serialized: string, label: string) {
  for (const pattern of FORBIDDEN_EXPORT_PATTERNS) {
    assert.doesNotMatch(serialized, pattern, `${label}: forbidden field pattern ${pattern}`);
  }
  assert.ok(!serialized.includes(PII_FIXTURES.email), `${label}: must exclude customer email`);
  assert.ok(!serialized.includes(PII_FIXTURES.phone), `${label}: must exclude customer phone`);
  assert.ok(!serialized.includes(PII_FIXTURES.name), `${label}: must exclude customer name`);
}

function assertRequiredManufacturingFields(exportPack: ProductionExportPackage, label: string) {
  assert.equal(exportPack.schema, "razmerno.production-export.v1", `${label}: schema`);
  assert.equal(exportPack.units, "mm", `${label}: units`);
  assert.equal(exportPack.source, "api-order", `${label}: source`);
  assert.equal(exportPack.project.meta.schemaVersion, 3, `${label}: project schemaVersion`);
  assert.ok(exportPack.project.dimensions.widthMm > 0, `${label}: width`);
  assert.ok(exportPack.project.dimensions.heightMm > 0, `${label}: height`);
  assert.ok(exportPack.project.dimensions.depthMm > 0, `${label}: depth`);
  assert.ok(exportPack.project.structure.sectionCount > 0, `${label}: sectionCount`);
  assert.ok(exportPack.project.material.bodyMaterialId, `${label}: body material`);
  assert.ok(exportPack.project.material.facadeMaterialId, `${label}: facade material`);
  assert.ok(exportPack.project.structure.hardwareMode, `${label}: hardware mode`);
  assert.ok(exportPack.productionModel.panels.length > 0, `${label}: panels`);
  assert.ok(exportPack.productionModel.hardware.length > 0, `${label}: hardware`);
  assert.ok(exportPack.productionModel.drilling.length > 0, `${label}: drilling`);
  assert.ok(exportPack.productionModel.edgeBanding.length > 0, `${label}: edge banding`);
  assert.ok(exportPack.basis.plan.length > 0, `${label}: basis plan`);
  assert.equal(exportPack.basis.status, "manual-json-ready", `${label}: basis status`);
  assert.equal(exportPack.review.visibleToClient, false, `${label}: not client-visible`);
  assert.ok(exportPack.meta.configVersion, `${label}: configVersion metadata`);
}

test("production export contract: authoritative builder includes required manufacturing fields", () => {
  const payload = makeProductionPayload({
    layout: {
      sections: [
        {
          id: "section-1",
          widthMm: 900,
          compartments: [
            {
              id: "section-1-zone-1",
              kind: "shelves",
              heightMm: 2200,
              shelves: 2,
              drawers: 0,
              hasRod: false,
            },
          ],
        },
        {
          id: "section-2",
          widthMm: 900,
          compartments: [
            {
              id: "section-2-zone-1",
              kind: "rod",
              heightMm: 2200,
              shelves: 2,
              drawers: 0,
              hasRod: true,
            },
          ],
        },
      ],
    },
  });

  const exportPack = buildProductionExportFromPayload(payload);
  assertRequiredManufacturingFields(exportPack, "baseline wardrobe");
  assert.equal(exportPack.project.structure.shelves, payload.filling?.shelves ?? 0);
  assert.equal(exportPack.project.structure.drawers, payload.filling?.drawers ?? 0);
  assert.equal(exportPack.project.structure.hangingRod, payload.filling?.hangingRod ?? false);
});

test("production export contract: payload excludes customer, pricing and internal operations fields", () => {
  const payload = makeProductionPayload({
    orderId: "RZ-20260708-8001",
    totalPrice: 123_456,
    priceBreakdown: {
      body: 1,
      facades: 1,
      filling: 1,
      hardware: 1,
      production: 1,
      materials: 1,
      edgeBanding: 1,
      services: 1,
      delivery: 9_999,
      assembly: 8_888,
    },
    delivery: { enabled: true, address: "Москва, ул. Секретная, 1", price: 9_999 },
    assembly: { enabled: true, price: 8_888, rate: 0.1, basePrice: 100_000 },
  });

  const exportPack = buildProductionExportFromPayload(payload);
  const serialized = JSON.stringify(exportPack);

  assertForbiddenFieldsAbsent(serialized, "production export JSON");
  assert.ok(!serialized.includes("Москва, ул. Секретная"), "production export JSON: must exclude delivery address");
});

test("production export contract: generation is deterministic and pricing-independent", () => {
  const payload = makeProductionPayload();
  const first = buildProductionExportFromPayload(payload);
  const second = buildProductionExportFromPayload(payload);
  const changedPricing = buildProductionExportFromPayload({
    ...payload,
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
    customer: {
      name: "Другой клиент",
      phone: "+7 900 000-00-00",
      email: "other@example.com",
    },
  });

  assert.deepEqual(first, second);
  assert.deepEqual(first, changedPricing);
});

test("production export contract: order and payload builders share the same authoritative export shape", () => {
  const payload = makeProductionPayload();
  const fromPayload = buildProductionExportFromPayload(payload);
  const fromOrder = buildProductionExportFromOrder(payload);

  assert.deepEqual(fromPayload, fromOrder);
});

test("production export contract: manufacturing totals are geometry counts not monetary prices", () => {
  const exportPack = buildProductionExportFromPayload(makeProductionPayload());
  const totals = exportPack.productionModel.totals;
  const validation = exportPack.validation.summary;

  assert.ok(typeof totals.panelCount === "number");
  assert.ok(typeof totals.hardwareCount === "number");
  assert.ok(typeof totals.drillingCount === "number");
  assert.ok(typeof totals.edgeBandingLengthMm === "number");
  assert.equal(validation.panels, totals.panelCount);
  assert.equal(validation.hardware, totals.hardwareCount);
  assert.equal(validation.drilling, totals.drillingCount);
  assert.equal(validation.edgeBandingLengthMm, totals.edgeBandingLengthMm);
  assert.doesNotMatch(JSON.stringify(totals), /"totalPrice"|"priceBreakdown"|"rubles"|"₽"/i);
});

test("production export contract: basis boundary remains manual-json-ready without auto-b3d claims", () => {
  const exportPack = buildProductionExportFromPayload(makeProductionPayload());
  const serialized = JSON.stringify(exportPack);

  assert.equal(exportPack.basis.status, "manual-json-ready");
  assert.doesNotMatch(serialized, /create-b3d|"documentType":"b3d"/);
  assert.doesNotMatch(serialized, /автоматической генерации/i);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
