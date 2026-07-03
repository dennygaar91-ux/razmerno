export type CustomerOrderPricingSummary = {
  furnitureTotal: number;
  deliveryTotal: number | null;
  assemblyTotal: number | null;
};

export type CustomerOrderDetail = {
  id: string;
  publicOrderNumber: string | null;
  domainStatus: string;
  createdAt: string;
  totalPrice: number;
  customerName: string;
  customerPhone: string | null;
  deliveryAddress: string | null;
  deliveryEnabled: boolean;
  assemblyEnabled: boolean;
  dimensionsSummary: string | null;
  materialsDecorSummary: string | null;
  pricingSummary: CustomerOrderPricingSummary;
};

export type CustomerOrderDetailApiResult =
  | { ok: true; data: CustomerOrderDetail }
  | { ok: false; message: string; status?: number };
