import assert from "node:assert/strict";
import { test } from "node:test";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage.js";
import { buildAssemblyPolicySnapshot } from "../src/constructor/production/v4/assemblyPolicy.js";
import { buildProductionJsonV4FromV3 } from "../src/constructor/production/v4/adapter.js";
import { assertProductionJsonV4Invariants } from "../src/constructor/production/v4/guards.js";
import { enrichEdgeGrooveSemanticsV4 } from "../src/constructor/production/v4/edgeGroovePolicy.js";
import {
  calculatePairedFacadeSizeV4,
  calculateSingleFacadeSizeV4,
  classifyFacadePanelV4,
  enrichFacadeSemanticsV4,
  getFacadeGapPolicyV4,
  validateFacadePolicyV4,
} from "../src/constructor/production/v4/facadePolicy.js";
import { enrichHardwareSemanticsV4 } from "../src/constructor/production/v4/hardwarePolicy.js";
import { enrichPanelSemanticsV4 } from "../src/constructor/production/v4/panelProjection.js";
import { productionJsonV4Example } from "../src/constructor/production/v4/example.js";
import type { HardwareV4, PanelV4, ProductionJsonV4 } from "../src/constructor/production/v4/types.js";

function enrichModel(model: ProductionJsonV4): ProductionJsonV4 {
  const enriched = enrichEdgeGrooveSemanticsV4(
    enrichFacadeSemanticsV4(
      enrichHardwareSemanticsV4(enrichPanelSemanticsV4(model)),
    ),
  );
  return {
    ...enriched,
    assemblyPolicySnapshot: buildAssemblyPolicySnapshot(enriched),
  };
}

function makeFacadePanel(overrides: Partial<PanelV4> & Pick<PanelV4, "id" | "role">): PanelV4 {
  const isDrawerFront = overrides.role === "drawer-front";
  return {
    id: overrides.id,
    objectType: "panel",
    basisObjectType: "panel",
    role: overrides.role,
    name: overrides.name ?? overrides.role,
    materialRef: overrides.materialRef ?? "mat-facade-mdf-18",
    materialKind: overrides.materialKind ?? "mdf",
    thicknessMm: overrides.thicknessMm ?? 18,
    dimensions: overrides.dimensions ?? { widthMm: 894, heightMm: 2397, thicknessMm: overrides.thicknessMm ?? 18 },
    orientation: overrides.orientation ?? { basisPanelKind: "frontal", plane: "XY", normalAxis: "Z" },
    textureDirection: "vertical",
    facadeGaps: overrides.facadeGaps ?? { topMm: 1.5, rightMm: 1.5, bottomMm: 1.5, leftMm: 1.5 },
    pairedFacadeCenterGapMm: overrides.pairedFacadeCenterGapMm,
    includeInDocumentation: true,
    position: overrides.position ?? (isDrawerFront ? undefined : { xMm: 1.5, yMm: 61.5, zMm: -18 }),
    ...overrides,
  };
}

test("single facade size calculation with 1.5 gaps", () => {
  const gap = getFacadeGapPolicyV4();
  assert.equal(gap.sideGapMm, 1.5);

  const size = calculateSingleFacadeSizeV4({ widthMm: 900, heightMm: 2400 });
  assert.equal(size.widthMm, 897);
  assert.equal(size.heightMm, 2397);
});

test("paired facade size calculation with 3 mm center gap", () => {
  const size = calculatePairedFacadeSizeV4({ widthMm: 1800, heightMm: 2400 });
  assert.equal(size.widthMm, 897);
  assert.equal(size.heightMm, 2397);
});

test("invalid opening fails", () => {
  const size = calculateSingleFacadeSizeV4({ widthMm: 2, heightMm: 2 });
  assert.ok(size.widthMm <= 0);
  assert.ok(size.heightMm <= 0);

  const panel = makeFacadePanel({ id: "panel-facade-invalid", role: "facade-door" });
  const model = enrichModel({
    ...productionJsonV4Example,
    panels: [panel],
    hardware: [],
    edgeBanding: [],
  });
  const enriched = model.panels[0]!;
  assert.ok(enriched.facadeSemantics);
  enriched.facadeSemantics!.calculatedWidthMm = size.widthMm;
  enriched.facadeSemantics!.calculatedHeightMm = size.heightMm;

  const result = validateFacadePolicyV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "facadePolicy.size.invalid"));
});

test("LDSP facade 16 passes", () => {
  const panel = makeFacadePanel({
    id: "panel-facade-ldsp",
    role: "facade-door",
    materialKind: "ldsp",
    materialRef: "mat-facade-ldsp-16",
    thicknessMm: 16,
    dimensions: { widthMm: 897, heightMm: 2397, thicknessMm: 16 },
  });
  const result = validateFacadePolicyV4(enrichModel({ ...productionJsonV4Example, panels: [panel], hardware: [], edgeBanding: [] }));
  assert.equal(result.ok, true);
});

