import type { ProductionExportPackage } from "../constructor/production/types";
import type { HardwareItem, HardwareType } from "../constructor/geometry/types";
import { HARDWARE_SUPPLIER_CATALOG, resolveHardwareSupplierSku } from "./hardwareSupplierCatalog";
import type { HardwareSupplierCatalog, HardwareSupplierCatalogItem } from "./hardwareSupplierCatalog";

export type ProductionHardwarePricingSource =
  | "supplier-catalog-confirmed"
  | "supplier-catalog-foundation"
  | "fixed-mvp-rate"
  | "zero-nonpriced-connector";

export type ProductionHardwarePricingBucket = {
  key: string;
  type: HardwareType;
  vendor: string;
  name: string;
  count: number;
  unitPrice: number;
  priceSource: ProductionHardwarePricingSource;
  estimatedCost: number;
  supplierSku?: string;
  supplierName?: string;
  supplierStatus?: HardwareSupplierCatalogItem["status"];
  requiresPriceConfirmation: boolean;
  matchReason?: string;
};

export type ProductionHardwarePricingSummary = {
  schema: "razmerno.production-hardware-pricing.v1";
  hardwareCount: number;
  pricedHardwareCount: number;
  buckets: ProductionHardwarePricingBucket[];
  hardwareEstimate: number;
  supplierMatchedHardwareCount: number;
  supplierConfirmedHardwareCount: number;
  requiresPriceConfirmationCount: number;
  catalogHardwarePrice: number | null;
  deltaToCatalogHardware: number | null;
  warnings: string[];
};

const HARDWARE_FALLBACK_RATES: Record<HardwareType, number> = {
  hinge: Math.round(380 * 1.3),
  "drawer-slide": Math.round(1450 * 1.3),
  handle: Math.round(450 * 1.3),
  "push-to-open": Math.round(520 * 1.3),
  rod: Math.round(1400 * 1.3),
  "rod-holder": Math.round(120 * 1.3),
  "shelf-support": Math.round(25 * 1.3),
  confirmat: Math.round(8 * 1.3),
  eccentric: Math.round(38 * 1.3),
  screw: Math.round(4 * 1.3),
  leg: Math.round(80 * 1.3),
};

const ZERO_NONPRICED_TYPES = new Set<HardwareType>();

function roundMoney(value: number): number {
  return Math.round(value);
}

function makeBucketKey(item: HardwareItem): string {
  return `${item.type}:${item.vendor}:${item.name}`;
}

function getHardwareUnitPrice(item: HardwareItem, catalog: HardwareSupplierCatalog = HARDWARE_SUPPLIER_CATALOG): {
  unitPrice: number;
  source: ProductionHardwarePricingSource;
  supplierItem: HardwareSupplierCatalogItem | null;
  requiresPriceConfirmation: boolean;
  matchReason?: string;
} {
  if (ZERO_NONPRICED_TYPES.has(item.type)) {
    return {
      unitPrice: 0,
      source: "zero-nonpriced-connector",
      supplierItem: null,
      requiresPriceConfirmation: false,
    };
  }

  const resolution = resolveHardwareSupplierSku(item, catalog);
  if (resolution.status === "matched" && resolution.item) {
    return {
      unitPrice: resolution.item.unitPrice,
      source: resolution.item.status === "confirmed" ? "supplier-catalog-confirmed" : "supplier-catalog-foundation",
      supplierItem: resolution.item,
      requiresPriceConfirmation: resolution.item.requiresPriceConfirmation,
      matchReason: resolution.reason,
    };
  }

  return {
    unitPrice: HARDWARE_FALLBACK_RATES[item.type] ?? 0,
    source: "fixed-mvp-rate",
    supplierItem: null,
    requiresPriceConfirmation: true,
    matchReason: resolution.reason,
  };
}

export function summarizeProductionHardwarePricing(input: {
  productionExport: ProductionExportPackage;
  catalogHardwarePrice?: number | null;
  supplierCatalog?: HardwareSupplierCatalog;
}): ProductionHardwarePricingSummary {
  const hardware = input.productionExport.productionModel.hardware;
  const supplierCatalog = input.supplierCatalog ?? HARDWARE_SUPPLIER_CATALOG;
  const bucketMap = new Map<string, {
    type: HardwareType;
    vendor: string;
    name: string;
    count: number;
    unitPrice: number;
    source: ProductionHardwarePricingSource;
    supplierItem: HardwareSupplierCatalogItem | null;
    requiresPriceConfirmation: boolean;
    matchReason?: string;
  }>();

  const warnings = new Set<string>();

  for (const item of hardware) {
    const price = getHardwareUnitPrice(item, supplierCatalog);
    const key = makeBucketKey(item);
    const existing = bucketMap.get(key) ?? {
      type: item.type,
      vendor: item.vendor,
      name: item.name,
      count: 0,
      unitPrice: price.unitPrice,
      source: price.source,
      supplierItem: price.supplierItem,
      requiresPriceConfirmation: price.requiresPriceConfirmation,
      matchReason: price.matchReason,
    };
    existing.count += 1;
    bucketMap.set(key, existing);

    if (price.source === "fixed-mvp-rate") {
      warnings.add(`${item.name}: debug-оценка по фиксированной MVP-ставке, не точный прайс поставщика.`);
    }
    if (price.source === "supplier-catalog-foundation") {
      warnings.add(`${item.name}: сопоставлено с foundation SKU ${price.supplierItem?.sku}, цена требует подтверждения по прайсу поставщика.`);
    }
  }

  const buckets = [...bucketMap.entries()]
    .map(([key, bucket]) => ({
      key,
      type: bucket.type,
      vendor: bucket.vendor,
      name: bucket.name,
      count: bucket.count,
      unitPrice: bucket.unitPrice,
      priceSource: bucket.source,
      estimatedCost: roundMoney(bucket.count * bucket.unitPrice),
      supplierSku: bucket.supplierItem?.sku,
      supplierName: bucket.supplierItem?.name,
      supplierStatus: bucket.supplierItem?.status,
      requiresPriceConfirmation: bucket.requiresPriceConfirmation,
      matchReason: bucket.matchReason,
    } satisfies ProductionHardwarePricingBucket))
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));

  const hardwareEstimate = buckets.reduce((sum, bucket) => sum + bucket.estimatedCost, 0);
  const catalogHardwarePrice = input.catalogHardwarePrice ?? null;
  const supplierMatchedHardwareCount = hardware.filter((item) => getHardwareUnitPrice(item, supplierCatalog).supplierItem !== null).length;
  const supplierConfirmedHardwareCount = hardware.filter((item) => getHardwareUnitPrice(item, supplierCatalog).supplierItem?.status === "confirmed").length;
  const requiresPriceConfirmationCount = hardware.filter((item) => getHardwareUnitPrice(item, supplierCatalog).requiresPriceConfirmation).length;

  return {
    schema: "razmerno.production-hardware-pricing.v1",
    hardwareCount: hardware.length,
    pricedHardwareCount: hardware.filter((item) => getHardwareUnitPrice(item, supplierCatalog).unitPrice > 0).length,
    buckets,
    hardwareEstimate,
    supplierMatchedHardwareCount,
    supplierConfirmedHardwareCount,
    requiresPriceConfirmationCount,
    catalogHardwarePrice,
    deltaToCatalogHardware: catalogHardwarePrice === null
      ? null
      : roundMoney(hardwareEstimate - catalogHardwarePrice),
    warnings: [...warnings].sort(),
  };
}
