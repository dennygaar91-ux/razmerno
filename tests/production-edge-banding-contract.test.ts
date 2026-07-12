import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { DEFAULT_FACTORY_PROFILE } from "../src/constructor/production/factoryProfile";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage";
import type { ProductionExportPackage } from "../src/constructor/production/types";
import { makeValidOrder } from "./fixtures/order-contract-fixture";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const EDGE_SIDES = ["front", "back", "left", "right"] as const;
const BODY_EDGE_ROLES = new Set([
  "side-left",
  "side-right",
  "top",
  "bottom",
  "vertical-partition",
  "shelf",
  "plinth",
  "drawer-side",
  "drawer-back",
]);
const FACADE_EDGE_ROLES = new Set(["facade-door", "drawer-front"]);
const NO_EDGE_ROLES = new Set(["back-panel", "drawer-bottom"]);

const FORBIDDEN_EXPORT_PATTERNS = [
  /"totalPrice"/,
  /"priceBreakdown"/,
  /"price_breakdown"/,
  /"customer_name"/,
  /"customer_phone"/,
  /"customer_email"/,
  /"customerEmail"/,
  /"manualPricingDraft"/,
  /"catalog_source_used"/,
  /"pricing_source_diagnostic"/,
  /"pricing_fallback_reason"/,
] as const;

const PII_FIXTURES = {
  name: "Иван Петров",
  phone: "+7 999 111-22-33",
  email: "client@example.com",
} as const;

function assertForbiddenFieldsAbsent(serialized: string, label: string) {
  for (const pattern of FORBIDDEN_EXPORT_PATTERNS) {
    assert.doesNotMatch(serialized, pattern, `${label}: forbidden field pattern ${pattern}`);
  }
  assert.ok(!serialized.includes(PII_FIXTURES.email), `${label}: must exclude customer email`);
  assert.ok(!serialized.includes(PII_FIXTURES.phone), `${label}: must exclude customer phone`);
  assert.ok(!serialized.includes(PII_FIXTURES.name), `${label}: must exclude customer name`);
}

function assertEdgeBandingPolicy(exportPack: ProductionExportPackage, label: string) {
  const panelById = new Map(exportPack.productionModel.panels.map((panel) => [panel.id, panel]));

  for (const panel of exportPack.productionModel.panels) {
    const edgeBanding = panel.edgeBanding ?? {};

    if (BODY_EDGE_ROLES.has(panel.role)) {
      for (const side of EDGE_SIDES) {
        assert.ok(edgeBanding[side], `${label}: ${panel.role} ${panel.id} missing ${side} edge`);
        assert.equal(edgeBanding[side]!.thicknessMm, 1, `${label}: body edge must be 1 mm`);
      }
      continue;
    }

    if (FACADE_EDGE_ROLES.has(panel.role)) {
      for (const side of EDGE_SIDES) {
        assert.ok(edgeBanding[side], `${label}: ${panel.role} ${panel.id} missing ${side} edge`);
        assert.equal(edgeBanding[side]!.thicknessMm, 2, `${label}: facade edge must be 2 mm`);
      }
      continue;
    }

    if (NO_EDGE_ROLES.has(panel.role)) {
      assert.equal(Object.keys(edgeBanding).length, 0, `${label}: ${panel.role} must have no edge banding`);
    }
  }

  for (const edge of exportPack.productionModel.edgeBanding) {
    const panel = panelById.get(edge.panelId);
    assert.ok(panel, `${label}: edge references panel ${edge.panelId}`);
    if (panel!.role === "back-panel" || panel!.role === "drawer-bottom") continue;
    const expected = FACADE_EDGE_ROLES.has(panel!.role) ? 2 : 1;
    assert.equal(edge.thicknessMm, expected, `${label}: edge total for ${panel!.role}`);
  }
}

test("P1-24 factory profile locks edge banding to all-sides body 1 mm / facade 2 mm", () => {
  assert.equal(DEFAULT_FACTORY_PROFILE.edgeBanding.edgeAllSides, true);
  assert.equal(DEFAULT_FACTORY_PROFILE.edgeBanding.otherThicknessMm, 1);
  assert.equal(DEFAULT_FACTORY_PROFILE.edgeBanding.facadeThicknessMm, 2);
});

test("P1-24 production export applies all-sides edge banding policy on body and facade panels", () => {
  const payload = makeValidOrder({
    filling: { shelves: 2, drawers: 2, hangingRod: true },
    consent: {
      personalData: true,
      privacyVersion: "2026-05-24",
      acceptedAt: "2026-06-23T18:00:00.000Z",
    },
  });
  const exportPack = buildProductionExportFromPayload(payload);
  assertEdgeBandingPolicy(exportPack, "mixed filling wardrobe");
});

