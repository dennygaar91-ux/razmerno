import type { CustomerOrderStatus } from "./customerOrderStatus";
import type { PaymentReadinessState } from "./paymentInstructionsTypes";

export type CustomerOrderPricingSummary = {
  furnitureTotal: number;
  deliveryTotal: number | null;
  assemblyTotal: number | null;
};

export type CustomerOrderDetail = {
  id: string;
  publicOrderNumber: string | null;
  status: CustomerOrderStatus;
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
  changeRequestAllowed: boolean;
  paymentState: PaymentReadinessState;
};

export type CustomerOrderDetailApiResult =
  | { ok: true; data: CustomerOrderDetail }
  | { ok: false; message: string; status?: number };
