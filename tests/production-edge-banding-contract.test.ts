import assert from "node:assert/strict";

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
