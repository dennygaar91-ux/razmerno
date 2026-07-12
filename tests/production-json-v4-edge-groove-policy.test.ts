import assert from "node:assert/strict";
import { test } from "node:test";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage.js";
import { buildProductionJsonV4FromV3 } from "../src/constructor/production/v4/adapter.js";
import { assertProductionJsonV4Invariants } from "../src/constructor/production/v4/guards.js";
import {
  classifyEdgePolicyForPanelV4,
  enrichEdgeGrooveSemanticsV4,
  getExpectedEdgeBandingForPanelV4,
  validateEdgeBandingPolicyV4,
  validateGrooveBoundaryV4,
} from "../src/constructor/production/v4/edgeGroovePolicy.js";
import { enrichHardwareSemanticsV4 } from "../src/constructor/production/v4/hardwarePolicy.js";
import { enrichPanelSemanticsV4 } from "../src/constructor/production/v4/panelProjection.js";
import { productionJsonV4Example } from "../src/constructor/production/v4/example.js";
import type { EdgeBandingV4, GrooveV4, PanelV4, ProductionJsonV4 } from "../src/constructor/production/v4/types.js";

function enrichModel(model: ProductionJsonV4): ProductionJsonV4 {
  return enrichEdgeGrooveSemanticsV4(enrichHardwareSemanticsV4(enrichPanelSemanticsV4(model)));
}

function makeEdge(
  panelId: string,
  side: EdgeBandingV4["side"],
  thicknessMm: number,
  overrides: Partial<EdgeBandingV4> = {},
): EdgeBandingV4 {
  return {
    id: overrides.id ?? `edge-${panelId}-${side}`,
    objectType: "edgeBanding",
    panelId,
    side,
    thicknessMm,
    lengthMm: overrides.lengthMm ?? 100,
    visible: overrides.visible ?? false,
    basisOperation: "apply-edge",
    ...overrides,
  };
}

function makePanel(overrides: Partial<PanelV4> & Pick<PanelV4, "id" | "role">): PanelV4 {
  const role = overrides.role;
  const isVertical = role === "side-left" || role === "side-right" || role === "drawer-side-left" || role === "drawer-side-right" || role === "drawer-back";
  const isFrontal = role === "facade-door" || role === "drawer-front";
  const isHdf = role === "back-panel" || role === "drawer-bottom";

  return {
    id: overrides.id,
    objectType: "panel",
    basisObjectType: "panel",
    role,
    name: overrides.name ?? role,
    materialRef: overrides.materialRef ?? (isHdf ? "mat-hdf-white-3" : "mat-body-white-ldsp-16"),
    materialKind: overrides.materialKind ?? (isHdf ? "hdf" : role === "facade-door" || role === "drawer-front" ? "mdf" : "ldsp"),
    thicknessMm: overrides.thicknessMm ?? (isHdf ? 3 : role === "facade-door" || role === "drawer-front" ? 18 : 16),
    dimensions: overrides.dimensions ?? {
      widthMm: 600,
      heightMm: 500,
      thicknessMm: overrides.thicknessMm ?? (isHdf ? 3 : 16),
    },
    orientation: overrides.orientation ?? {
      basisPanelKind: isVertical ? "vertical" : isFrontal ? "frontal" : "horizontal",
      plane: isVertical ? "YZ" : isFrontal ? "XY" : "XZ",
      normalAxis: isVertical ? "X" : isFrontal ? "Z" : "Y",
    },
    textureDirection: overrides.textureDirection ?? "vertical",
    includeInDocumentation: true,
    ...overrides,
  };
}

function minimalModel(panels: PanelV4[], edgeBanding: EdgeBandingV4[], grooves: GrooveV4[] = []): ProductionJsonV4 {
  return enrichModel({
    ...productionJsonV4Example,
    panels,
    edgeBanding,
    grooves,
    hardware: [],
  });
}

function allAroundEdges(panel: PanelV4, thicknessMm: number): EdgeBandingV4[] {
  const expected = getExpectedEdgeBandingForPanelV4(panel);
  return expected.requiredSides.map((side) => makeEdge(panel.id, side, thicknessMm));
}

test("body panel requires 1 mm on all four sides", () => {
  const panel = makePanel({ id: "panel-bottom-test", role: "bottom" });
  const edges = allAroundEdges(panel, 1);
  const result = validateEdgeBandingPolicyV4(minimalModel([panel], edges));
  assert.equal(result.ok, true);
  assert.equal(getExpectedEdgeBandingForPanelV4(panel).expectedThicknessMm, 1);
});

test("shelf requires 1 mm all-around", () => {
  const panel = makePanel({ id: "panel-shelf-test", role: "shelf" });
  const result = validateEdgeBandingPolicyV4(minimalModel([panel], allAroundEdges(panel, 1)));
  assert.equal(result.ok, true);
});

test("drawer-side/back requires 1 mm all-around", () => {
  const side = makePanel({ id: "panel-drawer-side", role: "drawer-side-left" });
  const back = makePanel({ id: "panel-drawer-back", role: "drawer-back" });
  const edges = [...allAroundEdges(side, 1), ...allAroundEdges(back, 1)];
  const result = validateEdgeBandingPolicyV4(minimalModel([side, back], edges));
  assert.equal(result.ok, true);
});

