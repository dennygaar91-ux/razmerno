import type { ProductionHardwarePricingSummary } from "./productionHardwarePricing";

export type ProductionHardwarePricingDecisionStatus =
  | "audit-only"
  | "candidate"
  | "blocked";

export type ProductionHardwarePricingDecisionReason =
  | "missing-catalog-baseline"
  | "fixed-mvp-rates"
  | "unpriced-hardware"
  | "high-delta"
  | "moderate-delta"
  | "stable-delta"
  | "supplier-price-list-required"
  | "price-confirmation-required";

export type ProductionHardwarePricingDecision = {
  schema: "razmerno.production-hardware-pricing-decision.v1";
  status: ProductionHardwarePricingDecisionStatus;
  recommendedSourceOfTruth: "catalog" | "production-hardware" | "manual-review";
  catalogBaseline: number | null;
  productionHardwareEstimate: number;
  delta: number | null;
  deltaPercent: number | null;
  pricedCoveragePercent: number;
  supplierMatchedCoveragePercent: number;
  supplierConfirmedCoveragePercent: number;
  requiresPriceConfirmationCount: number;
  absoluteDeltaLevel: "none" | "low" | "medium" | "high" | "unknown";
  reasons: ProductionHardwarePricingDecisionReason[];
  managerSummary: string;
  clientSummary: string;
  nextAction: string;
};

const HIGH_ABSOLUTE_DELTA_RUB = 8_000;
const MEDIUM_ABSOLUTE_DELTA_RUB = 4_000;
const HIGH_DELTA_PERCENT = 25;
const MODERATE_DELTA_PERCENT = 12;

function roundMoney(value: number): number {
  return Math.round(value);
}

function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function getDeltaPercent(input: {
  delta: number | null;
  baseline: number | null;
}): number | null {
  if (input.delta === null || input.baseline === null || input.baseline <= 0) return null;
  return roundPercent((input.delta / input.baseline) * 100);
}

function getAbsoluteDeltaLevel(delta: number | null): ProductionHardwarePricingDecision["absoluteDeltaLevel"] {
  if (delta === null) return "unknown";
  const abs = Math.abs(delta);
  if (abs === 0) return "none";
  if (abs >= HIGH_ABSOLUTE_DELTA_RUB) return "high";
  if (abs >= MEDIUM_ABSOLUTE_DELTA_RUB) return "medium";
  return "low";
}

export function buildProductionHardwarePricingDecision(
  summary: ProductionHardwarePricingSummary,
): ProductionHardwarePricingDecision {
  const catalogBaseline = summary.catalogHardwarePrice ?? null;
  const productionHardwareEstimate = roundMoney(summary.hardwareEstimate);
  const delta = catalogBaseline === null ? null : roundMoney(productionHardwareEstimate - catalogBaseline);
  const deltaPercent = getDeltaPercent({ delta, baseline: catalogBaseline });
  const absoluteDeltaLevel = getAbsoluteDeltaLevel(delta);
  const pricedCoveragePercent = summary.hardwareCount <= 0
    ? 100
    : roundPercent((summary.pricedHardwareCount / summary.hardwareCount) * 100);
  const supplierMatchedCoveragePercent = summary.hardwareCount <= 0
    ? 100
    : roundPercent((summary.supplierMatchedHardwareCount / summary.hardwareCount) * 100);
  const supplierConfirmedCoveragePercent = summary.hardwareCount <= 0
    ? 100
    : roundPercent((summary.supplierConfirmedHardwareCount / summary.hardwareCount) * 100);
  const usesFixedRates = summary.buckets.some((bucket) => bucket.priceSource === "fixed-mvp-rate");
  const hasUnpricedHardware = summary.pricedHardwareCount < summary.hardwareCount;
  const requiresPriceConfirmation = summary.requiresPriceConfirmationCount > 0 ||
    summary.buckets.some((bucket) => bucket.priceSource === "supplier-catalog-foundation" || bucket.requiresPriceConfirmation);
  const reasons: ProductionHardwarePricingDecisionReason[] = [];

  if (catalogBaseline === null) reasons.push("missing-catalog-baseline");
  if (usesFixedRates) reasons.push("fixed-mvp-rates");
  if (hasUnpricedHardware) reasons.push("unpriced-hardware");
  if (requiresPriceConfirmation) reasons.push("price-confirmation-required");
  if (summary.supplierConfirmedHardwareCount < summary.hardwareCount) reasons.push("supplier-price-list-required");
  if (deltaPercent !== null && Math.abs(deltaPercent) >= HIGH_DELTA_PERCENT) reasons.push("high-delta");
  else if (deltaPercent !== null && Math.abs(deltaPercent) >= MODERATE_DELTA_PERCENT) reasons.push("moderate-delta");
  else if (deltaPercent !== null) reasons.push("stable-delta");

  const hasBlockingReason = reasons.includes("missing-catalog-baseline") ||
    reasons.includes("fixed-mvp-rates") ||
    reasons.includes("unpriced-hardware") ||
    reasons.includes("price-confirmation-required") ||
    reasons.includes("high-delta");
  const hasModerateDelta = reasons.includes("moderate-delta");
  const status: ProductionHardwarePricingDecisionStatus = hasBlockingReason
    ? "blocked"
    : hasModerateDelta
      ? "audit-only"
      : "candidate";
  const recommendedSourceOfTruth = status === "candidate"
    ? "production-hardware"
    : status === "blocked"
      ? "manual-review"
      : "catalog";

  const managerSummary = status === "candidate"
    ? "Production-hardware estimate близок к текущей смете: можно готовить controlled live integration после проверки прайса фурнитуры."
    : status === "blocked"
      ? "Production-hardware estimate нельзя включать в live price: есть неподтверждённые foundation SKU, фиксированные MVP-ставки, неполное покрытие, нет baseline или высокая дельта."
      : "Production-hardware estimate остаётся audit-only до дополнительного сравнения и supplier-level прайса.";

  const clientSummary = status === "candidate"
    ? "Фурнитура рассчитана по технической модели и готова к проверке менеджером."
    : "Фурнитура проверяется менеджером: часть позиций пока используется как внутренняя оценка.";

  const nextAction = status === "candidate"
    ? "Подготовить feature-flag/controlled integration для фурнитуры без изменения checkout/API."
    : "Оставить live hardware price на текущей catalog-формуле и добавить supplier-level прайс Hettich/Firmax/ручек/штанг.";

  return {
    schema: "razmerno.production-hardware-pricing-decision.v1",
    status,
    recommendedSourceOfTruth,
    catalogBaseline,
    productionHardwareEstimate,
    delta,
    deltaPercent,
    pricedCoveragePercent,
    supplierMatchedCoveragePercent,
    supplierConfirmedCoveragePercent,
    requiresPriceConfirmationCount: summary.requiresPriceConfirmationCount,
    absoluteDeltaLevel,
    reasons: unique(reasons),
    managerSummary,
    clientSummary,
    nextAction,
  };
}
