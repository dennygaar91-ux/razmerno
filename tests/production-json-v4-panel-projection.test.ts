import assert from "node:assert/strict";
import { test } from "node:test";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage.js";
import { buildProductionJsonV4FromV3 } from "../src/constructor/production/v4/adapter.js";
import { assertProductionJsonV4Invariants } from "../src/constructor/production/v4/guards.js";
import {
  classifyPanelRoleV4,
  enrichPanelSemanticsV4,
  getBasisPanelKindV4,
  getPanelLocalAxesV4,
  getPanelPlaneV4,
  getPanelWorldBoundingBoxV4,
  validatePanelSemanticsV4,
} from "../src/constructor/production/v4/panelProjection.js";
import { productionJsonV4Example } from "../src/constructor/production/v4/example.js";
import type { PanelV4, ProductionJsonV4 } from "../src/constructor/production/v4/types.js";

function makePanel(overrides: Partial<PanelV4> & Pick<PanelV4, "id" | "role">): PanelV4 {
  const role = overrides.role;
  const kind = getBasisPanelKindV4({ role });
  const plane = getPanelPlaneV4({ role });
  return {
    id: overrides.id,
    objectType: "panel",
    basisObjectType: "panel",
    role,
    name: overrides.name ?? overrides.id,
    materialRef: overrides.materialRef ?? "mat-body-white-ldsp-16",
    materialKind: overrides.materialKind ?? "ldsp",
    thicknessMm: overrides.thicknessMm ?? 16,
    dimensions: overrides.dimensions ?? { widthMm: 800, heightMm: 400, thicknessMm: 16 },
    orientation: overrides.orientation ?? {
      basisPanelKind: kind,
      plane,
      normalAxis: plane === "YZ" ? "X" : plane === "XZ" ? "Y" : "Z",
    },
    textureDirection: overrides.textureDirection ?? "horizontal",
    includeInDocumentation: overrides.includeInDocumentation ?? true,
    ...overrides,
  };
}

function minimalModel(panels: PanelV4[], assemblies: ProductionJsonV4["assemblies"] = productionJsonV4Example.assemblies): ProductionJsonV4 {
  return {
    ...productionJsonV4Example,
    panels,
    assemblies,
  };
}

test("basis kind mapping for side/bottom/shelf/back/facade/drawer-front", () => {
  assert.equal(getBasisPanelKindV4({ role: "side-left" }), "vertical");
  assert.equal(getPanelPlaneV4({ role: "side-left" }), "YZ");
  assert.equal(classifyPanelRoleV4({ role: "side-left" }), "body");

  assert.equal(getBasisPanelKindV4({ role: "bottom" }), "horizontal");
  assert.equal(getPanelPlaneV4({ role: "shelf" }), "XZ");

  assert.equal(getBasisPanelKindV4({ role: "back-panel" }), "frontal");
  assert.equal(getPanelPlaneV4({ role: "facade-door" }), "XY");
  assert.equal(classifyPanelRoleV4({ role: "facade-door" }), "facade");
  assert.equal(classifyPanelRoleV4({ role: "drawer-front" }), "drawer-front");
});

test("worldBoundingBox derivation for vertical/horizontal/frontal panels", () => {
  const vertical = makePanel({
    id: "side-left",
    role: "side-left",
    dimensions: { widthMm: 600, heightMm: 2384, thicknessMm: 16 },
  });
  assert.deepEqual(getPanelWorldBoundingBoxV4(vertical), {
    widthMm: 16,
    heightMm: 2384,
    depthMm: 600,
  });

  const horizontal = makePanel({
    id: "shelf-1",
    role: "shelf",
    dimensions: { widthMm: 860, heightMm: 554, thicknessMm: 16 },
  });
  assert.deepEqual(getPanelWorldBoundingBoxV4(horizontal), {
    widthMm: 860,
    heightMm: 16,
    depthMm: 554,
  });

  const frontal = makePanel({
    id: "facade-left",
    role: "facade-door",
    materialKind: "mdf",
    thicknessMm: 18,
    dimensions: { widthMm: 894, heightMm: 2397, thicknessMm: 18 },
  });
  assert.deepEqual(getPanelWorldBoundingBoxV4(frontal), {
    widthMm: 894,
    heightMm: 2397,
    depthMm: 18,
  });
});

