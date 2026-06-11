import assert from "node:assert/strict";
import { summarizeProductionServicesPricing } from "./productionServicesPricing";
import type { ProductionExportPackage } from "../constructor/production/types";
import type { DrillingOperation, EdgeBandingTotal, Panel } from "../constructor/geometry/types";

function panel(partial: Pick<Panel, "id" | "role" | "widthMm" | "heightMm">): Panel {
  return {
    ...partial,
    name: partial.id,
    materialType: partial.role === "back-panel" ? "hdf" : "ldsp",
    materialId: partial.role === "back-panel" ? "hdf-kronospan-k101-belyy-fasadnyy" : "ldsp-egger-w960-belyy-klassicheskiy-sm",
    thicknessMm: partial.role === "back-panel" ? 3 : 16,
    depthMm: partial.role === "back-panel" ? 3 : 16,
    position: { xMm: 0, yMm: 0, zMm: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    faceSide: "front",
    edgeBanding: {},
    visible: true,
    selectable: true,
    basis: {
      objectType: "panel",
      name: partial.id,
      article: partial.id,
      designation: partial.id,
      includeInDocs: true,
      userProperties: {},
    },
  };
}

function drill(id: string, purpose: DrillingOperation["purpose"]): DrillingOperation {
  return {
    id,
    panelId: "p1",
    purpose,
    xMm: 0,
    yMm: 0,
    zMm: 0,
    diameterMm: 5,
    depthMm: 12,
    through: false,
    side: "front",
    requiresTechnologistCheck: true,
  };
}

function edge(id: string, lengthMm: number): EdgeBandingTotal {
  return {
    panelId: id,
    side: "front",
    materialId: "edge-white",
    thicknessMm: 0.8,
    widthMm: 22,
    lengthMm,
  };
}

const productionExport = {
  productionModel: {
    panels: [
      panel({ id: "p1", role: "side-left", widthMm: 2400, heightMm: 600 }),
      panel({ id: "p2", role: "facade-door", widthMm: 2200, heightMm: 500 }),
      panel({ id: "p3", role: "back-panel", widthMm: 1800, heightMm: 2400 }),
    ],
    drilling: [
      drill("d1", "hinge-cup"),
      drill("d2", "hinge-screw"),
      drill("d3", "shelf-support"),
    ],
    edgeBanding: [edge("p1", 2400), edge("p2", 2200)],
  },
} as ProductionExportPackage;

const summary = summarizeProductionServicesPricing({
  productionExport,
  catalogServicesPrice: 9000,
  catalogProductionPrice: 3000,
});

assert.equal(summary.schema, "razmerno.production-services-pricing.v1");
assert.equal(summary.drillingCount, 3);
assert.equal(summary.edgeBandingLengthM, 4.6);
assert.ok(summary.panelAreaM2 > 0);
assert.equal(summary.cuttingEstimate, 0);
assert.ok(summary.edgeServiceEstimate > 0);
assert.equal(summary.drillingEstimate, 0);
assert.ok(summary.packagingEstimate > 0);
assert.equal(summary.servicesEstimate, summary.cuttingEstimate + summary.edgeServiceEstimate + summary.drillingEstimate + summary.packagingEstimate);
assert.equal(summary.deltaToCatalogServices, summary.servicesEstimate - 9000);
assert.equal(summary.drillingByPurpose["hinge-cup"], 1);
assert.ok(summary.buckets.some((bucket) => bucket.key === "packing-carton"));
assert.ok(summary.warnings.some((warning) => warning.includes("Debug-only")));
assert.ok(summary.warnings.some((warning) => warning.includes("Распил и присадка")));

console.log("productionServicesPricing.test passed");
