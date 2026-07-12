import assert from "node:assert/strict";
import { test } from "node:test";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage.js";
import { buildProductionJsonV4FromV3 } from "../src/constructor/production/v4/adapter.js";
import {
  buildAssemblyPolicySnapshot,
  calculateCarcassHeight,
  calculateFacadeOpening,
  calculateShelfInset,
  createAssemblyPolicyDefaults,
  LOCKED_FACADE_GAP_MM,
  LOCKED_PAIRED_FACADE_CENTER_GAP_MM,
  LOCKED_SHELF_FRONT_INSET_MM,
  validateAssemblyPolicy,
} from "../src/constructor/production/v4/assemblyPolicy.js";
import { productionJsonV4Example } from "../src/constructor/production/v4/example.js";
import type { ProductionJsonV4, SupportV4 } from "../src/constructor/production/v4/types.js";

function cloneModel(): ProductionJsonV4 {
  return structuredClone(productionJsonV4Example);
}

function makeSupport(mode: SupportV4["mode"], heightMm: number): SupportV4 {
  return {
    id: `support-${mode}`,
    objectType: "support",
    mode,
    heightMm,
    hardwareRequired: mode !== "no-support-on-bottom",
    affectsBodyGeometry: true,
  };
}

test("createAssemblyPolicyDefaults returns locked construction rules", () => {
  const defaults = createAssemblyPolicyDefaults();
  assert.equal(defaults.bodyConstruction, "side-panels-on-bottom");
  assert.equal(defaults.topPanelPlacement, "between-sides");
  assert.equal(defaults.shelfFrontInsetMm, 30);
  assert.equal(defaults.facadeGapMm, 1.5);
  assert.equal(defaults.pairedFacadeCenterGapMm, 3);
  assert.equal(defaults.heightIncludesSupportMm, true);
});

test("support 60: carcass height and validation pass", () => {
  const model = cloneModel();
  model.supports = [makeSupport("adjustable-leg-60", 60)];
  model.product.heightMm = 2460;
  model.product.heightIncludesSupportMm = true;

  const snapshot = buildAssemblyPolicySnapshot(model);
  assert.equal(snapshot.supportMode, "adjustable-leg-60");
  assert.equal(snapshot.supportHeightMm, 60);
  assert.equal(calculateCarcassHeight(2460, 60), 2400);
  assert.equal(snapshot.carcassHeightMm, 2400);
  assert.equal(validateAssemblyPolicy(model).ok, true);
});

test("support 100: locked height is enforced", () => {
  const model = cloneModel();
  model.supports = [makeSupport("adjustable-leg-100", 100)];
  model.product.heightMm = 2500;
  model.product.heightIncludesSupportMm = true;

  const snapshot = buildAssemblyPolicySnapshot(model);
  assert.equal(snapshot.supportHeightMm, 100);
  assert.equal(calculateCarcassHeight(2500, 100), 2400);
  assert.equal(validateAssemblyPolicy(model).ok, true);
});

test("no support: height 0 and full carcass height", () => {
  const model = cloneModel();
  model.supports = [makeSupport("no-support-on-bottom", 0)];
  model.product.heightIncludesSupportMm = true;

  const snapshot = buildAssemblyPolicySnapshot(model);
  assert.equal(snapshot.supportMode, "no-support-on-bottom");
  assert.equal(snapshot.supportHeightMm, 0);
  assert.equal(snapshot.carcassHeightMm, model.product.heightMm);
  assert.equal(validateAssemblyPolicy(model).ok, true);
});

test("metal adjustable support allows positive custom height", () => {
  const model = cloneModel();
  model.supports = [makeSupport("metal-spiked-adjustable-support", 80)];
  model.product.heightMm = 2480;
  model.product.heightIncludesSupportMm = true;

  assert.equal(validateAssemblyPolicy(model).ok, true);
  assert.equal(buildAssemblyPolicySnapshot(model).supportHeightMm, 80);
});

test("calculateCarcassHeight subtracts support from customer height", () => {
  assert.equal(calculateCarcassHeight(2400, 0), 2400);
  assert.equal(calculateCarcassHeight(2460, 60), 2400);
  assert.equal(calculateCarcassHeight(2500, 100), 2400);
});

test("calculateShelfInset returns locked 30 mm", () => {
  assert.equal(calculateShelfInset(), LOCKED_SHELF_FRONT_INSET_MM);
  assert.equal(calculateShelfInset(), 30);
});

test("calculateFacadeOpening uses facade gap 1.5 and paired center gap 3", () => {
  const single = calculateFacadeOpening({
    openingWidthMm: 900,
    openingHeightMm: 2400,
    doorCount: 1,
  });
  assert.equal(single.sideGapMm, LOCKED_FACADE_GAP_MM);
  assert.equal(single.doorWidthMm, 897);
  assert.equal(single.doorHeightMm, 2397);

  const paired = calculateFacadeOpening({
    openingWidthMm: 1800,
    openingHeightMm: 2400,
    doorCount: 2,
  });
  assert.equal(paired.centerGapMm, LOCKED_PAIRED_FACADE_CENTER_GAP_MM);
  assert.equal(paired.doorWidthMm, 897);
});

test("invalid support height fails validation", () => {
  const model = cloneModel();
  model.supports = [makeSupport("adjustable-leg-60", 100)];

  const result = validateAssemblyPolicy(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "assemblyPolicy.support.height.invalid"));
});

test("carcass higher than total height fails validation", () => {
  const model = cloneModel();
  model.supports = [makeSupport("adjustable-leg-100", 100)];
  model.product.heightMm = 80;

  const result = validateAssemblyPolicy(model);
  assert.equal(result.ok, false);
  assert.ok(
    result.errors.some((error) => error.code === "assemblyPolicy.carcass.height.exceedsTotal"),
  );
});

test("invalid facade gap fails validation", () => {
  const model = cloneModel();
  model.rules.facadeGapMm = 2;

  const result = validateAssemblyPolicy(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "assemblyPolicy.facadeGap.invalid"));
});

test("invalid paired facade center gap fails validation", () => {
  const model = cloneModel();
  model.rules.pairedFacadePolicy.centerGapMm = 4;
  const facade = model.panels.find((panel) => panel.role === "facade-door");
  if (facade) {
    facade.pairedFacadeCenterGapMm = 4;
  }

  const result = validateAssemblyPolicy(model);
  assert.equal(result.ok, false);
  assert.ok(
    result.errors.some((error) => error.code === "assemblyPolicy.pairedFacadeCenterGap.invalid"),
  );
});

test("invalid shelf inset fails validation", () => {
  const model = cloneModel();
  const shelf = model.panels.find((panel) => panel.role === "shelf");
  assert.ok(shelf);
  shelf.frontInsetMm = 20;

  const result = validateAssemblyPolicy(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "assemblyPolicy.shelfInset.invalid"));
});

test("v4 example passes assembly policy validation", () => {
  assert.equal(validateAssemblyPolicy(productionJsonV4Example).ok, true);
});

test("adapter attaches assemblyPolicySnapshot", () => {
  const v4 = buildProductionJsonV4FromV3(
    buildProductionExportFromPayload({
      orderId: "RZ-ASM-001",
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

  assert.ok(v4.assemblyPolicySnapshot);
  assert.equal(v4.assemblyPolicySnapshot?.bodyConstruction, "side-panels-on-bottom");
  assert.equal(v4.assemblyPolicySnapshot?.topPanelPlacement, "between-sides");
  assert.equal(validateAssemblyPolicy(v4).ok, true);
});
