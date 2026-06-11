import { findBestPriceItem, type PriceCatalogQuery } from "./catalog";
import type { ProductionExportPackage } from "../constructor/production/types";
import type { CatalogPriceBreakdown } from "./engine";
import type { MaterialType, Panel, PanelRole } from "../constructor/geometry/types";
import { getMaterialById } from "../shared/materials/materialCatalog";
import type { MaterialCatalogItem } from "../shared/materials/materialTypes";

export type ProductionPanelPricingSource =
  | "exact-material"
  | "producer-thickness"
  | "thickness-fallback"
  | "fixed-hdf"
  | "unknown-material";

export type ProductionPanelPricingBucket = {
  key: string;
  materialId: string;
  materialType: MaterialType;
  materialName: string;
  thicknessMm: number;
  roles: PanelRole[];
  panelCount: number;
  areaM2: number;
  priceM2: number;
  priceSource: ProductionPanelPricingSource;
  matchedItemName: string | null;
  estimatedCost: number;
};

export type ProductionPanelPricingSummary = {
  schema: "razmerno.production-panel-pricing.v1";
  bodyAreaM2: number;
  facadeAreaM2: number;
  backPanelAreaM2: number;
  totalAreaM2: number;
  panelCount: number;
  buckets: ProductionPanelPricingBucket[];
  bodyEstimate: number;
  facadeEstimate: number;
  backPanelEstimate: number;
  materialsEstimate: number;
  edgeBandingLengthM: number;
  edgeBandingEstimate: number;
  estimatedMaterialsWithEdge: number;
  catalogMaterialsPrice: number | null;
  deltaToCatalogMaterials: number | null;
  warnings: string[];
};

const HDF_FALLBACK_PRICE_M2 = 650 * 1.3;
const EDGE_SERVICE_FALLBACK_M = 190 * 1.3;
const EDGE_MATERIAL_FALLBACK_M = 140;