test("MDF facade 18 passes", () => {
  const panel = makeFacadePanel({ id: "panel-facade-mdf", role: "facade-door" });
  const result = validateFacadePolicyV4(enrichModel({ ...productionJsonV4Example, panels: [panel], hardware: [], edgeBanding: [] }));
  assert.equal(result.ok, true);
});

test("MDF facade 16 fails", () => {
  const panel = makeFacadePanel({
    id: "panel-facade-mdf-bad",
    role: "facade-door",
    thicknessMm: 16,
    dimensions: { widthMm: 894, heightMm: 2397, thicknessMm: 16 },
  });
  const result = validateFacadePolicyV4(enrichModel({ ...productionJsonV4Example, panels: [panel], hardware: [], edgeBanding: [] }));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "facadePolicy.thickness.mdf.invalid"));
});

test("drawer-front is facade-class", () => {
  const panel = makeFacadePanel({ id: "panel-drawer-front", role: "drawer-front" });
  const classification = classifyFacadePanelV4(panel);
  assert.ok(classification);
  assert.equal(classification.roleClass, "drawer-front");
  assert.equal(classification.isFacadeClass, true);
});

test("drawer-front receives facade semantics", () => {
  const panel = makeFacadePanel({ id: "panel-drawer-front-sem", role: "drawer-front" });
  const enriched = enrichModel({ ...productionJsonV4Example, panels: [panel], hardware: [], edgeBanding: [] });
  assert.ok(enriched.panels[0]?.facadeSemantics);
  assert.equal(enriched.panels[0]?.facadeSemantics?.openingType, "drawer-front");
});

test("unsupported door type fails/warns", () => {
  const panel = makeFacadePanel({ id: "panel-facade-door-type", role: "facade-door" });
  const hinge: HardwareV4 = {
    id: "hardware-hinge-bad-door-type",
    objectType: "hardware",
    basisObjectType: "furniture-component",
    type: "hinge",
    facadePanelId: panel.id,
    mountingPanelId: "panel-side-left",
    doorType: "inset",
    requiresTechnologistCheck: true,
  };
  (hinge as { doorType: string }).doorType = "full-overlay";

  const enriched = enrichModel({
    ...productionJsonV4Example,
    panels: [panel, ...productionJsonV4Example.panels.filter((item) => item.id === "panel-side-left")],
    hardware: [hinge],
    edgeBanding: [],
  });

  assert.ok(
    enriched.validation.warnings.some((warning) => warning.code === "facadePolicy.doorType.unsupported"),
  );

  const result = validateFacadePolicyV4(enriched);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "facadePolicy.doorType.unsupported"));
});

test("push-to-open without hardware issue is detected", () => {
  const panel = makeFacadePanel({ id: "panel-facade-pto", role: "facade-door" });
  const enriched = enrichModel({ ...productionJsonV4Example, panels: [panel], hardware: [], edgeBanding: [] });
  const semantics = enriched.panels[0]?.facadeSemantics;
  assert.ok(semantics);
  semantics.openingMode = "push-to-open";

  const result = validateFacadePolicyV4(enriched);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "facadePolicy.pushToOpen.hardware.missing"));
});

test("enrichFacadeSemanticsV4 is immutable", () => {
  const model = structuredClone(productionJsonV4Example);
  const before = structuredClone(model);
  delete model.panels.find((panel) => panel.role === "facade-door")?.facadeSemantics;

  const enriched = enrichFacadeSemanticsV4(model);

  assert.ok(enriched.panels.some((panel) => panel.facadeSemantics));
  assert.ok(model.panels.every((panel) => panel.facadeSemantics === undefined));
  assert.deepEqual(model, before);
});

test("adapter output passes facade validation", () => {
  const v4 = buildProductionJsonV4FromV3(
    buildProductionExportFromPayload({
      orderId: "RZ-FACADE-001",
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

  const result = validateFacadePolicyV4(v4);
  assert.equal(result.ok, true, result.errors.map((error) => error.message).join("; "));
  assert.doesNotThrow(() => assertProductionJsonV4Invariants(v4));
  assert.ok(v4.panels.filter((panel) => panel.role === "facade-door" || panel.role === "drawer-front").every((panel) => panel.facadeSemantics));
});

test("existing example passes facade validation after enrichment", () => {
  const enriched = enrichModel(productionJsonV4Example);
  const result = validateFacadePolicyV4(enriched);
  assert.equal(result.ok, true, result.errors.map((error) => error.message).join("; "));
});
