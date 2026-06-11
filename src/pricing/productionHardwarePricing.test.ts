import assert from "node:assert/strict";
import { summarizeProductionHardwarePricing } from "./productionHardwarePricing";
import type { ProductionExportPackage } from "../constructor/production/types";
import type { HardwareItem } from "../constructor/geometry/types";

function hw(partial: Pick<HardwareItem, "id" | "type" | "name" | "vendor">): HardwareItem {
  return {
    ...partial,
    position: { xMm: 0, yMm: 0, zMm: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    linkedPanelIds: [],
    drillingRefs: [],
    visibleInViewer: false,
    includeInDocs: true,
  };
}

const productionExport = {
  productionModel: {
    hardware: [
      hw({ id: "h1", type: "hinge", name: "Петля Firmax 110°", vendor: "Firmax" }),
      hw({ id: "h2", type: "hinge", name: "Петля Firmax 110°", vendor: "Firmax" }),
      hw({ id: "s1", type: "drawer-slide", name: "Firmax SP роликовая", vendor: "Firmax" }),
      hw({ id: "r1", type: "rod", name: "Штанга для одежды Ø25 мм", vendor: "Firmax" }),
    ],
  },
} as ProductionExportPackage;

const summary = summarizeProductionHardwarePricing({
  productionExport,
  catalogHardwarePrice: 7000,
});

assert.equal(summary.schema, "razmerno.production-hardware-pricing.v1");
assert.equal(summary.hardwareCount, 4);
assert.equal(summary.pricedHardwareCount, 4);
assert.equal(summary.buckets.length, 3);
assert.ok(summary.hardwareEstimate > 0);
assert.equal(summary.deltaToCatalogHardware, summary.hardwareEstimate - 7000);
assert.ok(summary.warnings.some((warning) => warning.includes("foundation SKU")));
assert.equal(summary.supplierMatchedHardwareCount, 4);
assert.equal(summary.requiresPriceConfirmationCount, 4);

const hingeBucket = summary.buckets.find((bucket) => bucket.type === "hinge");
assert.ok(hingeBucket);
assert.equal(hingeBucket.count, 2);
assert.equal(hingeBucket.priceSource, "supplier-catalog-foundation");
assert.equal(hingeBucket.supplierSku, "firmax-hinge-110-foundation");
assert.equal(hingeBucket.requiresPriceConfirmation, true);

console.log("productionHardwarePricing.test passed");
