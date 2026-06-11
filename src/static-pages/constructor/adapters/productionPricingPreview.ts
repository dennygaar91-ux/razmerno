import type { CatalogPriceBreakdown } from "../../../pricing/engine";
import { summarizeProductionHardwarePricing, type ProductionHardwarePricingSummary } from "../../../pricing/productionHardwarePricing";
import { summarizeProductionServicesPricing, type ProductionServicesPricingSummary } from "../../../pricing/productionServicesPricing";
import { buildProductionServicesPricingDecision, type ProductionServicesPricingDecision } from "../../../pricing/productionServicesPricingDecision";
import { buildProductionHardwarePricingDecision, type ProductionHardwarePricingDecision } from "../../../pricing/productionHardwarePricingDecision";
import {
  applyProductionPanelPricingToCatalogPrice,
  summarizeProductionPanelPricing,
  type ProductionPanelPriceApplication,
  type ProductionPanelPricingSummary,
} from "../../../pricing/productionPanelPricing";
import type { QuoteState } from "../types";
import type { ConstructorSnapshot } from "./constructorPayload";
import {
  buildConstructorProductionPreview,
  type ConstructorProductionPreview,
} from "./productionPreviewAdapter";

export type ConstructorProductionPricingBundle = {
  preview: ConstructorProductionPreview;
  panelPricing: ProductionPanelPricingSummary;
  hardwarePricing: ProductionHardwarePricingSummary;
  hardwareDecision: ProductionHardwarePricingDecision;
  servicesPricing: ProductionServicesPricingSummary;
  servicesDecision: ProductionServicesPricingDecision;
  appliedPrice: ProductionPanelPriceApplication;
};

export function buildConstructorProductionPricingBundle(input: {
  snapshot: ConstructorSnapshot;
  catalogQuote: QuoteState;
  catalogPrice: CatalogPriceBreakdown;
}): ConstructorProductionPricingBundle {
  const preview = buildConstructorProductionPreview(input.snapshot, input.catalogQuote);
  const panelPricing = summarizeProductionPanelPricing({
    productionExport: preview.productionExport,
    catalogMaterialsPrice: input.catalogPrice.materials,
  });
  const hardwarePricing = summarizeProductionHardwarePricing({
    productionExport: preview.productionExport,
    catalogHardwarePrice: input.catalogPrice.hardware,
  });
  const hardwareDecision = buildProductionHardwarePricingDecision(hardwarePricing);
  const servicesPricing = summarizeProductionServicesPricing({
    productionExport: preview.productionExport,
    catalogServicesPrice: input.catalogPrice.services,
    catalogProductionPrice: input.catalogPrice.production,
  });
  const servicesDecision = buildProductionServicesPricingDecision(servicesPricing);
  const appliedPrice = applyProductionPanelPricingToCatalogPrice({
    catalogPrice: input.catalogPrice,
    panelPricing,
  });

  return {
    preview,
    panelPricing,
    hardwarePricing,
    hardwareDecision,
    servicesPricing,
    servicesDecision,
    appliedPrice,
  };
}
