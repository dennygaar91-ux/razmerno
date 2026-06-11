export interface DeliveryQuote {
  enabled: boolean;
  address: string;
  zone: "mkad" | "outside_mkad" | "unknown";
  distanceKm: number;
  price: number;
  message: string;
}

export const DELIVERY_MKAD_PRICE = 6000;
export const DELIVERY_OUTSIDE_MKAD_PRICE_PER_KM = 50;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function detectDeliveryZone(address: string): DeliveryQuote["zone"] {
  const value = normalize(address);
  if (!value) return "unknown";

  const outsideMarkers = [
    "московская область",
    "мо,",
    "мо ",
    "подмосков",
    "область",
    "за мкад",
    "за пределами мкад",
    "+",
  ];
  if (outsideMarkers.some((marker) => value.includes(marker))) return "outside_mkad";

  const mkadMarkers = ["москва", "мск", "moscow", "в пределах мкад", "мкад"];
  if (mkadMarkers.some((marker) => value.includes(marker))) return "mkad";

  return "unknown";
}

export function extractOutsideMkadDistanceKm(address: string): number {
  const value = normalize(address);
  const patterns = [
    /(?:за\s*мкад|от\s*мкад|\+)?\s*(\d{1,3})\s*(?:км|километр)/i,
    /(?:км)\s*(\d{1,3})/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return Math.max(0, Number(match[1]));
  }

  return 0;
}

export function calculateDeliveryQuote(enabled: boolean, address: string): DeliveryQuote {
  if (!enabled) {
    return {
      enabled: false,
      address,
      zone: "unknown",
      distanceKm: 0,
      price: 0,
      message: "Доставка не выбрана",
    };
  }

  const zone = detectDeliveryZone(address);
  const distanceKm = zone === "outside_mkad" ? extractOutsideMkadDistanceKm(address) : 0;

  if (zone === "mkad") {
    return {
      enabled: true,
      address,
      zone,
      distanceKm: 0,
      price: DELIVERY_MKAD_PRICE,
      message: "Доставка в пределах МКАД",
    };
  }

  if (zone === "outside_mkad") {
    const extra = distanceKm * DELIVERY_OUTSIDE_MKAD_PRICE_PER_KM;
    return {
      enabled: true,
      address,
      zone,
      distanceKm,
      price: DELIVERY_MKAD_PRICE + extra,
      message: distanceKm > 0
        ? `Доставка за МКАД: 6 000 ₽ + ${distanceKm} км × 50 ₽`
        : "Доставка за МКАД: 6 000 ₽ + 50 ₽/км. Уточните расстояние от МКАД",
    };
  }

  return {
    enabled: true,
    address,
    zone,
    distanceKm: 0,
    price: DELIVERY_MKAD_PRICE,
    message: "Предварительно: доставка в пределах МКАД. Для МО укажите расстояние от МКАД",
  };
}

export function validateDelivery(enabled: boolean, address: string): string | null {
  if (!enabled) return null;
  if (address.trim().length < 8) return "Укажите адрес доставки";

  const zone = detectDeliveryZone(address);
  if (zone === "outside_mkad" && extractOutsideMkadDistanceKm(address) <= 0) {
    return "Для доставки за МКАД укажите расстояние от МКАД в километрах";
  }

  return null;
}
