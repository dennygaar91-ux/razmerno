import type { ProductionServicesPricingSummary } from "./productionServicesPricing";

export type ProductionServicesPricingDecisionStatus =
  | "audit-only"
  | "candidate"
  | "blocked";

export type ProductionServicesPricingDecisionReason =
  | "missing-catalog-baseline"
  | "fixed-mvp-rates"
  | "high-delta"
  | "moderate-delta"
  | "stable-delta"
  | "production-norms-required";

export type ProductionServicesPricingDecision = {
  schema: "razmerno.production-services-pricing-decision.v1";
  status: ProductionServicesPricingDecisionStatus;
  recommendedSourceOfTruth: "catalog" | "production-services" | "manual-review";
  catalogBaseline: number | null;
  productionServicesEstimate: number;
  productionServicesWithBuffer: number;
  delta: number | null;
  deltaPercent: number | null;
  absoluteDeltaLevel: "none" | "low" | "medium" | "high" | "unknown";
  reasons: ProductionServicesPricingDecisionReason[];
  managerSummary: string;
  clientSummary: string;
  nextAction: string;
};

const HIGH_ABSOLUTE_DELTA_RUB = 10_000;
const MEDIUM_ABSOLUTE_DELTA_RUB = 5_000;
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

function getAbsoluteDeltaLevel(delta: number | null): ProductionServicesPricingDecision["absoluteDeltaLevel"] {
  if (delta === null) return "unknown";
  const abs = Math.abs(delta);
  if (abs === 0) return "none";
  if (abs >= HIGH_ABSOLUTE_DELTA_RUB) return "high";
  if (abs >= MEDIUM_ABSOLUTE_DELTA_RUB) return "medium";
  return "low";
}

function getDeltaPercent(input: {
  delta: number | null;
  baseline: number | null;
}): number | null {
  if (input.delta === null || input.baseline === null || input.baseline <= 0) return null;
  return roundPercent((input.delta / input.baseline) * 100);
}

export function buildProductionServicesPricingDecision(
  summary: ProductionServicesPricingSummary,
): ProductionServicesPricingDecision {
  const catalogBaseline = summary.catalogServicesPrice === null || summary.catalogProductionPrice === null
    ? null
    : summary.catalogServicesPrice + summary.catalogProductionPrice;
  const productionServicesEstimate = roundMoney(summary.servicesEstimate);
  const productionServicesWithBuffer = roundMoney(summary.totalServicesWithProduction);
  const delta = catalogBaseline === null ? null : roundMoney(productionServicesWithBuffer - catalogBaseline);
  const deltaPercent = getDeltaPercent({ delta, baseline: catalogBaseline });
  const absoluteDeltaLevel = getAbsoluteDeltaLevel(delta);
  const usesFixedRates = summary.buckets.some((bucket) => bucket.priceSource === "fixed-mvp-rate");
  const reasons: ProductionServicesPricingDecisionReason[] = [];

  if (catalogBaseline === null) reasons.push("missing-catalog-baseline");
  if (usesFixedRates) reasons.push("fixed-mvp-rates");
  if (deltaPercent !== null && Math.abs(deltaPercent) >= HIGH_DELTA_PERCENT) reasons.push("high-delta");
  else if (deltaPercent !== null && Math.abs(deltaPercent) >= MODERATE_DELTA_PERCENT) reasons.push("moderate-delta");
  else if (deltaPercent !== null) reasons.push("stable-delta");
  reasons.push("production-norms-required");

  const hasBlockingReason = reasons.includes("missing-catalog-baseline") ||
    reasons.includes("fixed-mvp-rates") ||
    reasons.includes("high-delta");
  const hasModerateDelta = reasons.includes("moderate-delta");
  const status: ProductionServicesPricingDecisionStatus = hasBlockingReason
    ? "blocked"
    : hasModerateDelta
      ? "audit-only"
      : "candidate";
  const recommendedSourceOfTruth = status === "candidate" ? "production-services" : status === "blocked" ? "manual-review" : "catalog";

  const managerSummary = status === "candidate"
    ? "Production-services estimate близок к текущей смете: можно готовить controlled live integration после проверки норм."
    : status === "blocked"
      ? "Production-services estimate нельзя включать в live price: есть фиксированные MVP-ставки, нет baseline или высокая дельта."
      : "Production-services estimate остаётся audit-only до дополнительного сравнения и подтверждения норм.";

  const clientSummary = status === "candidate"
    ? "Производственные услуги рассчитаны по технической модели и готовы к проверке менеджером."
    : "Производственные услуги проверяются менеджером: часть норм пока используется как внутренняя оценка.";

  const nextAction = status === "candidate"
    ? "Подготовить feature-flag/controlled integration для услуг без изменения checkout/API."
    : "Оставить live services price на текущей catalog-формуле и собрать производственные нормы распила, присадки и упаковки.";

  return {
    schema: "razmerno.production-services-pricing-decision.v1",
    status,
    recommendedSourceOfTruth,
    catalogBaseline,
    productionServicesEstimate,
    productionServicesWithBuffer,
    delta,
    deltaPercent,
    absoluteDeltaLevel,
    reasons: unique(reasons),
    managerSummary,
    clientSummary,
    nextAction,
  };
}
