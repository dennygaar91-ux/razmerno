import { useEffect, useMemo, useState } from "react";
import { loadPricingModules } from "../pricingLoader";
import facadeStyles from "../../../config/facade-styles.json";
import hardwareItems from "../../../config/hardware.json";
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

type FacadeStyleConfig = {
  id: string;
  priceMultiplier: number;
};

type HardwareConfig = {
  id: string;
  basePrice: number;
  priceFactor: number;
};

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
  productionServicesDecision?: ProductionServicesPricingDecision | null;
  productionPreview?: ConstructorProductionPreview | null;
};

function getFacadeStyleConfig(handleless: boolean): FacadeStyleConfig {
  const id = handleless ? "no-handle" : "regular";
  const style = (facadeStyles as FacadeStyleConfig[]).find((entry) => entry.id === id);
  return style ?? { id, priceMultiplier: handleless ? 1.15 : 1 };
}

function getHardwareConfig(handleless: boolean): HardwareConfig {
  const id = handleless ? "comfort" : "base";
  const hardware = (hardwareItems as HardwareConfig[]).find((entry) => entry.id === id);
  return hardware ?? { id, basePrice: handleless ? 6200 : 3800, priceFactor: handleless ? 260 : 180 };
}

function buildQuoteState({
  price,
  deliveryQuote,
  assemblyQuote,
  pricing,
  materialPricingContext,
  pricingNotice,
  productionPanelPricing = null,
  productionHardwarePricing = null,
  productionServicesPricing = null,
  productionServicesDecision = null,
  productionPreview = null,
}: QuoteBuildInput): QuoteState {
  return {
    total: price.total + deliveryQuote.price + assemblyQuote.price,
    materials: price.materials,
    hardwareAndFilling: price.hardware + price.filling,
    services: price.services + price.production + price.edgeBanding,
    extra: deliveryQuote.price + assemblyQuote.price,
    message: [
      deliveryQuote.enabled ? deliveryQuote.message : "",
      assemblyQuote.enabled ? assemblyQuote.message : "",
    ].filter(Boolean).join(" · ") || "Доставка и сборка добавятся отдельно, если вы включите их ниже.",
    price,
    deliveryQuote,
    assemblyQuote,
    formatPrice: pricing.formatPrice,
    materialPricingContext,
    pricingNotice,
    productionPanelPricing,
    productionHardwarePricing,
    productionServicesPricing,
    productionServicesDecision,
    productionPreview,
    pricingMode: price.source === "production-panels" ? "production-panels" : "catalog",
  };
}

