import { findBestPriceItem } from "./catalog";
import { CLIENT_PRICE_MULTIPLIER } from "./pricingPolicy";
import type { ProductionExportPackage } from "../constructor/production/types";
import type { DrillingPurpose } from "../constructor/geometry/types";

export type ProductionServicesPricingSource =
  | "catalog-service"
  | "fixed-mvp-rate";

export type ProductionServicesPricingBucket = {
  key: string;
  label: string;
  quantity: number;
  unit: "m2" | "m" | "pcs";
  unitPrice: number;
  priceSource: ProductionServicesPricingSource;
  estimatedCost: number;
};

export type ProductionServicesPricingSummary = {
  schema: "razmerno.production-services-pricing.v1";
  panelAreaM2: number;
  edgeBandingLengthM: number;
  drillingCount: number;
  packagingAreaM2: number;
  cuttingEstimate: number;
  edgeServiceEstimate: number;
  drillingEstimate: number;
  packagingEstimate: number;
  servicesEstimate: number;
  productionBufferEstimate: number;
  totalServicesWithProduction: number;
  catalogServicesPrice: number | null;
  catalogProductionPrice: number | null;
  deltaToCatalogServices: number | null;
  deltaToCatalogServicesWithProduction: number | null;
  drillingByPurpose: Partial<Record<DrillingPurpose, number>>;
  buckets: ProductionServicesPricingBucket[];
  warnings: string[];
};

const EDGE_SERVICE_FALLBACK_M = 190 * CLIENT_PRICE_MULTIPLIER;
const STRETCH_PACKING_FALLBACK_M2 = 20 * CLIENT_PRICE_MULTIPLIER;
const CARTON_PACKING_FALLBACK_M2 = 120 * CLIENT_PRICE_MULTIPLIER;
const INCLUDED_IN_BOARD_PRICE = 0;
const PRODUCTION_BUFFER_RATE = 0;

