import assert from "node:assert/strict";
import type { HardwareItem, HardwareType } from "../constructor/geometry/types";
import { HARDWARE_SUPPLIER_CATALOG, resolveHardwareSupplierSku } from "./hardwareSupplierCatalog";

function hw(type: HardwareType, name: string, vendor = "Firmax"): HardwareItem {
  return {
    id: `${type}-1`,
    type,
    name,
    vendor,
    position: { xMm: 0, yMm: 0, zMm: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    linkedPanelIds: [],
    drillingRefs: [],
    visibleInViewer: false,
    includeInDocs: true,
  };
}

const requiredTypes: HardwareType[] = [
  "hinge",
  "drawer-slide",
  "handle",
  "push-to-open",
  "rod",
  "rod-holder",
  "shelf-support",
  "confirmat",
  "eccentric",
  "screw",
  "leg",
];

for (const type of requiredTypes) {
  assert.ok(
    HARDWARE_SUPPLIER_CATALOG.some((item) => item.type === type),
    `Missing supplier catalog foundation item for ${type}`,
  );
}

for (const item of HARDWARE_SUPPLIER_CATALOG) {
  assert.ok(item.sku.length > 0, "SKU is required");
  assert.ok(item.unitPrice >= 0, "unit price must be non-negative");
  assert.equal(item.status, "foundation");
  assert.equal(item.requiresPriceConfirmation, true);
  assert.equal(item.priceSource, "foundation-estimate");
}

assert.equal(resolveHardwareSupplierSku(hw("hinge", "Петля Firmax 110°")).item?.sku, "firmax-hinge-110-foundation");
assert.equal(resolveHardwareSupplierSku(hw("hinge", "Петля Hettich Sensys 110°", "Hettich")).item?.sku, "hettich-sensys-110-softclose-foundation");
assert.equal(resolveHardwareSupplierSku(hw("drawer-slide", "Hettich KA5732 шариковая полного выдвижения", "Hettich")).item?.sku, "hettich-ka5732-slide-pair-foundation");
assert.equal(resolveHardwareSupplierSku(hw("rod", "Штанга для одежды Ø25 мм")).item?.sku, "firmax-wardrobe-rod-25-foundation");
assert.equal(resolveHardwareSupplierSku(hw("shelf-support", "Полкодержатель Ø5")).item?.sku, "mdm-se01pb-shelf-support-foundation");

console.log("hardwareSupplierCatalog.test passed");
