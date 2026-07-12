import facadeStyles from '../../src/config/facade-styles.json' with { type: 'json' };
import hardwareItems from '../../src/config/hardware.json' with { type: 'json' };
import { calculateCatalogPrice, type CatalogPriceBreakdown, type CatalogPriceInput } from '../../src/pricing/engine.js';
import { PRICE_ITEMS, withPriceCatalogItems } from '../../src/pricing/catalog.js';
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
import { fetchPriceItems } from './price-items-store.js';
import type { RawPriceItem } from '../../src/pricing/types.js';

type FacadeStyle = {
  id: string;
  priceMultiplier: number;
};

type Hardware = {
  id: string;
  basePrice: number;
  priceFactor: number;
};

export type ServerPricingCatalogSource =
  | 'supabase_success'
  | 'supabase_empty'
  | 'supabase_failed'
  | 'seed_fallback';

/**
 * Pricing source contract (diagnostic vs effective source):
 * - `source` = runtime diagnostic state of catalog resolution.
 *   It describes what happened during Supabase resolution
 *   (`supabase_success` / `supabase_empty` / `supabase_failed` / `seed_fallback`).
 * - `catalogSourceUsed` = effective catalog used for pricing calculation.
 *   It describes which catalog actually powered the final price
 *   (`supabase` or explicit `seed_fallback`).
 *
 * Both fields are contract-level and must always be returned together.
 */
type ServerCatalogPriceResolutionBase = {
  itemCount: number;
  fallbackReason: string | null;
  price: CatalogPriceBreakdown;
};

/**
 * Server pricing contract lock:
 *
 * 1) `source` (diagnostic state)
 *    - reports WHAT happened during catalog resolution.
 *    - values:
 *      - `supabase_success`: Supabase returned non-empty catalog.
 *      - `supabase_empty`: Supabase request succeeded but returned no items.
 *      - `supabase_failed`: Supabase request failed (network/API/runtime error path).
 *      - `seed_fallback`: runtime catalog is unavailable (e.g. env/runtime missing path).
 *
 * 2) `catalogSourceUsed` (effective execution source)
 *    - reports WHICH catalog actually powered price calculation.
 *    - values:
 *      - `supabase`: calculation used Supabase items.
 *      - `seed_fallback`: calculation used seed JSON items.
 *
 * 3) Fallback contract
 *    - `supabase_success` MUST use `catalogSourceUsed = supabase`.
 *    - any non-success diagnostic state MUST use `catalogSourceUsed = seed_fallback`.
 *    - fallback is explicit and traceable via `source + fallbackReason`.
 *
 * 4) Decision flow (Supabase -> seed)
 *    - try Supabase runtime catalog first.
 *    - if non-empty: use Supabase for pricing.
 *    - if empty/failed/unavailable: use seed fallback for pricing.
 *
 * This contract is intentionally redundant to prevent future ambiguity between
 * diagnostic state and effective catalog source in pricing parity/debug workflows.
 */
export type ServerCatalogPriceResolution =
  | (ServerCatalogPriceResolutionBase & {
    source: 'supabase_success';
    catalogSourceUsed: 'supabase';
  })
  | (ServerCatalogPriceResolutionBase & {
    source: Exclude<ServerPricingCatalogSource, 'supabase_success'>;
    catalogSourceUsed: 'seed_fallback';
  });

export type ServerFinalPriceResolution = ServerCatalogPriceResolutionBase & {
  source: ServerCatalogPriceResolution["source"];
  catalogSourceUsed: ServerCatalogPriceResolution["catalogSourceUsed"];
};

export function assertCatalogSourceConsistency(
  source: ServerPricingCatalogSource,
  catalogSourceUsed: 'supabase' | 'seed_fallback',
): boolean {
  const expectedCatalogSource = source === 'supabase_success' ? 'supabase' : 'seed_fallback';
  return catalogSourceUsed === expectedCatalogSource;
}

