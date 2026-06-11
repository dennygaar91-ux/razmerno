import { findBestPriceItem, type PriceCatalogQuery } from "./catalog";
import { CLIENT_PRICE_MULTIPLIER } from "./pricingPolicy";
import type { FurnitureType, PriceBreakdown } from "../shared/lib/pricing-core";

export interface CatalogPriceInput {
  type: FurnitureType;
  dimensions: { width: number; height: number; depth: number };
  sections: number;
  filling: { shelves: number; drawers: number; hangingRod: boolean };
  bodyProducer?: "Kronospan" | "Egger" | "Eterno";
  bodyArticle?: string;
  bodyThicknessMm?: number;
  facadeProducer?: "Kronospan" | "Egger" | "Eterno" | "AGT";
  facadeArticle?: string;
  facadeThicknessMm?: number;
  facadeMaterialKind?: "ldsp" | "mdf";
  facadeStyleMultiplier: number;
  hardwareLevel: "base" | "comfort";
}

export interface CatalogPriceBreakdown extends PriceBreakdown {
  materials: number;
  edgeBanding: number;
  services: number;
  source: "catalog" | "production-panels";
  debug: {
    bodyAreaM2: number;
    facadeAreaM2: number;
    backAreaM2: number;
    edgeLengthM: number;
    boardPriceM2: number;
    facadePriceM2: number;
    edgePriceM: number;
    packagingPriceM2?: number;
    bodyPriceSource?: string;
    facadePriceSource?: string;
    panelBodyAreaM2?: number;
    panelFacadeAreaM2?: number;
    panelBackAreaM2?: number;
    panelEdgeLengthM?: number;
    panelPricingDelta?: number;
  };
}

const BODY_WASTE_FACTOR = 1.18;
const FACADE_WASTE_FACTOR = 1.12;
const BACK_PANEL_PRICE_M2 = 650 * CLIENT_PRICE_MULTIPLIER;
const DRAWER_BOX_COST = 2150 * CLIENT_PRICE_MULTIPLIER;
const ROD_COST = 1400 * CLIENT_PRICE_MULTIPLIER;
const HINGE_COST = 380 * CLIENT_PRICE_MULTIPLIER;
const PUSH_TO_OPEN_COST = 520 * CLIENT_PRICE_MULTIPLIER;
const BASE_HARDWARE_BUFFER = 1800 * CLIENT_PRICE_MULTIPLIER;
const COMFORT_MULTIPLIER = 1.18;
const PACKAGING_FALLBACK_M2 = 120 * CLIENT_PRICE_MULTIPLIER;

