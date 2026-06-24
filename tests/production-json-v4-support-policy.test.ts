import assert from "node:assert/strict";
import { test } from "node:test";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage.js";
import { buildAssemblyPolicySnapshot, calculateCarcassHeight } from "../src/constructor/production/v4/assemblyPolicy.js";
import { buildProductionJsonV4FromV3 } from "../src/constructor/production/v4/adapter.js";
import { assertProductionJsonV4Invariants } from "../src/constructor/production/v4/guards.js";
import { enrichEdgeGrooveSemanticsV4 } from "../src/constructor/production/v4/edgeGroovePolicy.js";
import { enrichFacadeSemanticsV4 } from "../src/constructor/production/v4/facadePolicy.js";
import { enrichHardwareSemanticsV4 } from "../src/constructor/production/v4/hardwarePolicy.js";
import { enrichPanelSemanticsV4 } from "../src/constructor/production/v4/panelProjection.js";
import {
  calculateRequiredSupportCountV4,
  calculateSupportPositionsV4,
  classifySupportTypeV4,
  enrichSupportSemanticsV4,
  getSupportPlacementRulesV4,
  validateSupportPolicyV4,
} from "../src/constructor/production/v4/supportPolicy.js";
import { productionJsonV4Example } from "../src/constructor/production/v4/example.js";
import type { ProductionJsonV4, SupportV4 } from "../src/constructor/production/v4/types.js";

function enrichModel(model: ProductionJsonV4): ProductionJsonV4 {
  const enriched = enrichSupportSemanticsV4(
    enrichEdgeGrooveSemanticsV4(
      enrichFacadeSemanticsV4(
        enrichHardwareSemanticsV4(enrichPanelSemanticsV4(model)),
      ),
    ),
  );
  return {
    ...enriched,
    assemblyPolicySnapshot: buildAssemblyPolicySnapshot(enriched),
  };
}

function makeSupport(id: string, mode: SupportV4["mode"], heightMm: number): SupportV4 {
  return {
    id,
    objectType: "support",
    mode,
    heightMm,
    hardwareRequired: mode !== "no-support-on-bottom",
    affectsBodyGeometry: true,
    mountingPanelId: "panel-bottom",
  };
}

function makeLegSupports(count: number, mode: SupportV4["mode"] = "adjustable-leg-60", heightMm = 60): SupportV4[] {
  const frontCount = count / 2;
  const supports: SupportV4[] = [];
  for (let index = 0; index < frontCount; index += 1) {
    supports.push(makeSupport(`support-leg-front-${index + 1}`, mode, heightMm));
    supports.push(makeSupport(`support-leg-back-${index + 1}`, mode, heightMm));
  }
  return supports;
}

function minimalModel(widthMm: number, supports: SupportV4[], heightMm = 2460): ProductionJsonV4 {
  return enrichModel({
    ...productionJsonV4Example,
    product: {
      ...productionJsonV4Example.product,
      widthMm,
      heightMm,
      heightIncludesSupportMm: true,
    },
    supports,
    hardware: [],
  });
}

test("60 mm support", () => {
  const supports = makeLegSupports(6, "adjustable-leg-60", 60);
  const model = minimalModel(1800, supports);
  assert.equal(classifySupportTypeV4(supports[0]!), "adjustable-leg-60");
  assert.equal(validateSupportPolicyV4(model).ok, true);
  assert.equal(model.assemblyPolicySnapshot?.supportHeightMm, 60);
  assert.equal(calculateCarcassHeight(2460, 60), 2400);
});

test("100 mm support", () => {
  const supports = makeLegSupports(6, "adjustable-leg-100", 100);
  const model = minimalModel(1800, supports, 2500);
  assert.equal(validateSupportPolicyV4(model).ok, true);
  assert.equal(model.assemblyPolicySnapshot?.supportHeightMm, 100);
});

test("metal support", () => {
  const supports = makeLegSupports(6, "metal-spiked-adjustable-support", 80);
  const model = minimalModel(1800, supports, 2540);
  assert.equal(validateSupportPolicyV4(model).ok, true);
});

