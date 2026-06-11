import type { FurnitureType } from "../../shared/lib/pricing-core";
import type { MaterialKind } from "../../shared/materials/materialTypes";
import type { MaterialToken } from "../../shared/materials/materialCatalog";
import type { ProductionPanelPricingSummary } from "../../pricing/productionPanelPricing";
import type { ProductionHardwarePricingSummary } from "../../pricing/productionHardwarePricing";
import type { ProductionServicesPricingSummary } from "../../pricing/productionServicesPricing";
import type { ProductionServicesPricingDecision } from "../../pricing/productionServicesPricingDecision";
import type { ProductionHardwarePricingDecision } from "../../pricing/productionHardwarePricingDecision";
import type { ConstructorProductionPreview } from "./adapters/productionPreviewAdapter";

export type StepKey = "sizes" | "fill" | "materials" | "checkout";
export type FurnitureKey = "wardrobe" | "nightstand" | "dresser";
export type FillKey = "shelves" | "drawers" | "rod";
export type ConstructorFacadeMode = "open" | "hinged";
export type ConstructorSceneRenderMode = "three" | "svg";
export type ConstructorSceneViewMode = "free" | "front" | "side" | "top";
export type ConstructorSceneSelection = {
  sectionId: string | null;
  compartmentId: string | null;
};
export type ConstructorZoneId = string;
export type ConstructorSectionId = string;
export type ConstructorSectionFacadeLayout = Record<
  string,
  ConstructorFacadeMode
>;
export type ConstructorZoneFacadeMode = "inherit" | "open";
export type ConstructorZoneFacadeLayout = Record<
  string,
  Record<string, ConstructorZoneFacadeMode>
>;

export type ConstructorZoneElementKind = "shelf" | "drawers" | "rod";

export type ConstructorZoneElement = {
  id: string;
  kind: ConstructorZoneElementKind;
  label: string;
  sectionId: string;
  compartmentId?: string;
  heightMm?: number;
  count?: number;
};
export type { MaterialToken };

export type FurnitureOption = {
  key: FurnitureKey;
  label: string;
  productType: FurnitureType;
};

export type MaterialOption = {
  token: string;
  label: string;
  name: string;
  dotClass: string;
  materialId: string;
  kind: MaterialKind;
  brand: string;
  code: string;
  displayName: string;
  thicknessMm: number;
  textureUrl: string;
  fallbackHex: string;
};

export type ContactState = {
  name: string;
  phone: string;
  email: string;
  company: string;
};

export type ConstructorCompartment = {
  id: string;
  heightMm: number;
};

export type ConstructorCompartmentLayout = Record<
  string,
  ConstructorCompartment[]
>;

export type ConstructorCompartmentFilling = {
  shelvesCount: number;
  drawersCount: number;
  rodsCount: number;
};

export type ConstructorFillingLayout = Record<
  string,
  Record<string, ConstructorCompartmentFilling>
>;

export type ConstructorSection = {
  id: string;
  widthMm: number;
};

export type ConstructorDraft = {
  dimensions: [number, number, number];
  furnitureType: string;
  material: string;
  materialId?: MaterialToken;
  facadeMaterialId?: MaterialToken;
  sections: number;
  compartments?: number;
  sectionLayout?: ConstructorSection[];
  compartmentLayout?: ConstructorCompartmentLayout;
  fillingLayout?: ConstructorFillingLayout;
  facadeLayout?: ConstructorSectionFacadeLayout;
  zoneFacadeLayout?: ConstructorZoneFacadeLayout;
  filling: FillKey;
};

export type ConstructorFormErrors = Record<string, string | undefined>;

export type ConstructorStepId = "sizes" | "fill" | "materials" | "checkout";
export type ConstructorStepStatus =
  | "default"
  | "active"
  | "done"
  | "warning"
  | "error";
export type ConstructorValidationSeverity = "warning" | "error";
export type ConstructorValidationTargetType =
  | "project"
  | "dimensions"
  | "sections"
  | "section"
  | "compartments"
  | "compartment"
  | "material"
  | "facade";

export type ConstructorValidationIssue = {
  id: string;
  severity: ConstructorValidationSeverity;
  stepId: ConstructorStepId;
  targetType: ConstructorValidationTargetType;
  targetId?: string;
  title: string;
  message: string;
  fixHint: string;
  blocksCheckout: boolean;
};

export type ConstructorValidationState = {
  status: "valid" | "warning" | "error";
  issues: ConstructorValidationIssue[];
  stepStatuses: Record<ConstructorStepId, ConstructorStepStatus>;
};

export type ProjectMaterials = {
  bodyMaterialId: MaterialToken;
  facadeMaterialKind: Exclude<MaterialKind, "hdf">;
  facadeMaterialId: MaterialToken;
  backPanelMaterialId: MaterialToken;
};

export type ConstructorFurnitureDefaults = {
  furniture: FurnitureKey;
  width: number;
  height: number;
  depth: number;
  sections: number;
  compartments: number;
  fill: FillKey;
  shelvesCount: number;
  drawersCount: number;
  rodsCount: number;
};

export type ConstructorProductionSnapshotState = {
  status: "idle" | "loading" | "ready" | "error";
  validationStatus: "ready-for-review" | "blocked" | "valid" | null;
  updatedAt: string | null;
  error: string;
  requiresTechnologistCheck: boolean;
  summary: {
    panels: number;
    hardware: number;
    drilling: number;
    edgeBandingLengthMm: number;
    basisSteps: number;
    warnings: number;
    errors: number;
  } | null;
  project: {
    productType: string;
    dimensions: { width: number; height: number; depth: number };
    sections: number;
    materialId: string;
    facadeStyleId: string;
  } | null;
  panelPricing: ProductionPanelPricingSummary | null;
  hardwarePricing: ProductionHardwarePricingSummary | null;
  hardwareDecision: ProductionHardwarePricingDecision | null;
  servicesPricing: ProductionServicesPricingSummary | null;
  servicesDecision: ProductionServicesPricingDecision | null;
};

export type QuoteState = {
  total: number;
  materials: number;
  hardwareAndFilling: number;
  services: number;
  extra: number;
  message: string;
  price: import("../../pricing/engine").CatalogPriceBreakdown;
  deliveryQuote: import("../../pricing/delivery").DeliveryQuote;
  assemblyQuote: import("../../pricing/assembly").AssemblyQuote;
  formatPrice: (value: number) => string;
  materialPricingContext?: import("../../pricing/materialPricing").ConstructorMaterialPricingContext;
  pricingNotice?: import("../../pricing/materialPricingTransparency").PricingTransparencyNotice;
  productionPanelPricing?: ProductionPanelPricingSummary | null;
  productionHardwarePricing?: ProductionHardwarePricingSummary | null;
  productionHardwareDecision?: ProductionHardwarePricingDecision | null;
  productionServicesPricing?: ProductionServicesPricingSummary | null;
  productionServicesDecision?: ProductionServicesPricingDecision | null;
  productionPreview?: ConstructorProductionPreview | null;
  pricingMode?: "catalog" | "production-panels";
};

export type PricingModules = {
  calculatePrice: typeof import("../../shared/lib/price").calculatePrice;
  formatPrice: typeof import("../../shared/lib/price").formatPrice;
  calculateDeliveryQuote: typeof import("../../pricing/delivery").calculateDeliveryQuote;
  validateDelivery: typeof import("../../pricing/delivery").validateDelivery;
  calculateAssemblyQuote: typeof import("../../pricing/assembly").calculateAssemblyQuote;
};
