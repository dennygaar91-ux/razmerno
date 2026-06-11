import assert from "node:assert/strict";
import { buildProductionHardwarePricingDecision } from "./productionHardwarePricingDecision";
import type { ProductionHardwarePricingSummary } from "./productionHardwarePricing";

const fixedSummary: ProductionHardwarePricingSummary = {
  schema: "razmerno.production-hardware-pricing.v1",
  hardwareCount: 4,
  pricedHardwareCount: 4,
  buckets: [
    {
      key: "hinge:Firmax:Петля Firmax 110°",
      type: "hinge",
      vendor: "Firmax",
      name: "Петля Firmax 110°",
      count: 4,
      unitPrice: 494,
      priceSource: "fixed-mvp-rate",
      estimatedCost: 1976,
      requiresPriceConfirmation: true,
    },
  ],
  hardwareEstimate: 1976,
  supplierMatchedHardwareCount: 0,
  supplierConfirmedHardwareCount: 0,
  requiresPriceConfirmationCount: 4,
  catalogHardwarePrice: 4200,
  deltaToCatalogHardware: -2224,
  warnings: ["debug-оценка"],
};

const fixedDecision = buildProductionHardwarePricingDecision(fixedSummary);
assert.equal(fixedDecision.schema, "razmerno.production-hardware-pricing-decision.v1");
assert.equal(fixedDecision.status, "blocked");
assert.equal(fixedDecision.recommendedSourceOfTruth, "manual-review");
assert.ok(fixedDecision.reasons.includes("fixed-mvp-rates"));
assert.ok(fixedDecision.reasons.includes("price-confirmation-required"));
assert.equal(fixedDecision.pricedCoveragePercent, 100);
assert.equal(fixedDecision.supplierMatchedCoveragePercent, 0);

const missingBaselineDecision = buildProductionHardwarePricingDecision({
  ...fixedSummary,
  catalogHardwarePrice: null,
  deltaToCatalogHardware: null,
});
assert.equal(missingBaselineDecision.status, "blocked");
assert.ok(missingBaselineDecision.reasons.includes("missing-catalog-baseline"));

const stableSummary: ProductionHardwarePricingSummary = {
  ...fixedSummary,
  buckets: [
    {
      key: "hinge:Hettich:Hettich exact",
      type: "hinge",
      vendor: "Hettich",
      name: "Hettich exact",
      count: 4,
      unitPrice: 1000,
      priceSource: "zero-nonpriced-connector",
      estimatedCost: 4000,
      requiresPriceConfirmation: false,
    },
  ],
  hardwareEstimate: 4000,
  supplierMatchedHardwareCount: 4,
  supplierConfirmedHardwareCount: 4,
  requiresPriceConfirmationCount: 0,
  catalogHardwarePrice: 4100,
  deltaToCatalogHardware: -100,
  warnings: [],
};
const stableDecision = buildProductionHardwarePricingDecision(stableSummary);
assert.equal(stableDecision.status, "candidate");
assert.equal(stableDecision.recommendedSourceOfTruth, "production-hardware");
assert.ok(stableDecision.reasons.includes("stable-delta"));

console.log("productionHardwarePricingDecision.test passed");
