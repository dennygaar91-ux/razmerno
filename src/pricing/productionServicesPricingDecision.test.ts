import assert from "node:assert/strict";
import { buildProductionServicesPricingDecision } from "./productionServicesPricingDecision";
import type { ProductionServicesPricingSummary } from "./productionServicesPricing";

function baseSummary(overrides: Partial<ProductionServicesPricingSummary> = {}): ProductionServicesPricingSummary {
  return {
    schema: "razmerno.production-services-pricing.v1",
    panelAreaM2: 10,
    edgeBandingLengthM: 30,
    drillingCount: 20,
    packagingAreaM2: 10,
    cuttingEstimate: 6000,
    edgeServiceEstimate: 3000,
    drillingEstimate: 1200,
    packagingEstimate: 800,
    servicesEstimate: 11000,
    productionBufferEstimate: 880,
    totalServicesWithProduction: 11880,
    catalogServicesPrice: 10000,
    catalogProductionPrice: 2000,
    deltaToCatalogServices: 1000,
    deltaToCatalogServicesWithProduction: -120,
    drillingByPurpose: {},
    buckets: [
      {
        key: "cutting",
        label: "Распил",
        quantity: 10,
        unit: "m2",
        unitPrice: 600,
        priceSource: "catalog-service",
        estimatedCost: 6000,
      },
    ],
    warnings: [],
    ...overrides,
  };
}

const candidate = buildProductionServicesPricingDecision(baseSummary());
assert.equal(candidate.status, "candidate");
assert.equal(candidate.recommendedSourceOfTruth, "production-services");
assert.equal(candidate.delta, -120);
assert.ok(candidate.reasons.includes("stable-delta"));
assert.ok(candidate.reasons.includes("production-norms-required"));

const fixedRate = buildProductionServicesPricingDecision(baseSummary({
  buckets: [
    {
      key: "drilling",
      label: "Присадка",
      quantity: 20,
      unit: "pcs",
      unitPrice: 24,
      priceSource: "fixed-mvp-rate",
      estimatedCost: 480,
    },
  ],
}));
assert.equal(fixedRate.status, "blocked");
assert.equal(fixedRate.recommendedSourceOfTruth, "manual-review");
assert.ok(fixedRate.reasons.includes("fixed-mvp-rates"));

const highDelta = buildProductionServicesPricingDecision(baseSummary({
  servicesEstimate: 22000,
  productionBufferEstimate: 1760,
  totalServicesWithProduction: 23760,
}));
assert.equal(highDelta.status, "blocked");
assert.ok(highDelta.reasons.includes("high-delta"));
assert.equal(highDelta.absoluteDeltaLevel, "high");

const noBaseline = buildProductionServicesPricingDecision(baseSummary({
  catalogServicesPrice: null,
  catalogProductionPrice: null,
}));
assert.equal(noBaseline.status, "blocked");
assert.equal(noBaseline.delta, null);
assert.equal(noBaseline.deltaPercent, null);
assert.ok(noBaseline.reasons.includes("missing-catalog-baseline"));

console.log("productionServicesPricingDecision.test passed");
