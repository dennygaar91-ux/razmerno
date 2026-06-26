export type AdminOrderRow = {
  id: string;
  status: "new" | "in_progress" | "done" | string;
  customer: string;
  phone: string;
  email: string;
  product: string;
  productType?: string;
  dimensions?: { widthMm: number; heightMm: number; depthMm: number };
  materialsSummary?: string;
  pricingLabel?: string;
  pricingSource?: string;
  pricingSnapshotSummary?: string;
  priceBreakdownSummary?: string;
  total: string;
  createdAt: string;
  delivery: string;
  assembly: string;
  assemblyBasePrice?: string;
  managerEmail: string;
  customerEmail: string;
  production: string;
  productionStatus: string;
};

export type AdminApiOrder = {
  id: string;
  status: string;
  createdAt: string | null;
  product: string;
  totalPrice: number;
  priceBreakdown: Record<string, number> | null;
  delivery: { enabled: boolean; price: number; addressMasked: string | null };
  assembly: { enabled: boolean; price: number; basePrice: number | null };
  pricing: { status: "final server snapshot"; source: "source attribution not persisted" };
  customer: { nameMasked: string; phoneMasked: string; emailMasked: string };
  email: { manager: string; customer: string };
  production: { status: string; warnings: number; rejects: number; repairs: number; revision: number; manualAllowed: boolean };
};

export type AdminStatusEventRow = {
  id: number;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string;
  createdAt: string | null;
};

export type AdminProductionDetail = {
  orderId: string;
  productionExport: {
    review?: { status?: string; manualChangesAllowed?: boolean };
    rules?: { autoWarnings?: unknown[]; autoRejects?: unknown[]; autoRepairs?: unknown[] };
    validation?: { status?: string; errors?: string[]; warnings?: string[] };
    revisions?: Array<{ version?: number; status?: string; note?: string; createdAt?: string }>;
    productionModel?: {
      panels?: Array<{ id?: string; name?: string; role?: string; widthMm?: number; heightMm?: number; thicknessMm?: number; materialId?: string }>;
      hardware?: Array<{ id?: string; type?: string; name?: string; quantity?: number }>;
      drilling?: Array<{ id?: string; panelId?: string; purpose?: string; requiresTechnologistCheck?: boolean }>;
      edgeBanding?: Array<{ panelId?: string; side?: string; thicknessMm?: number }>;
    };
    basis?: { plan?: Array<{ title?: string; description?: string }> };
  } | null;
};

export type ProductionExportDetail = NonNullable<AdminProductionDetail["productionExport"]>;

export type ProductionReviewStatus = "requires-review" | "manually-adjusted" | "approved-for-basis" | "blocked";
