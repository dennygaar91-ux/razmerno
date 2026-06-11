import type { ProductionPanelPricingSummary } from "../../../pricing/productionPanelPricing";
import type { ProductionHardwarePricingSummary } from "../../../pricing/productionHardwarePricing";
import type { ProductionServicesPricingSummary } from "../../../pricing/productionServicesPricing";
import type { ProductionServicesPricingDecision } from "../../../pricing/productionServicesPricingDecision";
import type { ProductionHardwarePricingDecision } from "../../../pricing/productionHardwarePricingDecision";
import type { ConstructorProductionSnapshotState } from "../types";
import type { ConstructorProductionPreview } from "./productionPreviewAdapter";

export type ConstructorProductionSnapshotReadyInput = Omit<
  ConstructorProductionSnapshotState,
  "status" | "updatedAt" | "error" | "panelPricing" | "hardwarePricing" | "hardwareDecision" | "servicesPricing" | "servicesDecision"
> & Pick<Partial<ConstructorProductionSnapshotState>, "panelPricing" | "hardwarePricing" | "hardwareDecision" | "servicesPricing" | "servicesDecision">;

export function buildProductionSnapshotReadyState(input: {
  preview: ConstructorProductionPreview;
  panelPricing?: ProductionPanelPricingSummary | null;
  hardwarePricing?: ProductionHardwarePricingSummary | null;
  hardwareDecision?: ProductionHardwarePricingDecision | null;
  servicesPricing?: ProductionServicesPricingSummary | null;
  servicesDecision?: ProductionServicesPricingDecision | null;
}): ConstructorProductionSnapshotReadyInput {
  return {
    validationStatus: input.preview.status,
    requiresTechnologistCheck: input.preview.requiresTechnologistCheck,
    summary: input.preview.summary,
    project: {
      ...input.preview.project,
      productType: input.preview.project.productType ?? "wardrobe",
    },
    panelPricing: input.panelPricing ?? null,
    hardwarePricing: input.hardwarePricing ?? null,
    hardwareDecision: input.hardwareDecision ?? null,
    servicesPricing: input.servicesPricing ?? null,
    servicesDecision: input.servicesDecision ?? null,
  };
}