test("P1-24 accepted MVP decision is documented in factory profile and contract", () => {
  const accepted = readFileSync("docs/planning/accepted-backlog-decisions-v1.md", "utf8");
  assert.match(accepted, /кромку 1 мм/i);
  assert.match(accepted, /кромку 2 мм/i);
  assert.equal(DEFAULT_FACTORY_PROFILE.edgeBanding.otherThicknessMm, 1);
  assert.equal(DEFAULT_FACTORY_PROFILE.edgeBanding.facadeThicknessMm, 2);
  assert.equal(DEFAULT_FACTORY_PROFILE.edgeBanding.edgeAllSides, true);
});

test("P1-24 production export does not leak monetary or PII data in edge banding output", () => {
  const payload = makeValidOrder({
    customer: { ...PII_FIXTURES, comment: "Позвонить после 12:00" },
    consent: {
      personalData: true,
      privacyVersion: "2026-05-24",
      acceptedAt: "2026-06-23T18:00:00.000Z",
    },
  });
  const exportPack = buildProductionExportFromPayload(payload);
  assertForbiddenFieldsAbsent(JSON.stringify(exportPack), "edge banding export");
  assert.ok(exportPack.productionModel.edgeBanding.length > 0, "expected edge banding entries");
});

test("P1-24 edge banding geometry is independent of customer pricing payload", () => {
  const lowPrice = makeValidOrder({
    totalPrice: 10_000,
    priceBreakdown: {
      body: 4_000,
      facades: 3_000,
      filling: 1_000,
      hardware: 500,
      production: 0,
      materials: 7_000,
      edgeBanding: 500,
      services: 500,
      delivery: 0,
      assembly: 0,
    },
    consent: {
      personalData: true,
      privacyVersion: "2026-05-24",
      acceptedAt: "2026-06-23T18:00:00.000Z",
    },
  });
  const highPrice = makeValidOrder({
    totalPrice: 250_000,
    priceBreakdown: {
      body: 120_000,
      facades: 80_000,
      filling: 20_000,
      hardware: 10_000,
      production: 0,
      materials: 200_000,
      edgeBanding: 20_000,
      services: 10_000,
      delivery: 0,
      assembly: 0,
    },
    consent: {
      personalData: true,
      privacyVersion: "2026-05-24",
      acceptedAt: "2026-06-23T18:00:00.000Z",
    },
  });

  const lowExport = buildProductionExportFromPayload(lowPrice);
  const highExport = buildProductionExportFromPayload(highPrice);

  assert.equal(
    lowExport.productionModel.totals.edgeBandingLengthMm,
    highExport.productionModel.totals.edgeBandingLengthMm,
  );
  assert.deepEqual(lowExport.productionModel.edgeBanding, highExport.productionModel.edgeBanding);
});

test("P1-24 export does not claim production v4 active runtime", () => {
  const exportPack = buildProductionExportFromPayload(makeValidOrder());
  const serialized = JSON.stringify(exportPack);
  assert.equal(exportPack.project.meta.schemaVersion, 3);
  assert.equal(exportPack.schema, "razmerno.production-export.v1");
  assert.doesNotMatch(serialized, /production-export\.v4|"schemaVersion":\s*4/);
});

test("P1-24 basis boundary remains manual JSON not auto-B3D", () => {
  const exportPack = buildProductionExportFromPayload(makeValidOrder());
  assert.equal(exportPack.basis.status, "manual-json-ready");
  assert.doesNotMatch(JSON.stringify(exportPack), /create-b3d|"documentType":"b3d"/);
});

test("P1-24 edge banding length totals are deterministic for identical input", () => {
  const payload = makeValidOrder({
    consent: {
      personalData: true,
      privacyVersion: "2026-05-24",
      acceptedAt: "2026-06-23T18:00:00.000Z",
    },
  });
  const first = buildProductionExportFromPayload(payload);
  const second = buildProductionExportFromPayload(payload);

  assert.equal(first.productionModel.totals.edgeBandingLengthMm, second.productionModel.totals.edgeBandingLengthMm);
  assert.equal(
    first.validation.summary.edgeBandingLengthMm,
    second.validation.summary.edgeBandingLengthMm,
  );
  assert.deepEqual(first.productionModel.edgeBanding, second.productionModel.edgeBanding);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