export function useConstructorQuote({
  selectedFurniture,
  width,
  height,
  depth,
  fill,
  sections,
  compartments,
  shelvesCount,
  drawersCount,
  rodsCount,
  handleless,
  deliveryEnabled,
  deliveryAddress,
  assemblyEnabled,
  material,
  facadeMaterial,
  snapshot,
}: UseConstructorQuoteArgs) {
  const [quote, setQuote] = useState<QuoteState | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [quoteStatus, setQuoteStatus] = useState<"idle" | "calculating" | "ready" | "error">("idle");

  const filling = useMemo(() => {
    const hasExplicitCounts = shelvesCount > 0 || drawersCount > 0 || rodsCount > 0;
    if (hasExplicitCounts) {
      return {
        shelves: Math.max(0, shelvesCount),
        drawers: Math.max(0, drawersCount),
        hangingRod: rodsCount > 0,
      };
    }

    return {
      shelves: fill === "shelves" ? Math.max(0, sections * Math.max(1, compartments)) : 0,
      drawers: fill === "drawers" ? Math.max(1, sections) : 0,
      hangingRod: fill === "rod",
    };
  }, [compartments, drawersCount, fill, rodsCount, sections, shelvesCount]);

  useEffect(() => {
    let cancelled = false;

    async function updateQuote() {
      setQuoteError("");
      setQuoteStatus("calculating");

      try {
        const pricing = await loadPricingModules();
        const materialPricingContext = buildConstructorMaterialPricingContext({
          bodyMaterialId: material.materialId as MaterialToken,
          facadeMaterialId: facadeMaterial.materialId as MaterialToken,
        });
        const basePricingNotice = buildPricingTransparencyNotice(materialPricingContext);
        const facadeStyle = getFacadeStyleConfig(handleless);
        const hardware = getHardwareConfig(handleless);
        const catalogPrice = pricing.calculatePrice({
          type: selectedFurniture.productType,
          dimensions: { width, height, depth },
          sections,
          filling,
          bodyProducer: materialPricingContext.body.producer as "Kronospan" | "Egger" | "Eterno",
          bodyArticle: materialPricingContext.body.article,
          bodyThicknessMm: materialPricingContext.body.thicknessMm,
          facadeProducer: materialPricingContext.facade.producer as "Kronospan" | "Egger" | "Eterno" | "AGT",
          facadeArticle: materialPricingContext.facade.article,
          facadeThicknessMm: materialPricingContext.facade.thicknessMm,
          facadeMaterialKind: materialPricingContext.facade.materialKind as "ldsp" | "mdf",
          bodyPricePerLiter: 0,
          facadePricePerLiter: 0,
          facadeStyleMultiplier: facadeStyle.priceMultiplier,
          hardwareBasePrice: hardware.basePrice,
          hardwarePriceFactor: hardware.priceFactor,
        });

        const deliveryQuote = pricing.calculateDeliveryQuote(deliveryEnabled, deliveryAddress);
        const catalogAssemblyQuote = pricing.calculateAssemblyQuote(assemblyEnabled, catalogPrice.total);
        const nextPrice = catalogPrice;
        let productionPanelPricing: ProductionPanelPricingSummary | null = null;
        let productionHardwarePricing: ProductionHardwarePricingSummary | null = null;
        let productionHardwareDecision: ProductionHardwarePricingDecision | null = null;
        let productionServicesPricing: ProductionServicesPricingSummary | null = null;
        let productionServicesDecision: ProductionServicesPricingDecision | null = null;
        let pricingNotice = basePricingNotice;

        let productionPreview: ConstructorProductionPreview | null = null;

        if (snapshot) {
          const catalogQuote = buildQuoteState({
            price: catalogPrice,
            deliveryQuote,
            assemblyQuote: catalogAssemblyQuote,
            pricing,
            materialPricingContext,
            pricingNotice: basePricingNotice,
          });
          const productionPricingModule = await import("../adapters/productionPricingPreview");
          const productionBundle = productionPricingModule.buildConstructorProductionPricingBundle({
            snapshot,
            catalogQuote,
            catalogPrice,
          });

          productionPreview = productionBundle.preview;
          productionPanelPricing = productionBundle.panelPricing;
          productionHardwarePricing = productionBundle.hardwarePricing;
          productionHardwareDecision = productionBundle.hardwareDecision;
          productionServicesPricing = productionBundle.servicesPricing;
          productionServicesDecision = productionBundle.servicesDecision;
          pricingNotice = withProductionPanelPricingNotice(
            basePricingNotice,
            productionBundle.appliedPrice.warnings,
          );
        }

        const assemblyQuote = pricing.calculateAssemblyQuote(assemblyEnabled, nextPrice.total);

        if (cancelled) return;

        setQuote(buildQuoteState({
          price: nextPrice,
          deliveryQuote,
          assemblyQuote,
          pricing,
          materialPricingContext,
          pricingNotice,
          productionPanelPricing,
          productionHardwarePricing,
          productionHardwareDecision,
          productionServicesPricing,
          productionServicesDecision,
          productionPreview,
        }));
      } catch (error) {
        if (cancelled) return;
        setQuoteStatus("error");
        setQuoteError(error instanceof Error ? error.message : "Не удалось рассчитать стоимость");
      }
    }

    const recalcTimer = window.setTimeout(() => {
      void updateQuote();
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(recalcTimer);
    };
  }, [
    selectedFurniture.productType,
    width,
    height,
    depth,
    sections,
    filling,
    handleless,
    deliveryEnabled,
    deliveryAddress,
    assemblyEnabled,
    material.materialId,
    facadeMaterial.materialId,
    snapshot,
  ]);

  return { quote, quoteError, quoteStatus, filling };
}
