import { useEffect, useMemo, useState } from "react";
import { loadPricingModules } from "../pricingLoader";
import { buildConstructorMaterialPricingContext } from "../../../pricing/materialPricing";
import {
  buildPricingTransparencyNotice,
  withProductionPanelPricingNotice,
} from "../../../pricing/materialPricingTransparency";
import type { ConstructorSnapshot } from "../adapters/constructorPayload";
import type { FillKey, FurnitureOption, MaterialOption, MaterialToken, QuoteState } from "../types";
import type { PricingModules } from "../types";
import type { CatalogPriceBreakdown } from "../../../pricing/engine";
import type { DeliveryQuote } from "../../../pricing/delivery";
import type { AssemblyQuote } from "../../../pricing/assembly";
import type { ConstructorMaterialPricingContext } from "../../../pricing/materialPricing";
import type { PricingTransparencyNotice } from "../../../pricing/materialPricingTransparency";
import type { ProductionPanelPricingSummary } from "../../../pricing/productionPanelPricing";
import type { ProductionHardwarePricingSummary } from "../../../pricing/productionHardwarePricing";
import type { ProductionServicesPricingSummary } from "../../../pricing/productionServicesPricing";
import type { ProductionServicesPricingDecision } from "../../../pricing/productionServicesPricingDecision";
import type { ProductionHardwarePricingDecision } from "../../../pricing/productionHardwarePricingDecision";
import type { ConstructorProductionPreview } from "../adapters/productionPreviewAdapter";

interface UseConstructorQuoteArgs {
  selectedFurniture: FurnitureOption;
  width: number;
  height: number;
  depth: number;
  fill: FillKey;
  sections: number;
  compartments: number;
  shelvesCount: number;
  drawersCount: number;
  rodsCount: number;
  handleless: boolean;
  deliveryEnabled: boolean;
  deliveryAddress: string;
  assemblyEnabled: boolean;
  material: MaterialOption;
  facadeMaterial: MaterialOption;
  snapshot?: ConstructorSnapshot;
}

type QuoteBuildInput = {
  price: CatalogPriceBreakdown;
  deliveryQuote: DeliveryQuote;
  assemblyQuote: AssemblyQuote;
  pricing: PricingModules;
  materialPricingContext: ConstructorMaterialPricingContext;
  pricingNotice: PricingTransparencyNotice;
  productionPanelPricing?: ProductionPanelPricingSummary | null;
  productionHardwarePricing?: ProductionHardwarePricingSummary | null;
  productionHardwareDecision?: ProductionHardwarePricingDecision | null;
  productionServicesPricing?: ProductionServicesPricingSummary | null;
  productionServicesDecision?: ProductionServicesDecision | null;
  productionPreview?: ConstructorProductionPreview | null;
};
