import assert from "node:assert/strict";
import type { HardwareItem } from "../constructor/geometry/types";
import type { ProductionExportPackage } from "../constructor/production/types";
import { HARDWARE_SUPPLIER_CATALOG, resolveHardwareSupplierSku } from "./hardwareSupplierCatalog";
import { applyHardwareSupplierPriceImport, buildHardwareSupplierPriceImportTemplate } from "./hardwareSupplierPriceImport";
import { summarizeProductionHardwarePricing } from "./productionHardwarePricing";
import { buildProductionHardwarePricingDecision } from "./productionHardwarePricingDecision";

function hw(id: string, name: string, vendor = "Hettich"): HardwareItem {
  return {
    id,
    type: "hinge",
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

function productionExport(hardware: HardwareItem[]): ProductionExportPackage {
  return {
    productionModel: {
      hardware,
      panels: [],
      drilling: [],
    },
  } as unknown as ProductionExportPackage;
}

const priceImport = applyHardwareSupplierPriceImport({
  sourceDocument: "Hettich/Firmax confirmed price list test fixture",
  rows: [
    { sku: "hettich-sensys-110-softclose-foundation", unitPrice: 612, currency: "RUB", effectiveFrom: "2026-06-01" },
    { sku: "unknown-sku", unitPrice: 100, currency: "RUB" },
    { sku: "firmax-hinge-110-foundation", unitPrice: 0, currency: "RUB" },
  ],
});

assert.equal(priceImport.report.totalRows, 3, "Import report should count all rows");
assert.equal(priceImport.report.appliedRows, 1, "Only one valid known SKU row should be applied");
assert.equal(priceImport.report.skippedRows, 2, "Invalid/unknown rows should be skipped");
assert.ok(priceImport.report.errors.some((error) => error.includes("unknown-sku")), "Unknown SKU should be reported");
assert.ok(priceImport.report.errors.some((error) => error.includes("firmax-hinge")), "Invalid price should be reported");

const confirmedHettich = priceImport.catalog.find((item) => item.sku === "hettich-sensys-110-softclose-foundation");
assert.equal(confirmedHettich?.status, "confirmed", "Imported SKU should become confirmed");
assert.equal(confirmedHettich?.priceSource, "supplier-price-list", "Imported SKU should use supplier price list source");
assert.equal(confirmedHettich?.requiresPriceConfirmation, false, "Confirmed SKU should not require price confirmation");
assert.equal(confirmedHettich?.unitPrice, 612, "Confirmed SKU should use imported unit price");

const resolved = resolveHardwareSupplierSku(hw("hinge-1", "Hettich Sensys 110", "Hettich"), priceImport.catalog);
assert.equal(resolved.item?.status, "confirmed", "Resolver should use confirmed imported catalog item");

const summary = summarizeProductionHardwarePricing({
  productionExport: productionExport([hw("hinge-1", "Hettich Sensys 110", "Hettich")]),
  catalogHardwarePrice: 612,
  supplierCatalog: priceImport.catalog,
});
assert.equal(summary.supplierConfirmedHardwareCount, 1, "Hardware summary should count confirmed supplier match");
assert.equal(summary.requiresPriceConfirmationCount, 0, "Confirmed SKU should remove price confirmation requirement");
assert.equal(summary.buckets[0]?.priceSource, "supplier-catalog-confirmed", "Bucket should expose confirmed price source");
assert.equal(summary.hardwareEstimate, 612, "Hardware estimate should use confirmed price");

const decision = buildProductionHardwarePricingDecision(summary);
assert.equal(decision.status, "candidate", "Fully confirmed stable SKU should be candidate for controlled integration");
assert.equal(decision.recommendedSourceOfTruth, "production-hardware", "Candidate should recommend production hardware source");
assert.equal(decision.supplierConfirmedCoveragePercent, 100, "Confirmed coverage should be 100%");
assert.ok(!decision.reasons.includes("price-confirmation-required"), "Confirmed price should remove price-confirmation blocker");

const template = buildHardwareSupplierPriceImportTemplate(HARDWARE_SUPPLIER_CATALOG);
assert.equal(template.length, HARDWARE_SUPPLIER_CATALOG.length, "Import template should include every foundation SKU");
assert.ok(template.every((row) => row.currency === "RUB"), "Import template should use RUB by default");

console.log("hardwareSupplierPriceImport.test passed");
