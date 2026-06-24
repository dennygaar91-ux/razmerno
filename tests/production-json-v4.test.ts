import assert from "node:assert/strict";
import { test } from "node:test";
import { productionJsonV4Example } from "../src/constructor/production/v4/example.js";
import {
  assertProductionJsonV4Invariants,
  validateProductionJsonV4,
} from "../src/constructor/production/v4/guards.js";
import type { ProductionJsonV4 } from "../src/constructor/production/v4/types.js";

const FORBIDDEN_B3D_CLAIMS = [
  "document:create-b3d",
  '"documentType":"b3d"',
  "create-b3d",
  "автоматической генерации .b3d",
] as const;

function cloneExample(): ProductionJsonV4 {
  return structuredClone(productionJsonV4Example);
}

test("example passes invariants", () => {
  const result = validateProductionJsonV4(productionJsonV4Example);
  assert.equal(result.ok, true, result.errors.map((error) => error.message).join("; "));
  assert.doesNotThrow(() => assertProductionJsonV4Invariants(productionJsonV4Example));
});

test("Basis boundary: no .b3d / no b3d generation claims", () => {
  const serialized = JSON.stringify(productionJsonV4Example);
  assert.equal(productionJsonV4Example.basisCompatibility.doesNotGenerateB3d, true);
  assert.equal(productionJsonV4Example.basisCompatibility.status, "manual-json-ready");
  assert.equal(productionJsonV4Example.basisCompatibility.mode, "manual-json");
  for (const forbidden of FORBIDDEN_B3D_CLAIMS) {
    assert.ok(!serialized.includes(forbidden), `forbidden claim: ${forbidden}`);
  }
});

test("material rules are enforced on example", () => {
  const bodyPanels = productionJsonV4Example.panels.filter((panel) =>
    ["side-left", "side-right", "bottom", "top", "shelf"].includes(panel.role),
  );
  assert.ok(bodyPanels.length > 0);
  assert.ok(bodyPanels.every((panel) => panel.materialKind === "ldsp" && panel.thicknessMm === 16));

  const facadePanels = productionJsonV4Example.panels.filter((panel) => panel.role === "facade-door");
  assert.ok(facadePanels.every((panel) => panel.materialKind === "mdf" && panel.thicknessMm === 18));

  const hdfPanels = productionJsonV4Example.panels.filter((panel) => panel.role === "back-panel");
  assert.ok(hdfPanels.every((panel) => panel.materialKind === "hdf" && panel.thicknessMm === 3));
  assert.ok(hdfPanels.every((panel) => panel.textureDirection === "none"));
});

test("invalid body material fails", () => {
  const model = cloneExample();
  const side = model.panels.find((panel) => panel.role === "side-left");
  assert.ok(side);
  side.materialKind = "mdf";
  side.thicknessMm = 18;

  const result = validateProductionJsonV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "panel.body.material.invalid"));
});

test("invalid facade thickness fails", () => {
  const model = cloneExample();
  const facade = model.panels.find((panel) => panel.role === "facade-door");
  assert.ok(facade);
  facade.thicknessMm = 16;

  const result = validateProductionJsonV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "panel.facade.mdf.thickness.invalid"));
});

test("invalid HDF thickness fails", () => {
  const model = cloneExample();
  const back = model.panels.find((panel) => panel.role === "back-panel");
  assert.ok(back);
  back.thicknessMm = 4;

  const result = validateProductionJsonV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "panel.hdf.invalid"));
});

test("invalid drawer-bottom material/thickness fails", () => {
  const model = cloneExample();
  model.panels.push({
    id: "panel-drawer-bottom-1",
    objectType: "panel",
    basisObjectType: "panel",
    role: "drawer-bottom",
    name: "Дно ящика",
    materialRef: "mat-body-white-ldsp-16",
    materialKind: "ldsp",
    thicknessMm: 16,
    dimensions: { widthMm: 400, heightMm: 500, thicknessMm: 16 },
    orientation: { basisPanelKind: "horizontal", plane: "XZ" },
    textureDirection: "none",
    includeInDocumentation: true,
  });

  const result = validateProductionJsonV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "panel.hdf.invalid"));
});

test("broken refs fail", () => {
  const model = cloneExample();
  const side = model.panels.find((panel) => panel.role === "side-left");
  assert.ok(side);
  side.edgeBandingRefs = ["edge-missing-ref"];

  const result = validateProductionJsonV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "panel.edgeBandingRef.missing"));
});

test("final drilling without coordinate decision fails", () => {
  const model = cloneExample();
  model.drilling.push({
    id: "drill-final-missing-coords",
    objectType: "drilling",
    panelId: "panel-facade-left",
    purpose: "hinge-cup",
    side: "inner",
    coordinateSpace: "panel-local",
    world: null,
    local: null,
    diameterMm: 35,
    depthMm: 12,
    templateRef: null,
    hardwareRef: "hardware-hinge-left-1",
    requiresTechnologistCheck: false,
  });

  const result = validateProductionJsonV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "drilling.final.missing-coordinate-decision"));
});

test("review.visibleToClient true fails", () => {
  const model = cloneExample();
  (model.review as { visibleToClient: boolean }).visibleToClient = true;

  const result = validateProductionJsonV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "review.visibleToClient.invalid"));
});
