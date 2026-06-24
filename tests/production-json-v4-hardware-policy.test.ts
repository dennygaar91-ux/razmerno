import assert from "node:assert/strict";
import { test } from "node:test";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage.js";
import { buildProductionJsonV4FromV3 } from "../src/constructor/production/v4/adapter.js";
import { assertProductionJsonV4Invariants } from "../src/constructor/production/v4/guards.js";
import {
  enrichHardwareSemanticsV4,
  getExpectedHardwareSemanticsV4,
  validateHardwarePolicyV4,
} from "../src/constructor/production/v4/hardwarePolicy.js";
import { enrichPanelSemanticsV4 } from "../src/constructor/production/v4/panelProjection.js";
import { productionJsonV4Example } from "../src/constructor/production/v4/example.js";
import type { HardwareV4, ProductionJsonV4 } from "../src/constructor/production/v4/types.js";

function enrichModel(model: ProductionJsonV4): ProductionJsonV4 {
  return enrichHardwareSemanticsV4(enrichPanelSemanticsV4(model));
}

function makeHinge(overrides: Partial<HardwareV4> = {}): HardwareV4 {
  return {
    id: overrides.id ?? "hardware-hinge-test",
    objectType: "hardware",
    basisObjectType: "furniture-component",
    type: "hinge",
    supplier: "Firmax",
    series: "Smartline",
    facadePanelId: "panel-facade-left",
    mountingPanelId: "panel-side-left",
    openingAngleDeg: 105,
    cupDiameterMm: 35,
    minCupDepthMm: 12,
    requiresTechnologistCheck: true,
    ...overrides,
  };
}

function minimalHardwareModel(hardware: HardwareV4[], panels = productionJsonV4Example.panels): ProductionJsonV4 {
  return enrichModel({
    ...productionJsonV4Example,
    panels,
    hardware,
    supports: productionJsonV4Example.supports,
  });
}

test("hinge baseline semantics pass", () => {
  const hinge = makeHinge();
  const semantics = getExpectedHardwareSemanticsV4(hinge);

  assert.equal(semantics.semanticType, "hinge");
  assert.equal(semantics.requiresSkuMapping, true);
  assert.equal(semantics.hingeBaseline?.openingAngleDeg, 105);
  assert.equal(semantics.hingeBaseline?.cupDiameterMm, 35);
  assert.equal(validateHardwarePolicyV4(minimalHardwareModel([hinge])).ok, true);
});

test("hinge with wrong cup diameter fails", () => {
  const hinge = makeHinge({ cupDiameterMm: 40 });
  const result = validateHardwarePolicyV4(minimalHardwareModel([hinge]));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "hardwarePolicy.hinge.cupDiameter.invalid"));
});

test("hinge with wrong angle fails", () => {
  const hinge = makeHinge({ openingAngleDeg: 110 });
  const result = validateHardwarePolicyV4(minimalHardwareModel([hinge]));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "hardwarePolicy.hinge.openingAngle.invalid"));
});

test("hinge linked to MDF 18 facade passes thickness compatibility", () => {
  const panels = structuredClone(productionJsonV4Example.panels);
  const facade = panels.find((panel) => panel.id === "panel-facade-left");
  assert.ok(facade);
  facade.thicknessMm = 18;
  facade.materialKind = "mdf";
  facade.dimensions.thicknessMm = 18;

  const result = validateHardwarePolicyV4(minimalHardwareModel([makeHinge()], panels));
  assert.equal(result.ok, true);
});

test("hinge linked to facade thickness 25 fails", () => {
  const panels = structuredClone(productionJsonV4Example.panels);
  const facade = panels.find((panel) => panel.id === "panel-facade-left");
  assert.ok(facade);
  facade.thicknessMm = 25;
  facade.dimensions.thicknessMm = 25;

  const result = validateHardwarePolicyV4(minimalHardwareModel([makeHinge()], panels));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "hardwarePolicy.hinge.facadeThickness.invalid"));
});

test("concealed slide baseline semantics pass", () => {
  const slide: HardwareV4 = {
    id: "hardware-slide-1",
    objectType: "hardware",
    basisObjectType: "furniture-component",
    type: "concealed-slide",
    supplier: "Firmax",
    mountingPanelId: "panel-side-left",
    targetAssemblyId: "assembly-drawer-1",
    requiresTechnologistCheck: true,
  };

  const semantics = getExpectedHardwareSemanticsV4(slide);
  assert.equal(semantics.slideBaseline?.mounting, "concealed-full-extension");
  assert.equal(semantics.slideBaseline?.maxBoardThicknessMm, 16);
  assert.deepEqual(semantics.slideBaseline?.availableLengthsMm, [250, 300, 350, 400, 450, 500, 550, 600]);

  const model = enrichModel({
    ...productionJsonV4Example,
    hardware: [slide],
    assemblies: [
      ...productionJsonV4Example.assemblies,
      {
        id: "assembly-drawer-1",
        objectType: "assembly",
        basisObjectType: "composite-object",
        role: "drawer",
        children: ["panel-drawer-side-left-1"],
        contacts: [],
      },
    ],
    panels: [
      ...productionJsonV4Example.panels,
      {
        id: "panel-drawer-side-left-1",
        objectType: "panel",
        basisObjectType: "panel",
        role: "drawer-side-left",
        name: "Drawer side",
        materialRef: "mat-body-white-ldsp-16",
        materialKind: "ldsp",
        thicknessMm: 16,
        dimensions: { widthMm: 500, heightMm: 120, thicknessMm: 16 },
        orientation: { basisPanelKind: "vertical", plane: "YZ" },
        textureDirection: "vertical",
        includeInDocumentation: true,
      },
    ],
  });

  assert.equal(validateHardwarePolicyV4(model).ok, true);
});

