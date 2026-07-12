import {
  type FurnitureType,
  type PriceBreakdown,
  type PriceInput,
} from "./pricing-core";
import { calculateCatalogPrice, type CatalogPriceBreakdown } from "../../pricing/engine";

export type { FurnitureType, PriceBreakdown, PriceInput, CatalogPriceBreakdown };

/**
 * Active pricing wrapper around the normalized catalog engine.
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

export function formatPrice(value: number): string {
  return `${value.toLocaleString("ru-RU")} \u20BD`;
}

export function hasCatalogBreakdown(price: PriceBreakdown | CatalogPriceBreakdown): price is CatalogPriceBreakdown {
  return "materials" in price && "edgeBanding" in price && "services" in price;
}
