export const CLIENT_PRICE_MULTIPLIER = 1.3;

export const DEALER_PRICE_SOURCE = {
  fileName: "Прайс-лист для дилеров до 01.04.26(3).xlsx",
  validUntil: "2026-04-01",
  sheets: [
    "Kronospan",
    "Кромка",
    "Eterno",
    "Egger",
    "AGT",
    "Кедр столешницы",
    "Услуги",
  ],
} as const;

export const PRICING_CALCULATION_RULES = {
  boardAndMdfUnit: "кв.м.",
  edgeUnit: "п.м.",
  packagingUnit: "кв.м.",
  boardIncludesCutting: true,
  boardIncludesDrilling: true,
  countCuttingSeparately: false,
  countDrillingSeparately: false,
  countEdgeMaterialSeparately: true,
  countEdgeServiceSeparately: true,
  countPackagingSeparately: true,
  priceAccuracy: "exact",
} as const;
