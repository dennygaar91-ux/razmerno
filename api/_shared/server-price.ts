import facadeStyles from '../../src/config/facade-styles.json';
import hardwareItems from '../../src/config/hardware.json';
import { calculateCatalogPrice, type CatalogPriceBreakdown, type CatalogPriceInput } from '../../src/pricing/engine.js';
import { buildConstructorMaterialPricingContext } from '../../src/pricing/materialPricing.js';
import {
  applyProductionPanelPricingToCatalogPrice,
  summarizeProductionPanelPricing,
  type ProductionPanelPriceApplication,
} from '../../src/pricing/productionPanelPricing.js';
import type { ProductionExportPackage } from '../../src/constructor/production/types.js';
import { legacyMaterialAliases, materialCatalog, type MaterialToken } from '../../src/shared/materials/materialCatalog.js';
import { calculateDeliveryQuote } from '../../src/pricing/delivery.js';
import { calculateAssemblyQuote } from '../../src/pricing/assembly.js';
import type { OrderRequest } from './order-types.js';

type FacadeStyle = {
  id: string;
  priceMultiplier: number;
};

type Hardware = {
  id: string;
  basePrice: number;
  priceFactor: number;
};

const materialFallbackId = 'ldsp-egger-w960-belyy-klassicheskiy-sm' satisfies MaterialToken;
const bodyProducers = ['Kronospan', 'Egger', 'Eterno'] as const;
const facadeProducers = ['Kronospan', 'Egger', 'Eterno', 'AGT'] as const;

function findById<T extends { id: string }>(items: T[], id: string | undefined, label: string): T {
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error(`${label} not found: ${id ?? 'empty'}`);
  return item;
}

function isKnownMaterialToken(value: string | undefined): value is MaterialToken {
  if (!value) return false;
  return value in legacyMaterialAliases || materialCatalog.some((material) => material.id === value);
}

function toBodyProducer(value: string | undefined): CatalogPriceInput['bodyProducer'] | undefined {
  return bodyProducers.find((producer) => producer === value);
}

function toFacadeProducer(value: string | undefined): CatalogPriceInput['facadeProducer'] | undefined {
  return facadeProducers.find((producer) => producer === value);
}

function materialPricingOverrides(body: OrderRequest): Partial<CatalogPriceInput> {
  const selected = body.materials;
  if (!selected) return {};

  const overrides: Partial<CatalogPriceInput> = {};

  if (isKnownMaterialToken(selected.bodyId)) {
    try {
      const context = buildConstructorMaterialPricingContext({
        bodyMaterialId: selected.bodyId,
        facadeMaterialId: materialFallbackId,
      });
      overrides.bodyProducer = toBodyProducer(context.body.producer);
      overrides.bodyArticle = context.body.article;
      overrides.bodyThicknessMm = context.body.thicknessMm;
    } catch {
      // Keep the historical catalog fallback for unsupported body material payloads.
    }
  }

  if (isKnownMaterialToken(selected.facadeId)) {
    try {
      const context = buildConstructorMaterialPricingContext({
        bodyMaterialId: materialFallbackId,
        facadeMaterialId: selected.facadeId,
      });
      overrides.facadeProducer = toFacadeProducer(context.facade.producer);
      overrides.facadeArticle = context.facade.article;
      overrides.facadeThicknessMm = context.facade.thicknessMm;
      overrides.facadeMaterialKind = context.facade.materialKind === 'mdf' ? 'mdf' : 'ldsp';
    } catch {
      // Keep the historical catalog fallback for unsupported facade material payloads.
    }
  }

  return overrides;
}

export function calculateServerCatalogPrice(body: OrderRequest): CatalogPriceBreakdown {
  if (!body.productType) throw new Error('productType is missing');
  if (!body.dimensions) throw new Error('dimensions are missing');
  if (!body.filling) throw new Error('filling is missing');

  const facadeStyle = findById(facadeStyles as FacadeStyle[], body.style?.facadeStyleId, 'facade style');
  const hardware = findById(hardwareItems as Hardware[], body.style?.hardwareId, 'hardware');

  const basePrice = calculateCatalogPrice({
    type: body.productType,
    dimensions: body.dimensions,
    sections: body.sections ?? 1,
    filling: body.filling,
    ...materialPricingOverrides(body),
    facadeStyleMultiplier: facadeStyle.priceMultiplier,
    hardwareLevel: hardware.basePrice > 5000 ? 'comfort' : 'base',
  });
  return basePrice;
}

export function applyServerDeliveryAndAssembly(
  body: OrderRequest,
  basePrice: CatalogPriceBreakdown,
): CatalogPriceBreakdown {
  const deliveryQuote = calculateDeliveryQuote(body.delivery?.enabled === true, body.delivery?.address ?? '');
  const assemblyQuote = calculateAssemblyQuote(body.assembly?.enabled === true, basePrice.total);

  return {
    ...basePrice,
    delivery: deliveryQuote.price,
    assembly: assemblyQuote.price,
    total: basePrice.total + deliveryQuote.price + assemblyQuote.price,
  };
}

export function applyServerProductionPanelPrice(input: {
  body: OrderRequest;
  catalogPrice: CatalogPriceBreakdown;
  productionExport: ProductionExportPackage;
}): ProductionPanelPriceApplication {
  const panelPricing = summarizeProductionPanelPricing({
    productionExport: input.productionExport,
    catalogMaterialsPrice: input.catalogPrice.materials,
  });

  return applyProductionPanelPricingToCatalogPrice({
    catalogPrice: input.catalogPrice,
    panelPricing,
  });
}

export function calculateServerPrice(body: OrderRequest): CatalogPriceBreakdown {
  return applyServerDeliveryAndAssembly(body, calculateServerCatalogPrice(body));
}

export function withServerPrice(body: OrderRequest, price: CatalogPriceBreakdown): OrderRequest {
  return {
    ...body,
    priceBreakdown: {
      body: price.body,
      facades: price.facades,
      filling: price.filling,
      hardware: price.hardware,
      production: price.production,
      delivery: price.delivery,
      assembly: price.assembly ?? 0,
      materials: price.materials,
      edgeBanding: price.edgeBanding,
      services: price.services,
    },
    totalPrice: price.total,
    delivery: {
      ...body.delivery,
      enabled: body.delivery?.enabled === true,
      price: body.delivery?.enabled === true ? price.delivery : 0,
    },
    assembly: {
      enabled: body.assembly?.enabled === true,
      price: price.assembly ?? 0,
      rate: body.assembly?.enabled === true ? 0.1 : 0,
      basePrice: body.assembly?.enabled === true ? price.total - price.delivery - (price.assembly ?? 0) : 0,
    },
  };
}