function roundMoney(value: number): number {
  return Math.round(value);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function getBoardPriceM2(query: PriceCatalogQuery, fallbackLabel: string): { price: number; source: string } {
  const item = findBestPriceItem(query);
  if (item) return { price: item.retailPrice, source: item.name };

  const producerThicknessFallback = findBestPriceItem({
    itemType: query.itemType ?? "board",
    producer: query.producer,
    thicknessMm: query.thicknessMm,
  });
  if (producerThicknessFallback) {
    return {
      price: producerThicknessFallback.retailPrice,
      source: `${producerThicknessFallback.name} · fallback by producer/thickness`,
    };
  }

  const fallback = findBestPriceItem({ itemType: "board", thicknessMm: query.thicknessMm ?? 16 });
  if (!fallback) throw new Error(`No board price found for ${fallbackLabel}`);
  return { price: fallback.retailPrice, source: `${fallback.name} · fallback by thickness` };
}

function safeServicePrice(query: PriceCatalogQuery, fallback: number): number {
  const item = findBestPriceItem(query);
  return item?.retailPrice ?? fallback;
}

export function calculateCatalogPrice(input: CatalogPriceInput): CatalogPriceBreakdown {
  const { width, height, depth } = input.dimensions;
  const W = width / 1000;
  const H = height / 1000;
  const D = depth / 1000;

  const sideArea = 2 * H * D;
  const topBottomArea = 2 * W * D;
  const dividersArea = Math.max(0, input.sections - 1) * H * D;
  const shelvesArea = input.filling.shelves * W / Math.max(1, input.sections) * D;
  const bodyAreaM2 = round2((sideArea + topBottomArea + dividersArea + shelvesArea) * BODY_WASTE_FACTOR);

  const facadeAreaM2 = round2(W * H * FACADE_WASTE_FACTOR);
  const backAreaM2 = round2(W * H);

  const bodyProducer = input.bodyProducer ?? "Kronospan";
  const bodyThicknessMm = input.bodyThicknessMm ?? 16;
  const facadeProducer = input.facadeProducer ?? "Kronospan";
  const facadeThicknessMm = input.facadeThicknessMm ?? (facadeProducer === "AGT" ? 18 : 16);

  const bodyPrice = getBoardPriceM2(
    { itemType: "board", producer: bodyProducer, article: input.bodyArticle, thicknessMm: bodyThicknessMm },
    `${bodyProducer} body ${bodyThicknessMm}mm`,
  );
  const facadePrice = getBoardPriceM2(
    {
      itemType: facadeProducer === "AGT" ? "panel" : "board",
      producer: facadeProducer,
      article: input.facadeArticle,
      thicknessMm: facadeThicknessMm,
    },
    `${facadeProducer} facade ${facadeThicknessMm}mm`,
  );
  const boardPriceM2 = bodyPrice.price;
  const facadePriceM2 = facadePrice.price;

  const edgePriceM =
    findBestPriceItem({ itemType: "edge", producer: bodyProducer, thicknessMm: 0.8 })?.retailPrice ??
    findBestPriceItem({ itemType: "edge", thicknessMm: 1 })?.retailPrice ??
    140;

  const edgeServicePriceM = safeServicePrice({ itemType: "service", nameIncludes: "Поклейка кромки" }, 190 * CLIENT_PRICE_MULTIPLIER);
  const packagingPriceM2 = safeServicePrice({ itemType: "service", nameIncludes: "гофрокартон" }, PACKAGING_FALLBACK_M2);

  const edgeLengthM = round2((2 * H + 2 * W + input.filling.shelves * 2 * W + input.sections * H) * 1.08);

  const body = roundMoney(bodyAreaM2 * boardPriceM2);
  const facades = roundMoney(facadeAreaM2 * facadePriceM2 * input.facadeStyleMultiplier);
  const back = roundMoney(backAreaM2 * BACK_PANEL_PRICE_M2);
  const edgeBanding = roundMoney(edgeLengthM * (edgePriceM + edgeServicePriceM));
  const packaging = roundMoney((bodyAreaM2 + facadeAreaM2 + backAreaM2) * packagingPriceM2);

  const filling = roundMoney(
    input.filling.drawers * DRAWER_BOX_COST +
    (input.filling.hangingRod ? ROD_COST : 0),
  );

  const hingeCount = input.type === "wardrobe" ? Math.max(4, Math.ceil(height / 900) * 2) : Math.max(2, Math.ceil(height / 700) * 2);
  const hardwareBase = BASE_HARDWARE_BUFFER + hingeCount * HINGE_COST + (input.facadeStyleMultiplier > 1 ? PUSH_TO_OPEN_COST * Math.max(1, input.sections) : 0);
  const hardware = roundMoney(input.hardwareLevel === "comfort" ? hardwareBase * COMFORT_MULTIPLIER : hardwareBase);

  const services = packaging;
  const materials = body + facades + back + edgeBanding;
  const subtotal = materials + filling + hardware + services;
  const production = 0;
  const delivery = 0;

  return {
    body,
    facades,
    filling,
    hardware,
    production,
    delivery,
    total: subtotal + production + delivery,
    isPreliminary: false,
    materials,
    edgeBanding,
    services,
    source: "catalog",
    debug: {
      bodyAreaM2,
      facadeAreaM2,
      backAreaM2,
      edgeLengthM,
      boardPriceM2,
      facadePriceM2,
      edgePriceM,
      packagingPriceM2,
      bodyPriceSource: bodyPrice.source,
      facadePriceSource: facadePrice.source,
    },
  };
}