test("includeInDocumentation defaults to true during enrichment", () => {
  const panel = makePanel({ id: "panel-top", role: "top" });
  (panel as { includeInDocumentation?: boolean }).includeInDocumentation = undefined as unknown as true;

  const enriched = enrichPanelSemanticsV4(
    minimalModel([panel], []),
  );

  assert.equal(enriched.panels[0]?.includeInDocumentation, true);
  assert.equal(enriched.panels[0]?.semantics?.includeInDocumentation, true);
});

test("missing dimensions produce warnings and semantic validation errors", () => {
  const panel = makePanel({
    id: "panel-bad",
    role: "shelf",
    dimensions: { widthMm: 0, heightMm: 400, thicknessMm: 16 },
  });

  const enriched = enrichPanelSemanticsV4(minimalModel([panel], []));
  assert.ok(
    enriched.validation.warnings.some((warning) => warning.code === "panelSemantics.dimensions.missing"),
  );

  const result = validatePanelSemanticsV4(enriched);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "panelSemantics.dimensions.missing"));
});

test("drawer-side ambiguous local orientation warning", () => {
  const panel = makePanel({
    id: "drawer-side-left",
    role: "drawer-side-left",
    dimensions: { widthMm: 500, heightMm: 120, thicknessMm: 16 },
  });

  const axes = getPanelLocalAxesV4(panel);
  assert.equal(axes.drawerLocalOrientationProvisional, true);

  const enriched = enrichPanelSemanticsV4(minimalModel([panel], []));
  assert.ok(
    enriched.validation.warnings.some(
      (warning) => warning.code === "panelSemantics.drawerLocalOrientation.provisional",
    ),
  );
});

test("body assembly contact validation warns when contacts are missing", () => {
  const panels = [
    makePanel({ id: "panel-side-left", role: "side-left", dimensions: { widthMm: 600, heightMm: 2000, thicknessMm: 16 } }),
    makePanel({ id: "panel-bottom", role: "bottom", dimensions: { widthMm: 1800, heightMm: 600, thicknessMm: 16 } }),
    makePanel({ id: "panel-top", role: "top", dimensions: { widthMm: 1800, heightMm: 600, thicknessMm: 16 } }),
  ];

  const enriched = enrichPanelSemanticsV4(
    minimalModel(panels, [
      {
        id: "assembly-body",
        objectType: "assembly",
        basisObjectType: "composite-object",
        role: "body",
        children: panels.map((panel) => panel.id),
        contacts: [],
      },
    ]),
  );

  assert.ok(
    enriched.validation.warnings.some(
      (warning) => warning.code === "panelSemantics.assembly.sideOnBottom.missing",
    ),
  );
  assert.ok(
    enriched.validation.warnings.some(
      (warning) => warning.code === "panelSemantics.assembly.topBetweenSides.missing",
    ),
  );
});

test("facade block validation warns when facade assembly is missing", () => {
  const facade = makePanel({
    id: "panel-facade",
    role: "facade-door",
    materialKind: "mdf",
    thicknessMm: 18,
    dimensions: { widthMm: 800, heightMm: 2000, thicknessMm: 18 },
  });

  const enriched = enrichPanelSemanticsV4(minimalModel([facade], []));
  assert.ok(
    enriched.validation.warnings.some(
      (warning) => warning.code === "panelSemantics.assembly.facadeBlock.missing",
    ),
  );
});

test("adapter output passes panel semantic validation and v4 guards", () => {
  const v4 = buildProductionJsonV4FromV3(
    buildProductionExportFromPayload({
      orderId: "RZ-PANEL-001",
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

  const result = validatePanelSemanticsV4(v4);
  assert.equal(result.ok, true, result.errors.map((error) => error.message).join("; "));
  assert.doesNotThrow(() => assertProductionJsonV4Invariants(v4));
  assert.ok(v4.panels.every((panel) => panel.semantics));
});

test("enrichPanelSemanticsV4 is immutable", () => {
  const model = structuredClone(productionJsonV4Example);
  const before = structuredClone(model);
  const panel = model.panels[0]!;
  delete panel.semantics;

  const enriched = enrichPanelSemanticsV4(model);

  assert.ok(enriched.panels[0]?.semantics);
  assert.equal(model.panels[0]?.semantics, undefined);
  assert.deepEqual(model, before);
});

test("v4 example passes panel semantic validation after enrichment", () => {
  const enriched = enrichPanelSemanticsV4(productionJsonV4Example);
  const result = validatePanelSemanticsV4(enriched);
  assert.equal(result.ok, true, result.errors.map((error) => error.message).join("; "));
});