test("no support", () => {
  const supports = [makeSupport("support-none", "no-support-on-bottom", 0)];
  const model = minimalModel(1800, supports);
  assert.equal(validateSupportPolicyV4(model).ok, true);
  assert.equal(model.assemblyPolicySnapshot?.supportHeightMm, 0);
});

test("support count matrix", () => {
  assert.equal(calculateRequiredSupportCountV4(1000).requiredCount, 4);
  assert.equal(calculateRequiredSupportCountV4(1800).requiredCount, 6);
  assert.equal(calculateRequiredSupportCountV4(3000).requiredCount, 8);
  assert.equal(calculateRequiredSupportCountV4(4000).widthExceedsMatrix, true);
  assert.equal(getSupportPlacementRulesV4(1800).frontLineCount, 3);
});

test("placement symmetry", () => {
  const positions = calculateSupportPositionsV4({ widthMm: 1800, depthMm: 600, requiredCount: 6 });
  const front = positions.filter((position) => position.line === "front").map((position) => position.xMm);
  const rear = positions.filter((position) => position.line === "rear").map((position) => position.xMm);
  assert.deepEqual(front, rear);
  assert.equal(positions.length, 6);
});

test("invalid heights", () => {
  const supports = makeLegSupports(6, "adjustable-leg-60", 80);
  const result = validateSupportPolicyV4(minimalModel(1800, supports));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "supportPolicy.height.invalid"));
});

test("invalid count", () => {
  const supports = makeLegSupports(2);
  const result = validateSupportPolicyV4(minimalModel(1000, supports));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "supportPolicy.count.mismatch"));
});

test("support height greater than furniture height fails", () => {
  const supports = makeLegSupports(6, "adjustable-leg-100", 100);
  const model = minimalModel(1800, supports, 80);
  const result = validateSupportPolicyV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "supportPolicy.height.exceedsTotal"));
});

test("carcass height <= 0 fails", () => {
  const supports = makeLegSupports(6, "adjustable-leg-100", 100);
  const model = minimalModel(1800, supports, 100);
  const result = validateSupportPolicyV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "supportPolicy.carcass.height.invalid"));
});

test("support position outside furniture width fails", () => {
  const supports = makeLegSupports(6);
  const model = enrichModel({
    ...productionJsonV4Example,
    product: { ...productionJsonV4Example.product, widthMm: 1800, heightMm: 2460, heightIncludesSupportMm: true },
    supports,
    hardware: [],
  });
  const support = model.supports[0]!;
  assert.ok(support.semantics);
  support.semantics!.position = { line: "front", xMm: 2000, zMm: 0, index: 0 };

  const result = validateSupportPolicyV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "supportPolicy.position.outsideWidth"));
});

test("adapter projection compatibility", () => {
  const v4 = buildProductionJsonV4FromV3(
    buildProductionExportFromPayload({
      orderId: "RZ-SUPPORT-001",
      productType: "wardrobe",
      dimensions: { width: 1800, height: 2400, depth: 600 },
      sections: 2,
      filling: { shelves: 2, drawers: 0, hangingRod: false },
      layout: { sections: [] },
      materials: { bodyId: "body", facadeId: "facade", facadeKind: "mdf" },
      consent: {
        personalData: true,
        privacyVersion: "test",
        acceptedAt: "2026-06-23T18:00:00.000Z",
      },
    }),
  );

  const result = validateSupportPolicyV4(v4);
  assert.equal(result.ok, true, result.errors.map((error) => error.message).join("; "));
  assert.doesNotThrow(() => assertProductionJsonV4Invariants(v4));
  assert.ok(v4.supports.every((support) => support.semantics));
});

test("immutable enrichment", () => {
  const model = structuredClone(productionJsonV4Example);
  const before = structuredClone(model);
  delete model.supports[0]?.semantics;

  const enriched = enrichSupportSemanticsV4(model);

  assert.ok(enriched.supports[0]?.semantics);
  assert.equal(model.supports[0]?.semantics, undefined);
  assert.deepEqual(model, before);
});

test("existing example passes support validation after enrichment", () => {
  const enriched = enrichModel(productionJsonV4Example);
  const result = validateSupportPolicyV4(enriched);
  assert.equal(result.ok, true, result.errors.map((error) => error.message).join("; "));
});