function roundMoney(value: number): number {
  return Math.round(value);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function safeServicePrice(input: {
  nameIncludes: string;
  fallback: number;
}): { price: number; source: ProductionServicesPricingSource; matchedName: string | null } {
  const item = findBestPriceItem({ itemType: "service", nameIncludes: input.nameIncludes });
  if (item) {
    return {
      price: item.retailPrice,
      source: "catalog-service",
      matchedName: item.name,
    };
  }

  return {
    price: input.fallback,
    source: "fixed-mvp-rate",
    matchedName: null,
  };
}

function addBucket(input: {
  buckets: ProductionServicesPricingBucket[];
  key: string;
  label: string;
  quantity: number;
  unit: ProductionServicesPricingBucket["unit"];
  unitPrice: number;
  source: ProductionServicesPricingSource;
}) {
  input.buckets.push({
    key: input.key,
    label: input.label,
    quantity: round2(input.quantity),
    unit: input.unit,
    unitPrice: input.unitPrice,
    priceSource: input.source,
    estimatedCost: roundMoney(input.quantity * input.unitPrice),
  });
}

export function summarizeProductionServicesPricing(input: {
  productionExport: ProductionExportPackage;
  catalogServicesPrice?: number | null;
  catalogProductionPrice?: number | null;
}): ProductionServicesPricingSummary {
  const model = input.productionExport.productionModel;
  const panelAreaM2 = round2(
    model.panels.reduce((sum, panel) => {
      return sum + Math.max(0, panel.widthMm) * Math.max(0, panel.heightMm) / 1_000_000;
    }, 0),
  );
  const edgeBandingLengthM = round2(
    model.edgeBanding.reduce((sum, edge) => sum + Math.max(0, edge.lengthMm), 0) / 1000,
  );
  const drillingCount = model.drilling.length;
  const packagingAreaM2 = panelAreaM2;

  const edgeServicePrice = safeServicePrice({
    nameIncludes: "Поклейка кромки",
    fallback: EDGE_SERVICE_FALLBACK_M,
  });
  const stretchPackingPrice = safeServicePrice({
    nameIncludes: "стрейч",
    fallback: STRETCH_PACKING_FALLBACK_M2,
  });
  const cartonPackingPrice = safeServicePrice({
    nameIncludes: "гофрокартон",
    fallback: CARTON_PACKING_FALLBACK_M2,
  });

  const buckets: ProductionServicesPricingBucket[] = [];
  addBucket({
    buckets,
    key: "cutting-included",
    label: "Распил/обработка панелей · включено в ЛДСП/МДФ",
    quantity: panelAreaM2,
    unit: "m2",
    unitPrice: INCLUDED_IN_BOARD_PRICE,
    source: "catalog-service",
  });
  addBucket({
    buckets,
    key: "edge-service",
    label: "Поклейка кромки",
    quantity: edgeBandingLengthM,
    unit: "m",
    unitPrice: edgeServicePrice.price,
    source: edgeServicePrice.source,
  });
  addBucket({
    buckets,
    key: "drilling-included",
    label: "Присадка/отверстия · включено в ЛДСП/МДФ",
    quantity: drillingCount,
    unit: "pcs",
    unitPrice: INCLUDED_IN_BOARD_PRICE,
    source: "catalog-service",
  });
  addBucket({
    buckets,
    key: "packing-stretch",
    label: "Упаковка в стрейч",
    quantity: packagingAreaM2,
    unit: "m2",
    unitPrice: stretchPackingPrice.price,
    source: stretchPackingPrice.source,
  });
  addBucket({
    buckets,
    key: "packing-carton",
    label: "Упаковка в гофрокартон",
    quantity: packagingAreaM2,
    unit: "m2",
    unitPrice: cartonPackingPrice.price,
    source: cartonPackingPrice.source,
  });

  const bucketCost = (key: string) => buckets.find((bucket) => bucket.key === key)?.estimatedCost ?? 0;
  const cuttingEstimate = bucketCost("cutting-included");
  const edgeServiceEstimate = bucketCost("edge-service");
  const drillingEstimate = bucketCost("drilling-included");
  const packagingEstimate = bucketCost("packing-stretch") + bucketCost("packing-carton");
  const servicesEstimate = cuttingEstimate + edgeServiceEstimate + drillingEstimate + packagingEstimate;
  const productionBufferEstimate = roundMoney(servicesEstimate * PRODUCTION_BUFFER_RATE);
  const totalServicesWithProduction = servicesEstimate + productionBufferEstimate;
  const catalogServicesPrice = input.catalogServicesPrice ?? null;
  const catalogProductionPrice = input.catalogProductionPrice ?? null;

  const drillingByPurpose = model.drilling.reduce<Partial<Record<DrillingPurpose, number>>>((acc, operation) => {
    acc[operation.purpose] = (acc[operation.purpose] ?? 0) + 1;
    return acc;
  }, {});

  const warnings = [
    "Debug-only оценка услуг по production model: live price на этом этапе не изменяется.",
    "Распил и присадка не добавляются отдельными строками: они включены в цену ЛДСП/МДФ за 1 кв.м.",
    "Упаковка считается от площади панелей, не от фактических габаритов пачек.",
  ];

  return {
    schema: "razmerno.production-services-pricing.v1",
    panelAreaM2,
    edgeBandingLengthM,
    drillingCount,
    packagingAreaM2,
    cuttingEstimate,
    edgeServiceEstimate,
    drillingEstimate,
    packagingEstimate,
    servicesEstimate,
    productionBufferEstimate,
    totalServicesWithProduction,
    catalogServicesPrice,
    catalogProductionPrice,
    deltaToCatalogServices: catalogServicesPrice === null
      ? null
      : roundMoney(servicesEstimate - catalogServicesPrice),
    deltaToCatalogServicesWithProduction: catalogServicesPrice === null || catalogProductionPrice === null
      ? null
      : roundMoney(totalServicesWithProduction - (catalogServicesPrice + catalogProductionPrice)),
    drillingByPurpose,
    buckets,
    warnings,
  };
}
