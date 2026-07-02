import type { OrderRequest } from "../../api/_shared/order-types";

export const ORDER_CONTRACT_ACCEPTED_AT = "2026-06-15T12:00:00.000Z";

const baseOrder: OrderRequest = {
  orderId: "RZ-20260615-1001",
  productType: "wardrobe",
  dimensions: {
    width: 1800,
    height: 2200,
    depth: 600,
  },
  sections: 2,
  filling: {
    shelves: 4,
    drawers: 0,
    hangingRod: true,
  },
  layout: {
    sections: [
      {
        id: "section-1",
        widthMm: 900,
        compartments: [
          {
            id: "section-1-zone-1",
            kind: "rod",
            heightMm: 2200,
            shelves: 0,
            drawers: 0,
            hasRod: true,
          },
        ],
      },
      {
        id: "section-2",
        widthMm: 900,
        compartments: [
          {
            id: "section-2-zone-1",
            kind: "shelves",
            heightMm: 2200,
            shelves: 4,
            drawers: 0,
            hasRod: false,
          },
        ],
      },
    ],
  },
  materials: {
    bodyId: "white-matt",
    facadeId: "white-matt",
    facadeKind: "ldsp",
    backPanelId: "white-matt",
    backPanelKind: "hdf",
  },
  style: {
    facadeStyleId: "regular",
    hardwareId: "base",
  },
  priceBreakdown: {
    body: 32_000,
    facades: 24_000,
    filling: 8_000,
    hardware: 3_800,
    production: 0,
    materials: 56_000,
    edgeBanding: 4_500,
    services: 7_500,
    delivery: 0,
    assembly: 0,
  },
  totalPrice: 79_800,
  customer: {
    name: "Иван Петров",
    phone: "+7 999 111-22-33",
    email: "client@example.com",
    comment: "Позвонить после 12:00",
  },
  delivery: {
    enabled: false,
    price: 0,
  },
  assembly: {
    enabled: false,
    price: 0,
    rate: 0,
    basePrice: 0,
  },
  consent: {
    personalData: true,
    privacyVersion: "2026-05-24",
    acceptedAt: ORDER_CONTRACT_ACCEPTED_AT,
  },
  configVersion: "contract-test",
  source: "constructor-store-adapter",
  utm: {},
  honeypot: "",
};

export function makeValidOrder(overrides: Partial<OrderRequest> = {}): OrderRequest {
  return {
    ...(JSON.parse(JSON.stringify(baseOrder)) as OrderRequest),
    ...overrides,
  };
}

export function makeDeliveryOrder(address = "Москва, ул. Тверская, 1"): OrderRequest {
  return makeValidOrder({
    delivery: {
      enabled: true,
      address,
      price: 6000,
    },
  });
}

export function makeAssemblyOrder(basePrice = 79_800): OrderRequest {
  return makeValidOrder({
    assembly: {
      enabled: true,
      price: Math.round(basePrice * 0.1),
      rate: 0.1,
      basePrice,
    },
  });
}

export const REQUIRED_ORDER_DB_COLUMNS = [
  "order_id",
  "status",
  "source",
  "product_type",
  "dimensions",
  "sections",
  "filling",
  "layout",
  "materials",
  "style",
  "price_breakdown",
  "total_price",
  "customer_name",
  "customer_phone",
  "customer_email",
  "delivery_enabled",
  "delivery_address",
  "delivery_price",
  "assembly_enabled",
  "assembly_price",
  "assembly_rate",
  "assembly_base_price",
  "consent",
  "config_version",
  "utm",
  "manager_email_status",
  "customer_email_status",
  "manager_email_error",
  "customer_email_error",
  "user_agent",
  "client_ip_hash",
  "production_export",
  "catalog_source_used",
  "pricing_source_diagnostic",
  "pricing_fallback_reason",
] as const;
