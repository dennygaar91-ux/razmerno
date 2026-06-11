import type { HardwareItem, HardwareType } from "../constructor/geometry/types";

export type HardwareSupplierCatalogStatus = "foundation" | "confirmed";

export type HardwareSupplierCatalogItem = {
  sku: string;
  type: HardwareType;
  vendor: "Hettich" | "Firmax" | "Razmerno";
  name: string;
  aliases: string[];
  unit: "pcs" | "pair" | "meter" | "set";
  unitPrice: number;
  priceSource: "foundation-estimate" | "supplier-price-list";
  status: HardwareSupplierCatalogStatus;
  requiresPriceConfirmation: boolean;
  notes: string;
};

export type HardwareSupplierCatalogResolution = {
  status: "matched" | "unmatched";
  item: HardwareSupplierCatalogItem | null;
  reason: string;
};

export type HardwareSupplierCatalog = readonly HardwareSupplierCatalogItem[];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[×x]/g, "x")
    .replace(/[^a-zа-я0-9]+/g, " ")
    .trim();
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(normalizeText(needle)));
}

export const HARDWARE_SUPPLIER_CATALOG: HardwareSupplierCatalogItem[] = [
  {
    sku: "hettich-sensys-110-softclose-foundation",
    type: "hinge",
    vendor: "Hettich",
    name: "Петля Hettich Sensys 110° с доводчиком",
    aliases: ["hettich sensys", "петля hettich", "sensys 110"],
    unit: "pcs",
    unitPrice: 494,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU до загрузки точного прайса Hettich.",
  },
  {
    sku: "firmax-hinge-110-foundation",
    type: "hinge",
    vendor: "Firmax",
    name: "Петля Firmax 110°",
    aliases: ["петля firmax", "firmax 110"],
    unit: "pcs",
    unitPrice: 494,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU до загрузки точного прайса Firmax.",
  },
  {
    sku: "hettich-ka5732-slide-pair-foundation",
    type: "drawer-slide",
    vendor: "Hettich",
    name: "Hettich KA5732 направляющие полного выдвижения, пара",
    aliases: ["hettich ka5732", "направляющие hettich", "шариковая полного выдвижения"],
    unit: "pair",
    unitPrice: 1885,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU: цена пары направляющих до точного артикула длины.",
  },
  {
    sku: "firmax-sp-slide-pair-foundation",
    type: "drawer-slide",
    vendor: "Firmax",
    name: "Firmax SP роликовые направляющие, пара",
    aliases: ["firmax sp", "роликовая", "направляющие firmax"],
    unit: "pair",
    unitPrice: 1885,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU: цена пары направляющих до точного артикула длины.",
  },
  {
    sku: "razmerno-matte-handle-foundation",
    type: "handle",
    vendor: "Razmerno",
    name: "Ручка-скоба матовая",
    aliases: ["ручка скоба", "ручка-скоба", "матовая"],
    unit: "pcs",
    unitPrice: 585,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU до выбора реального ассортимента ручек.",
  },
  {
    sku: "razmerno-hidden-profile-handle-foundation",
    type: "handle",
    vendor: "Razmerno",
    name: "Скрытая ручка-профиль",
    aliases: ["скрытая ручка", "ручка профиль", "профиль для ящика", "gola"],
    unit: "meter",
    unitPrice: 585,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU; позже нужно считать по длине профиля.",
  },
  {
    sku: "firmax-push-to-open-foundation",
    type: "push-to-open",
    vendor: "Firmax",
    name: "Push-to-open механизм / толкатель",
    aliases: ["push to open", "push-to-open", "толкатель"],
    unit: "pcs",
    unitPrice: 676,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU до выбора конкретного механизма.",
  },
  {
    sku: "firmax-wardrobe-rod-25-foundation",
    type: "rod",
    vendor: "Firmax",
    name: "Штанга для одежды Ø25 мм",
    aliases: ["штанга", "одежды", "25"],
    unit: "meter",
    unitPrice: 1820,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU; позже нужно считать по фактической длине штанги.",
  },
  {
    sku: "firmax-rod-holder-foundation",
    type: "rod-holder",
    vendor: "Firmax",
    name: "Держатель штанги",
    aliases: ["держатель штанги", "rod holder"],
    unit: "pcs",
    unitPrice: 156,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU до точного артикула держателя.",
  },
  {
    sku: "mdm-se01pb-shelf-support-foundation",
    type: "shelf-support",
    vendor: "Razmerno",
    name: "Полкодержатель Ø5 / MDM SE01PB placeholder",
    aliases: ["полкодержатель", "shelf support", "se01pb"],
    unit: "pcs",
    unitPrice: 33,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU; позже сопоставить с MDM-Комплект SE01PB и ценой поставщика.",
  },
  {
    sku: "firmax-confirmat-7x50-foundation",
    type: "confirmat",
    vendor: "Firmax",
    name: "Конфирмат 7×50",
    aliases: ["конфирмат", "7x50", "7 50"],
    unit: "pcs",
    unitPrice: 10,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU для крепежа.",
  },
  {
    sku: "razmerno-eccentric-foundation",
    type: "eccentric",
    vendor: "Razmerno",
    name: "Эксцентриковая стяжка",
    aliases: ["эксцентрик", "эксцентриковая"],
    unit: "pcs",
    unitPrice: 49,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU для крепежа.",
  },
  {
    sku: "razmerno-screw-foundation",
    type: "screw",
    vendor: "Razmerno",
    name: "Саморез мебельный",
    aliases: ["саморез", "screw"],
    unit: "pcs",
    unitPrice: 5,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU для крепежа.",
  },
  {
    sku: "razmerno-leg-foundation",
    type: "leg",
    vendor: "Razmerno",
    name: "Опора мебельная",
    aliases: ["опора", "ножка", "leg"],
    unit: "pcs",
    unitPrice: 104,
    priceSource: "foundation-estimate",
    status: "foundation",
    requiresPriceConfirmation: true,
    notes: "Foundation SKU до выбора реальной опоры.",
  },
];

export function resolveHardwareSupplierSku(
  item: HardwareItem,
  catalog: HardwareSupplierCatalog = HARDWARE_SUPPLIER_CATALOG,
): HardwareSupplierCatalogResolution {
  const normalizedVendor = normalizeText(item.vendor);
  const normalizedName = normalizeText(item.name);

  const exact = catalog.find((catalogItem) => {
    if (catalogItem.type !== item.type) return false;
    if (normalizeText(catalogItem.vendor) !== normalizedVendor) return false;
    return includesAny(normalizedName, [catalogItem.name, ...catalogItem.aliases]);
  });
  if (exact) return { status: "matched", item: exact, reason: "matched-by-type-vendor-alias" };

  const typeAlias = catalog.find((catalogItem) => {
    if (catalogItem.type !== item.type) return false;
    return includesAny(normalizedName, [catalogItem.name, ...catalogItem.aliases]);
  });
  if (typeAlias) return { status: "matched", item: typeAlias, reason: "matched-by-type-alias" };

  const typeFallback = catalog.find((catalogItem) => catalogItem.type === item.type);
  if (typeFallback) return { status: "matched", item: typeFallback, reason: "matched-by-type-fallback" };

  return { status: "unmatched", item: null, reason: "no-supplier-sku" };
}
