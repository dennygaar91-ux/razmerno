export type ProductType = "wardrobe" | "dresser" | "nightstand";

export type OrderCompartmentKind = "empty" | "shelves" | "drawers" | "rod";

export type OrderLayoutModel = {
  sections: Array<{
    id: string;
    widthMm: number;
    compartments: Array<{
      id: string;
      kind: OrderCompartmentKind;
      heightMm: number;
      shelves: number;
      drawers: number;
      hasRod: boolean;
    }>;
  }>;
};

export type OrderRequest = {
  orderId?: string;
  productType?: ProductType;
  dimensions?: { width: number; height: number; depth: number };
  sections?: number;
  filling?: { shelves: number; drawers: number; hangingRod: boolean };
  layout?: OrderLayoutModel;
  materials?: { bodyId: string; facadeId: string; facadeKind?: "ldsp" | "mdf"; backPanelId?: string; backPanelKind?: "hdf" };
  style?: { facadeStyleId: string; hardwareId: string };
  priceBreakdown?: Record<string, number>;
  totalPrice?: number;
  customer?: { name: string; phone: string; email?: string; comment?: string };
  delivery?: { enabled?: boolean; address?: string; price?: number };
  assembly?: { enabled?: boolean; price?: number; rate?: number; basePrice?: number };
  consent?: { personalData?: boolean; privacyVersion?: string; acceptedAt?: string };
  configVersion?: string;
  source?: string;
  utm?: Record<string, string>;
  honeypot?: string;
  productionExport?: unknown;
  /** Optional server project reference when submit originates from saved project. */
  projectId?: string;
};

export type OrderEmailStatus = "pending" | "sent" | "skipped" | "failed";

export type OrderCatalogSourceUsed = "supabase" | "seed_fallback";

export type OrderPricingSourceDiagnostic =
  | "supabase_success"
  | "supabase_empty"
  | "supabase_failed"
  | "seed_fallback";

export type OrderPricingAttribution = {
  catalog_source_used: OrderCatalogSourceUsed;
  pricing_source_diagnostic: OrderPricingSourceDiagnostic;
  pricing_fallback_reason: string | null;
};

export type OrderDbInsert = {
  order_id: string;
  status: "new";
  user_id: string;
  public_order_number: string;
  domain_status: string;
  constructor_project_id: string | null;
  source: string;

  product_type: ProductType;
  dimensions: NonNullable<OrderRequest["dimensions"]>;
  sections: number;
  filling: NonNullable<OrderRequest["filling"]>;
  layout: OrderLayoutModel | null;
  materials: NonNullable<OrderRequest["materials"]>;
  style: NonNullable<OrderRequest["style"]>;
  price_breakdown: Record<string, number>;
  total_price: number;

  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_comment: string | null;

  delivery_enabled: boolean;
  delivery_address: string | null;
  delivery_price: number;

  assembly_enabled: boolean;
  assembly_price: number;
  assembly_rate: number;
  assembly_base_price: number;

  consent: NonNullable<OrderRequest["consent"]>;
  config_version: string | null;
  utm: Record<string, string>;

  manager_email_status: OrderEmailStatus;
  customer_email_status: OrderEmailStatus;
  manager_email_error: string | null;
  customer_email_error: string | null;

  user_agent: string | null;
  client_ip_hash: string | null;
  production_export: unknown | null;

  catalog_source_used: OrderCatalogSourceUsed | null;
  pricing_source_diagnostic: OrderPricingSourceDiagnostic | null;
  pricing_fallback_reason: string | null;
};
