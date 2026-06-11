import pricingConfig from "../../config/pricing.json";
import {
  calculatePriceCore,
  quickEstimateCore,
  type FurnitureType,
  type PriceBreakdown,
  type PriceInput,
} from "./pricing-core";
import { calculateCatalogPrice, type CatalogPriceBreakdown } from "../../pricing/engine";

export type { FurnitureType, PriceBreakdown, PriceInput, CatalogPriceBreakdown };

/**
 * Новый pricing engine по нормализованному прайсу.
 */
export function calculatePrice(input: PriceInput): CatalogPriceBreakdown {
  return calculateCatalogPrice({
    type: input.type,
    dimensions: input.dimensions,
    sections: input.sections,
    filling: input.filling,
    bodyProducer: input.bodyProducer,
    bodyArticle: input.bodyArticle,
    bodyThicknessMm: input.bodyThicknessMm,
    facadeProducer: input.facadeProducer,
    facadeArticle: input.facadeArticle,
    facadeThicknessMm: input.facadeThicknessMm,
    facadeMaterialKind: input.facadeMaterialKind,
    facadeStyleMultiplier: input.facadeStyleMultiplier,
    hardwareLevel: input.hardwareBasePrice > 5000 ? "comfort" : "base",
  });
}

/**
 * Legacy estimate оставлен только как fallback для сравнений/миграции.
 */
export function calculateLegacyPrice(input: PriceInput): PriceBreakdown {
  return calculatePriceCore(pricingConfig, input);
}

/** Hero quick estimate пока остаётся быстрым приближением. */
export function quickEstimate(width: number, height: number, depth: number): number {
  return quickEstimateCore(pricingConfig, width, height, depth);
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}


export function hasCatalogBreakdown(price: PriceBreakdown | CatalogPriceBreakdown): price is CatalogPriceBreakdown {
  return "materials" in price && "edgeBanding" in price && "services" in price;
}