test("facade-door requires 2 mm all-around", () => {
  const panel = makePanel({ id: "panel-facade-test", role: "facade-door", thicknessMm: 18 });
  const result = validateEdgeBandingPolicyV4(minimalModel([panel], allAroundEdges(panel, 2)));
  assert.equal(result.ok, true);
  assert.equal(getExpectedEdgeBandingForPanelV4(panel).expectedThicknessMm, 2);
});

test("drawer-front requires 2 mm all-around", () => {
  const panel = makePanel({ id: "panel-drawer-front", role: "drawer-front", thicknessMm: 18 });
  const result = validateEdgeBandingPolicyV4(minimalModel([panel], allAroundEdges(panel, 2)));
  assert.equal(result.ok, true);
});

test("HDF back-panel has no edge", () => {
  const panel = makePanel({ id: "panel-back-test", role: "back-panel" });
  const result = validateEdgeBandingPolicyV4(minimalModel([panel], []));
  assert.equal(result.ok, true);
  assert.equal(classifyEdgePolicyForPanelV4(panel), "no-edge");
});

test("HDF drawer-bottom has no edge", () => {
  const panel = makePanel({ id: "panel-drawer-bottom", role: "drawer-bottom" });
  const result = validateEdgeBandingPolicyV4(minimalModel([panel], []));
  assert.equal(result.ok, true);
});

test("HDF back-panel with edge fails", () => {
  const panel = makePanel({ id: "panel-back-test", role: "back-panel" });
  const result = validateEdgeBandingPolicyV4(minimalModel([panel], [makeEdge(panel.id, "front", 1)]));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "edgeGroovePolicy.edge.hdf.forbidden"));
});

test("duplicate panel+side edge fails", () => {
  const panel = makePanel({ id: "panel-shelf-dup", role: "shelf" });
  const edges = [
    makeEdge(panel.id, "front", 1, { id: "edge-dup-1" }),
    makeEdge(panel.id, "front", 1, { id: "edge-dup-2" }),
  ];
  const result = validateEdgeBandingPolicyV4(minimalModel([panel], edges));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "edgeGroovePolicy.edge.duplicate"));
});

test("unknown edge panel fails", () => {
  const panel = makePanel({ id: "panel-shelf-ref", role: "shelf" });
  const edges = [makeEdge("missing-panel", "front", 1)];
  const result = validateEdgeBandingPolicyV4(minimalModel([panel], edges));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "edgeGroovePolicy.edge.panelId.missing"));
});

test("groove placeholder passes", () => {
  const panel = makePanel({ id: "panel-side-groove", role: "side-left" });
  const groove: GrooveV4 = {
    id: "groove-back-placeholder",
    objectType: "groove",
    panelId: panel.id,
    purpose: "back-panel-insert",
    side: "back",
    widthMm: 3.2,
    depthMm: 6,
    requiresTechnologistCheck: true,
    confidence: "placeholder",
  };

  const result = validateGrooveBoundaryV4(minimalModel([panel], [], [groove]));
  assert.equal(result.ok, true);
});

test("groove with final/approved status fails", () => {
  const panel = makePanel({ id: "panel-side-final-groove", role: "side-left" });
  const groove: GrooveV4 = {
    id: "groove-final",
    objectType: "groove",
    panelId: panel.id,
    purpose: "drawer-bottom-insert",
    side: "inner-bottom",
    widthMm: 3.2,
    depthMm: 5,
    requiresTechnologistCheck: true,
    confidence: "final",
  };

  const result = validateGrooveBoundaryV4(minimalModel([panel], [], [groove]));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "edgeGroovePolicy.groove.machining.finalForbidden"));
});

test("groove missing technologist check fails", () => {
  const panel = makePanel({ id: "panel-side-no-tech", role: "side-left" });
  const groove = {
    id: "groove-no-tech",
    objectType: "groove",
    panelId: panel.id,
    purpose: "back-panel-insert",
    side: "back",
    widthMm: 3.2,
    depthMm: 6,
    requiresTechnologistCheck: false,
    confidence: "placeholder",
  } as GrooveV4;

  const result = validateGrooveBoundaryV4(minimalModel([panel], [], [groove]));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "edgeGroovePolicy.groove.requiresTechnologistCheck.invalid"));
});

test("adapter output passes edge/groove validation if v3 has normalized policy", () => {
  const v4 = buildProductionJsonV4FromV3(
    buildProductionExportFromPayload({
      orderId: "RZ-EDGE-001",
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

  const edgeResult = validateEdgeBandingPolicyV4(v4);
  const grooveResult = validateGrooveBoundaryV4(v4);
  assert.equal(edgeResult.ok, true, edgeResult.errors.map((error) => error.message).join("; "));
  assert.equal(grooveResult.ok, true, grooveResult.errors.map((error) => error.message).join("; "));
  assert.doesNotThrow(() => assertProductionJsonV4Invariants(v4));
  assert.ok(v4.edgeBanding.every((edge) => edge.semantics));
});

test("enrichment is immutable", () => {
  const model = structuredClone(productionJsonV4Example);
  const before = structuredClone(model);
  delete model.edgeBanding[0]?.semantics;

  const enriched = enrichModel(model);

  assert.ok(enriched.edgeBanding[0]?.semantics);
  assert.equal(model.edgeBanding[0]?.semantics, undefined);
  assert.deepEqual(model, before);
});

test("v4 example passes edge banding policy after enrichment", () => {
  const enriched = enrichModel(productionJsonV4Example);
  const result = validateEdgeBandingPolicyV4(enriched);
  assert.equal(result.ok, true, result.errors.map((error) => error.message).join("; "));
});
