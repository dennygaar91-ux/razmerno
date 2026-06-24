import assert from "node:assert/strict";
import { buildProductionExportFromOrder } from "../src/constructor/production/orderExportPackage";

const FORBIDDEN_BASIS_AUTO_B3D_CLAIMS = [
  "document:create-b3d",
  '"documentType":"b3d"',
  "'documentType': 'b3d'",
  "автоматической генерации .b3d",
  "автоматической генерации",
] as const;

function assertBasisManualJsonBoundary(
  serialized: string,
  basisStatus: string,
  label: string,
) {
  assert.equal(basisStatus, "manual-json-ready", `${label}: basis.status`);
  for (const forbidden of FORBIDDEN_BASIS_AUTO_B3D_CLAIMS) {
    assert.ok(!serialized.includes(forbidden), `${label}: forbidden auto-b3d claim "${forbidden}"`);
  }
  assert.ok(!serialized.includes("create-b3d"), `${label}: must not reference create-b3d command id`);
}

const order = {
  productType: "wardrobe" as const,
  dimensions: { width: 1800, height: 2400, depth: 600 },
  sections: 2,
  filling: { shelves: 4, drawers: 0, hangingRod: true },
  layout: {
    sections: [
      {
        id: "section-1",
        widthMm: 900,
        compartments: [{ id: "section-1-compartment-1", kind: "shelves" as const, heightMm: 2400, shelves: 2, drawers: 0, hasRod: false }],
      },
      {
        id: "section-2",
        widthMm: 900,
        compartments: [{ id: "section-2-compartment-1", kind: "rod" as const, heightMm: 2400, shelves: 2, drawers: 0, hasRod: true }],
      },
    ],
  },
  materials: { bodyId: "white-matt", facadeId: "oak-natural" },
  style: { facadeStyleId: "no-handle", hardwareId: "comfort" },
};

const pack = buildProductionExportFromOrder(order);

assert.equal(pack.schema, "razmerno.production-export.v1");
assert.equal(pack.units, "mm");
assert.equal(pack.source, "api-order");
assert.equal(pack.project.productType, "wardrobe");
assert.ok(pack.productionModel.panels.length > 0);
assert.ok(pack.productionModel.edgeBanding.length > 0);
assert.ok(pack.productionModel.basisExportPlan.length > 0);
assert.equal(pack.basis.status, "manual-json-ready");
assertBasisManualJsonBoundary(JSON.stringify(pack), pack.basis.status, "production export");
assert.equal(pack.validation.schema, "razmerno.production-validation.v1");
assert.ok(pack.validation.summary.panels > 0);
assert.ok(typeof pack.manufacturing.requiresTechnologistCheck === "boolean");
assert.equal(pack.review.visibleToClient, false);
assert.equal(pack.revisions.length, 1);
assert.ok(pack.productionModel.drilling.every((operation) => operation.panelId));
assert.ok(
  pack.productionModel.hardware.every((item) =>
    item.drillingRefs.every((ref) => pack.productionModel.drilling.some((drill) => drill.id === ref)),
  ),
);

console.log("Production export package test passed.");