function createCatalogResolution(input: ServerCatalogPriceResolution): ServerCatalogPriceResolution {
  // Dev-only invariant guard: keeps the contract observable during local/test changes
  // without affecting production request flow.
  if (process.env.NODE_ENV === 'development') {
    const isConsistent = assertCatalogSourceConsistency(input.source, input.catalogSourceUsed);
    if (!isConsistent) {
      console.warn(
        `[pricing-source-invariant] source=${input.source} requires catalogSourceUsed=` +
        `${input.source === 'supabase_success' ? 'supabase' : 'seed_fallback'}, got=${input.catalogSourceUsed}`,
      );
    }
  }
  return input;
}

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

function calculateServerCatalogPriceFromItems(body: OrderRequest, items: RawPriceItem[]): CatalogPriceBreakdown {
  return withPriceCatalogItems(items, () => calculateServerCatalogPrice(body));
}

export async function calculateServerCatalogPriceResolved(
  body: OrderRequest,
): Promise<ServerCatalogPriceResolution> {
  // Explicit fallback inventory:
  // seed is always available as deterministic backup when Supabase runtime catalog
  // is empty/failed/unavailable.
  const seedItems = PRICE_ITEMS.slice(0, 5000);

  try {
    const runtime = await fetchPriceItems({ limit: 5000 });
    if (runtime.source === 'supabase' && runtime.items.length > 0) {
      return createCatalogResolution({
        source: 'supabase_success',
        catalogSourceUsed: 'supabase',
        itemCount: runtime.items.length,
        fallbackReason: null,
        price: calculateServerCatalogPriceFromItems(body, runtime.items),
      });
    }

    if (runtime.source === 'supabase') {
      return createCatalogResolution({
        source: 'supabase_empty',
        catalogSourceUsed: 'seed_fallback',
        itemCount: seedItems.length,
        fallbackReason: 'supabase_empty_catalog',
        price: calculateServerCatalogPriceFromItems(body, seedItems),
      });
    }

    return createCatalogResolution({
      source: 'seed_fallback',
      catalogSourceUsed: 'seed_fallback',
      itemCount: runtime.items.length,
      fallbackReason: 'supabase_env_missing',
      price: calculateServerCatalogPriceFromItems(body, runtime.items),
    });
  } catch {
    return createCatalogResolution({
      source: 'supabase_failed',
      catalogSourceUsed: 'seed_fallback',
      itemCount: seedItems.length,
      fallbackReason: 'supabase_fetch_failed',
      price: calculateServerCatalogPriceFromItems(body, seedItems),
    });
  }
}

function warnIfDeliveryAssemblyAlreadyApplied(basePrice: CatalogPriceBreakdown): void {
  const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  if (!isDevOrTest) return;

  const hasPreAppliedDelivery = (basePrice.delivery ?? 0) !== 0;
  const hasPreAppliedAssembly = (basePrice.assembly ?? 0) !== 0;

  if (hasPreAppliedDelivery || hasPreAppliedAssembly) {
    console.warn(
      `[pricing-parity-invariant] delivery/assembly must be applied after base catalog price only; ` +
      `received delivery=${basePrice.delivery ?? 0} assembly=${basePrice.assembly ?? 0}`,
    );
  }
}

export function applyServerDeliveryAndAssembly(
  body: OrderRequest,
  basePrice: CatalogPriceBreakdown,
): CatalogPriceBreakdown {
  // Keep deterministic parity across Supabase/seed paths:
  // delivery/assembly are always added once on top of the resolved base catalog price.
  warnIfDeliveryAssemblyAlreadyApplied(basePrice);
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

export async function calculateServerOrderPriceResolved(input: {
  body: OrderRequest;
  productionExport?: ProductionExportPackage | null;
}): Promise<ServerFinalPriceResolution> {
  const { body, productionExport } = input;
  const resolved = await calculateServerCatalogPriceResolved(body);

  let basePrice = resolved.price;
  if (body.source === "production-panels" && productionExport) {
    basePrice = applyServerProductionPanelPrice({
      body,
      catalogPrice: basePrice,
      productionExport,
    }).price;
  }

  return {
    ...resolved,
    price: applyServerDeliveryAndAssembly(body, basePrice),
  };
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