function roundMoney(value: number): number {
  return Math.round(value);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function uniqueSorted<T extends string>(values: T[]): T[] {
  return [...new Set(values)].sort();
}

function getPanelAreaM2(panel: Panel): number {
  return Math.max(0, panel.widthMm) * Math.max(0, panel.heightMm) / 1_000_000;
}

function getArticleFromMaterial(material: MaterialCatalogItem): string {
  return material.code.trim().split(/\s+/)[0] ?? material.code.trim();
}

function findBoardPriceForPanel(input: {
  materialId: string;
  materialType: MaterialType;
  thicknessMm: number;
}): {
  priceM2: number;
  source: ProductionPanelPricingSource;
  matchedItemName: string | null;
  materialName: string;
} {
  const material = getMaterialById(input.materialId);

  if (input.materialType === "hdf") {
    return {
      priceM2: HDF_FALLBACK_PRICE_M2,
      source: "fixed-hdf",
      matchedItemName: "ХДФ 3 мм · fixed MVP rate",
      materialName: material?.displayName ?? input.materialId,
    };
  }

  if (!material) {
    const fallback = findBestPriceItem({ itemType: "board", thicknessMm: input.thicknessMm });
    return {
      priceM2: fallback?.retailPrice ?? 0,
      source: "unknown-material",
      matchedItemName: fallback?.name ?? null,
      materialName: input.materialId,
    };
  }

  const exactQuery: PriceCatalogQuery = {
    itemType: "board",
    producer: material.brand,
    article: getArticleFromMaterial(material),
    thicknessMm: input.thicknessMm,
  };
  const exactItem = findBestPriceItem(exactQuery);
  if (exactItem) {
    return {
      priceM2: exactItem.retailPrice,
      source: "exact-material",
      matchedItemName: exactItem.name,
      materialName: material.displayName,
    };
  }

  const producerThicknessItem = findBestPriceItem({
    itemType: "board",
    producer: material.brand,
    thicknessMm: input.thicknessMm,
  });
  if (producerThicknessItem) {
    return {
      priceM2: producerThicknessItem.retailPrice,
      source: "producer-thickness",
      matchedItemName: producerThicknessItem.name,
      materialName: material.displayName,
    };
  }

  const thicknessFallback = findBestPriceItem({ itemType: "board", thicknessMm: input.thicknessMm });
  return {
    priceM2: thicknessFallback?.retailPrice ?? 0,
    source: "thickness-fallback",
    matchedItemName: thicknessFallback?.name ?? null,
    materialName: material.displayName,
  };
}

function isFacadePanel(role: PanelRole): boolean {
  return role === "facade-door" || role === "drawer-front";
}

function isBackPanel(role: PanelRole): boolean {
  return role === "back-panel" || role === "drawer-bottom";
}

function makeBucketKey(panel: Panel): string {
  return `${panel.materialType}:${panel.materialId}:${panel.thicknessMm}`;
}

function estimateEdgeBanding(input: ProductionExportPackage): {
  edgeBandingLengthM: number;
  edgeBandingEstimate: number;
} {
  const edgeBandingLengthM = round2(
    input.productionModel.edgeBanding.reduce((sum, edge) => sum + Math.max(0, edge.lengthMm), 0) / 1000,
  );
  const firstBodyMaterial = getMaterialById(input.project.material.bodyMaterialId);
  const edgeMaterialItem = findBestPriceItem({
    itemType: "edge",
    producer: firstBodyMaterial?.brand,
    thicknessMm: 0.8,
  }) ?? findBestPriceItem({ itemType: "edge", thicknessMm: 1 });
  const edgeServiceItem = findBestPriceItem({
    itemType: "service",
    nameIncludes: "Поклейка кромки",
  });

  const edgePriceM = (edgeMaterialItem?.retailPrice ?? EDGE_MATERIAL_FALLBACK_M) +
    (edgeServiceItem?.retailPrice ?? EDGE_SERVICE_FALLBACK_M);

  return {
    edgeBandingLengthM,
    edgeBandingEstimate: roundMoney(edgeBandingLengthM * edgePriceM),
  };
}

export function summarizeProductionPanelPricing(input: {
  productionExport: ProductionExportPackage;
  catalogMaterialsPrice?: number | null;
}): ProductionPanelPricingSummary {
  const panels = input.productionExport.productionModel.panels;
  const bucketMap = new Map<string, {
    materialId: string;
    materialType: MaterialType;
    thicknessMm: number;
    roles: PanelRole[];
    panelCount: number;
    areaM2: number;
  }>();

  let bodyAreaM2 = 0;
  let facadeAreaM2 = 0;
  let backPanelAreaM2 = 0;
  let bodyEstimateRaw = 0;
  let facadeEstimateRaw = 0;
  let backPanelEstimateRaw = 0;

  for (const panel of panels) {
    const areaM2 = getPanelAreaM2(panel);
    const panelPrice = findBoardPriceForPanel({
      materialId: panel.materialId,
      materialType: panel.materialType,
      thicknessMm: panel.thicknessMm,
    });
    const panelEstimate = areaM2 * panelPrice.priceM2;

    if (isFacadePanel(panel.role)) {
      facadeAreaM2 += areaM2;
      facadeEstimateRaw += panelEstimate;
    } else if (isBackPanel(panel.role)) {
      backPanelAreaM2 += areaM2;
      backPanelEstimateRaw += panelEstimate;
    } else {
      bodyAreaM2 += areaM2;
      bodyEstimateRaw += panelEstimate;
    }

    const key = makeBucketKey(panel);
    const existing = bucketMap.get(key) ?? {
      materialId: panel.materialId,
      materialType: panel.materialType,
      thicknessMm: panel.thicknessMm,
      roles: [],
      panelCount: 0,
      areaM2: 0,
    };
    existing.roles.push(panel.role);
    existing.panelCount += 1;
    existing.areaM2 += areaM2;
    bucketMap.set(key, existing);
  }

  const warnings: string[] = [];
  const buckets = [...bucketMap.entries()].map(([key, bucket]) => {
    const price = findBoardPriceForPanel({
      materialId: bucket.materialId,
      materialType: bucket.materialType,
      thicknessMm: bucket.thicknessMm,
    });

    if (price.source !== "exact-material" && price.source !== "fixed-hdf") {
      warnings.push(
        `${price.materialName}: цена панели рассчитана по ${price.matchedItemName ?? "fallback"}`,
      );
    }

    return {
      key,
      materialId: bucket.materialId,
      materialType: bucket.materialType,
      materialName: price.materialName,
      thicknessMm: bucket.thicknessMm,
      roles: uniqueSorted(bucket.roles),
      panelCount: bucket.panelCount,
      areaM2: round2(bucket.areaM2),
      priceM2: price.priceM2,
      priceSource: price.source,
      matchedItemName: price.matchedItemName,
      estimatedCost: roundMoney(bucket.areaM2 * price.priceM2),
    } satisfies ProductionPanelPricingBucket;
  });

  const bodyEstimate = roundMoney(bodyEstimateRaw);
  const facadeEstimate = roundMoney(facadeEstimateRaw);
  const backPanelEstimate = roundMoney(backPanelEstimateRaw);
  const materialsEstimate = bodyEstimate + facadeEstimate + backPanelEstimate;
  const edge = estimateEdgeBanding(input.productionExport);
  const catalogMaterialsPrice = input.catalogMaterialsPrice ?? null;
  const estimatedMaterialsWithEdge = materialsEstimate + edge.edgeBandingEstimate;

  return {
    schema: "razmerno.production-panel-pricing.v1",
    bodyAreaM2: round2(bodyAreaM2),
    facadeAreaM2: round2(facadeAreaM2),
    backPanelAreaM2: round2(backPanelAreaM2),
    totalAreaM2: round2(bodyAreaM2 + facadeAreaM2 + backPanelAreaM2),
    panelCount: panels.length,
    buckets,
    bodyEstimate,
    facadeEstimate,
    backPanelEstimate,
    materialsEstimate,
    edgeBandingLengthM: edge.edgeBandingLengthM,
    edgeBandingEstimate: edge.edgeBandingEstimate,
    estimatedMaterialsWithEdge,
    catalogMaterialsPrice,
    deltaToCatalogMaterials: catalogMaterialsPrice === null
      ? null
      : roundMoney(estimatedMaterialsWithEdge - catalogMaterialsPrice),
    warnings,
  };
}


export type ProductionPanelPriceApplication = {
  price: CatalogPriceBreakdown;
  applied: boolean;
  warnings: string[];
};

function getProductionBufferRate(price: CatalogPriceBreakdown): number {
  const subtotalBeforeProduction = Math.max(0, price.total - price.production - price.delivery);
  if (subtotalBeforeProduction <= 0) return 0.08;
  return price.production / subtotalBeforeProduction;
}

export function applyProductionPanelPricingToCatalogPrice(input: {
  catalogPrice: CatalogPriceBreakdown;
  panelPricing: ProductionPanelPricingSummary;
}): ProductionPanelPriceApplication {
  const { catalogPrice, panelPricing } = input;
  const body = roundMoney(panelPricing.bodyEstimate);
  const facades = roundMoney(panelPricing.facadeEstimate);
  const edgeBanding = roundMoney(panelPricing.edgeBandingEstimate);
  const materials = roundMoney(
    panelPricing.bodyEstimate +
    panelPricing.facadeEstimate +
    panelPricing.backPanelEstimate +
    panelPricing.edgeBandingEstimate,
  );

  const productionRate = getProductionBufferRate(catalogPrice);
  const subtotal = materials + catalogPrice.filling + catalogPrice.hardware + catalogPrice.services;
  const production = roundMoney(subtotal * productionRate);
  const total = subtotal + production + catalogPrice.delivery;

  return {
    applied: true,
    warnings: panelPricing.warnings,
    price: {
      ...catalogPrice,
      body,
      facades,
      edgeBanding,
      materials,
      production,
      total,
      source: "production-panels",
      debug: {
        ...catalogPrice.debug,
        bodyAreaM2: panelPricing.bodyAreaM2,
        facadeAreaM2: panelPricing.facadeAreaM2,
        backAreaM2: panelPricing.backPanelAreaM2,
        edgeLengthM: panelPricing.edgeBandingLengthM,
        panelBodyAreaM2: panelPricing.bodyAreaM2,
        panelFacadeAreaM2: panelPricing.facadeAreaM2,
        panelBackAreaM2: panelPricing.backPanelAreaM2,
        panelEdgeLengthM: panelPricing.edgeBandingLengthM,
        panelPricingDelta: panelPricing.deltaToCatalogMaterials ?? undefined,
      },
    },
  };
}