test("drawer board thickness >16 with concealed slide fails", () => {
  const slide: HardwareV4 = {
    id: "hardware-slide-thick",
    objectType: "hardware",
    basisObjectType: "furniture-component",
    type: "concealed-slide",
    supplier: "Firmax",
    mountingPanelId: "panel-side-left",
    targetAssemblyId: "assembly-drawer-1",
    requiresTechnologistCheck: true,
  };

  const model = enrichModel({
    ...productionJsonV4Example,
    hardware: [slide],
    assemblies: [
      {
        id: "assembly-drawer-1",
        objectType: "assembly",
        basisObjectType: "composite-object",
        role: "drawer",
        children: ["panel-drawer-side-left-1"],
        contacts: [],
      },
    ],
    panels: [
      ...productionJsonV4Example.panels,
      {
        id: "panel-drawer-side-left-1",
        objectType: "panel",
        basisObjectType: "panel",
        role: "drawer-side-left",
        name: "Drawer side",
        materialRef: "mat-body-white-ldsp-16",
        materialKind: "ldsp",
        thicknessMm: 18,
        dimensions: { widthMm: 500, heightMm: 120, thicknessMm: 18 },
        orientation: { basisPanelKind: "vertical", plane: "YZ" },
        textureDirection: "vertical",
        includeInDocumentation: true,
      },
    ],
  });

  const result = validateHardwarePolicyV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "hardwarePolicy.slide.drawerBoardThickness.invalid"));
});

test("shelf support enriched as reinforced-shelf-support", () => {
  const support: HardwareV4 = {
    id: "hardware-shelf-support-1",
    objectType: "hardware",
    basisObjectType: "furniture-component",
    type: "reinforced-shelf-support",
    mountingPanelId: "panel-side-left",
    requiresTechnologistCheck: true,
  };

  const enriched = enrichHardwareSemanticsV4(enrichPanelSemanticsV4({
    ...productionJsonV4Example,
    hardware: [support],
  }));

  assert.equal(enriched.hardware[0]?.semantics?.semanticType, "reinforced-shelf-support");
  assert.equal(enriched.hardware[0]?.semantics?.requiresSkuMapping, true);
});

test("no-support-on-bottom creates no required hardware error", () => {
  const model = enrichModel({
    ...productionJsonV4Example,
    hardware: productionJsonV4Example.hardware.filter((item) => item.type === "hinge"),
    supports: [
      {
        id: "support-none",
        objectType: "support",
        mode: "no-support-on-bottom",
        heightMm: 0,
        hardwareRequired: false,
        affectsBodyGeometry: true,
      },
    ],
  });

  assert.equal(validateHardwarePolicyV4(model).ok, true);
});

test("unknown hardware type produces validation issue", () => {
  const unknown = makeHinge({
    id: "hardware-unknown",
    type: "confirmat",
  });
  (unknown as { type: HardwareV4["type"] }).type = "rod-holder";
  (unknown as { type: string }).type = "mystery-hardware";

  const enriched = enrichHardwareSemanticsV4(enrichPanelSemanticsV4({
    ...productionJsonV4Example,
    hardware: [unknown as HardwareV4],
  }));

  assert.ok(
    enriched.validation.warnings.some((warning) => warning.code === "hardwarePolicy.type.unknown"),
  );

  const result = validateHardwarePolicyV4(enriched);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "hardwarePolicy.type.unknown"));
});

test("final skuStatus without sku/article fails", () => {
  const hinge = makeHinge();
  const enriched = enrichHardwareSemanticsV4(enrichPanelSemanticsV4({
    ...productionJsonV4Example,
    hardware: [hinge],
  }));
  const item = enriched.hardware[0];
  assert.ok(item?.semantics);
  item.semantics!.skuStatus = "final";

  const result = validateHardwarePolicyV4(enriched);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "hardwarePolicy.sku.finalMissing"));
});

test("enrichment is immutable", () => {
  const model = structuredClone(productionJsonV4Example);
  const before = structuredClone(model);
  delete model.hardware[0]?.semantics;

  const enriched = enrichHardwareSemanticsV4(enrichPanelSemanticsV4(model));

  assert.ok(enriched.hardware[0]?.semantics);
  assert.equal(model.hardware[0]?.semantics, undefined);
  assert.deepEqual(model, before);
});

test("adapter output passes hardware validation", () => {
  const v4 = buildProductionJsonV4FromV3(
    buildProductionExportFromPayload({
      orderId: "RZ-HW-001",
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

  const result = validateHardwarePolicyV4(v4);
  assert.equal(result.ok, true, result.errors.map((error) => error.message).join("; "));
  assert.doesNotThrow(() => assertProductionJsonV4Invariants(v4));
  assert.ok(v4.hardware.every((item) => item.semantics));
});
