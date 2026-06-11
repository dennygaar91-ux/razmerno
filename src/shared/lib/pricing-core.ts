export type FurnitureType = "wardrobe" | "dresser" | "nightstand";

export interface PricingConfig {
  deliveryMoscow: number;
  productionMarkup: number;
  quickEstimate: {
    bodyPricePerLiter: number;
    facadePricePerLiter: number;
    defaultFillingCost: number;
  };
  filling: {
    shelf: number;
    drawer: number;
    rod: number;
  };
}

export interface PriceInput {
  type: FurnitureType;
  dimensions: { width: number; height: number; depth: number };
  sections: number;
  filling: { shelves: number; drawers: number; hangingRod: boolean };
  bodyPricePerLiter: number;
  facadePricePerLiter: number;
  bodyProducer?: "Kronospan" | "Egger" | "Eterno";
  bodyArticle?: string;
  bodyThicknessMm?: number;
  facadeProducer?: "Kronospan" | "Egger" | "Eterno" | "AGT";
  facadeArticle?: string;
  facadeThicknessMm?: number;
  facadeMaterialKind?: "ldsp" | "mdf";
  facadeStyleMultiplier: number;
  hardwareBasePrice: number;
  hardwarePriceFactor: number;
}

export interface PriceBreakdown {
  body: number;
  facades: number;
  filling: number;
  hardware: number;
  production: number;
  delivery: number;
  assembly?: number;
  total: number;
  isPreliminary: boolean;
}

export function calculatePriceCore(config: PricingConfig, input: PriceInput): PriceBreakdown {
  const { width, height, depth } = input.dimensions;
  const volLiters = (width * height * depth) / 1_000_000;
  const facadeArea = (width * height) / 1_000_000;

  const body = Math.round(volLiters * 18 * input.bodyPricePerLiter);
  const facades = Math.round(facadeArea * 1000 * input.facadePricePerLiter * input.facadeStyleMultiplier);
  const filling =
    input.filling.shelves * config.filling.shelf +
    input.filling.drawers * config.filling.drawer +
    (input.filling.hangingRod ? config.filling.rod : 0);
  const hardware = Math.round(
    (volLiters * 2 + facadeArea * 3) * input.hardwarePriceFactor + input.hardwareBasePrice,
  );
  const subtotal = body + facades + filling + hardware;
  const production = Math.round(subtotal * config.productionMarkup);
  const delivery = config.deliveryMoscow;

  return {
    body,
    facades,
    filling,
    hardware,
    production,
    delivery,
    total: subtotal + production + delivery,
    isPreliminary: false,
  };
}

export function quickEstimateCore(config: PricingConfig, width: number, height: number, depth: number): number {
  const volLiters = (width * height * depth) / 1_000_000;
  const facadeArea = (width * height) / 1_000_000;
  const body = Math.round(volLiters * 18 * config.quickEstimate.bodyPricePerLiter);
  const facades = Math.round(facadeArea * 1000 * config.quickEstimate.facadePricePerLiter * 1.0);
  const subtotal = body + facades + config.quickEstimate.defaultFillingCost + config.deliveryMoscow;
  const production = Math.round(subtotal * config.productionMarkup);
  return Math.ceil((subtotal + production) / 100) * 100;
}
