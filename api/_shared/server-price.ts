import materials from '../../src/config/materials.json';
import facadeStyles from '../../src/config/facade-styles.json';
import hardwareItems from '../../src/config/hardware.json';
import { calculateCatalogPrice, type CatalogPriceBreakdown } from '../../src/pricing/engine';
import { calculateDeliveryQuote } from '../../src/pricing/delivery';
import { calculateAssemblyQuote } from '../../src/pricing/assembly';
import type { OrderRequest } from './order-types';

type Material = {
  id: string;
  pricePerLiter: number;
};

type FacadeStyle = {
  id: string;
  priceMultiplier: number;
};

type Hardware = {
  id: string;
  basePrice: number;
  priceFactor: number;
};

function findById<T extends { id: string }>(items: T[], id: string | undefined, label: string): T {
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error(`${label} not found: ${id ?? 'empty'}`);
  return item;
}

export function calculateServerPrice(body: OrderRequest): CatalogPriceBreakdown {
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
    facadeStyleMultiplier: facadeStyle.priceMultiplier,
    hardwareLevel: hardware.basePrice > 5000 ? 'comfort' : 'base',
  });
  const deliveryQuote = calculateDeliveryQuote(body.delivery?.enabled === true, body.delivery?.address ?? '');
  const assemblyQuote = calculateAssemblyQuote(body.assembly?.enabled === true, basePrice.total);

  return {
    ...basePrice,
    delivery: deliveryQuote.price,
    assembly: assemblyQuote.price,
    total: basePrice.total + deliveryQuote.price + assemblyQuote.price,
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
    assembly: {
      enabled: body.assembly?.enabled === true,
      price: price.assembly ?? 0,
      rate: body.assembly?.enabled === true ? 0.1 : 0,
      basePrice: body.assembly?.enabled === true ? price.total - price.delivery - (price.assembly ?? 0) : 0,
    },
  };
}
