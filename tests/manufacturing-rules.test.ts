import assert from "node:assert/strict";
import { buildProductionExportFromOrder } from "../src/constructor/production/orderExportPackage";

const order = {
  productType: "wardrobe" as const,
  dimensions: { width: 1800, height: 2400, depth: 600 },
  sections: 2,
  filling: { shelves: 4, drawers: 3, hangingRod: true },
  layout: {
    sections: [
      {
        id: "section-1",
        widthMm: 900,
        compartments: [{ id: "section-1-compartment-1", kind: "drawers" as const, heightMm: 2400, shelves: 0, drawers: 3, hasRod: false }],
      },
      {
        id: "section-2",
        widthMm: 900,
        compartments: [{ id: "section-2-compartment-1", kind: "rod" as const, heightMm: 2400, shelves: 2, drawers: 0, hasRod: true }],
      },
    ],
  },
  materials: { bodyId: "white-matt", facadeId: "oak-natural" },
  style: { facadeStyleId: "regular", hardwareId: "comfort" },
};

const pack = buildProductionExportFromOrder(order);

assert.equal(pack.factoryProfile.id, "default_mvp");
assert.equal(pack.rules.schema, "razmerno.manufacturing-rules.v1");
assert.ok(pack.rules.autoRepairs.some((item) => item.code === "HINGE_COUNT_RULE_APPLIED"));
assert.ok(pack.rules.autoRepairs.some((item) => item.code === "FACADE_GAP_RULE_APPLIED"));
assert.ok(["ready-for-review", "blocked"].includes(pack.validation.status));
assert.equal(pack.review.manualChangesAllowed, true);
assert.equal(pack.review.visibleToClient, false);
assert.ok(pack.revisions.length >= 1);
assert.equal(pack.revisions[0].source, "auto");

console.log("Manufacturing rules test passed.");
