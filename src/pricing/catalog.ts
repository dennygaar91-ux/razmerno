import priceItems from "./seed/price-items.json";
import type { PriceItemType, RawPriceItem } from "./types";

export interface PriceCatalogQuery {
  itemType?: PriceItemType;
  producer?: string;
  article?: string;
  thicknessMm?: number;
  unit?: string;
  nameIncludes?: string;
  category?: string;
}

function norm(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function matchesNumber(actual: number | undefined, expected: number | undefined): boolean {
  if (expected === undefined) return true;
  if (actual === undefined) return false;
  return Math.abs(actual - expected) < 0.001;
}

export const PRICE_ITEMS = priceItems as RawPriceItem[];

export function findPriceItems(query: PriceCatalogQuery): RawPriceItem[] {
  return PRICE_ITEMS.filter((item) => {
    if (query.itemType && item.itemType !== query.itemType) return false;
    if (query.producer && norm(item.producer) !== norm(query.producer)) return false;
    if (query.article && norm(item.article) !== norm(query.article)) return false;
    if (query.unit && norm(item.unit) !== norm(query.unit)) return false;
    if (query.category && norm(item.category) !== norm(query.category)) return false;
    if (!matchesNumber(item.thicknessMm, query.thicknessMm)) return false;
    if (query.nameIncludes && !norm(item.name).includes(norm(query.nameIncludes))) return false;
    return true;
  });
}

export function findBestPriceItem(query: PriceCatalogQuery): RawPriceItem | null {
  const matches = findPriceItems(query);
  if (matches.length === 0) return null;
  return matches
    .slice()
    .sort((a, b) => {
      const activeA = a.retailPrice > 0 ? 0 : 1;
      const activeB = b.retailPrice > 0 ? 0 : 1;
      if (activeA !== activeB) return activeA - activeB;
      return a.retailPrice - b.retailPrice;
    })[0] ?? null;
}

export function requirePriceItem(query: PriceCatalogQuery, label: string): RawPriceItem {
  const item = findBestPriceItem(query);
  if (!item) {
    throw new Error(`Price item not found: ${label}`);
  }
  return item;
}

export function getCatalogSummary() {
  return PRICE_ITEMS.reduce<Record<string, number>>((acc, item) => {
    acc[item.itemType] = (acc[item.itemType] ?? 0) + 1;
    return acc;
  }, {});
}

export function getRetailPrice(query: PriceCatalogQuery, label: string): number {
  return requirePriceItem(query, label).retailPrice;
}
