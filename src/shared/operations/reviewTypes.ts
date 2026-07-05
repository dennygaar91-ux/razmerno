export type OperationsOrderReview = {
  orderId: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  customerNameMasked: string;
  phoneMasked: string;
  emailMasked: string;
  productSummary: string;
  productType: string;
  dimensionsSummary: string;
  materialsSummary: string;
  totalPrice: number;
  totalPriceLabel: string;
  pricingLabel: string;
  pricingSource: string;
  pricingSnapshotSummary: string;
  priceBreakdownSummary: string;
  deliverySummary: string;
  assemblySummary: string;
  assemblyBasePriceSummary: string;
  managerEmailStatus: string;
  customerEmailStatus: string;
  productionReviewStatus: string;
  basisStatus: string;
  validationErrorsCount: number;
  validationWarningsCount: number;
  approvalActionsImplemented: false;
};

export type OperationsOrderReviewApiResult =
  | { ok: true; data: OperationsOrderReview }
  | { ok: false; status?: number; message: string };

export type OperationsOrderReviewLoadState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "unauthorized"
  | "not_found";

export function getOperationsManualReviewTitle(): string {
  return "Manual Review";
}

export function getOperationsManualReviewDescription(): string {
  return "Read-only approval-oriented summary for operations review. Approve, reject and manual pricing actions are not implemented in this foundation slice.";
}

export function getOperationsApprovalActionsNotImplementedMessage(): string {
  return "Действия одобрения, отклонения и ручной корректировки цены пока не реализованы.";
}

export function getOperationsOrderReviewErrorMessage(): string {
  return "Не удалось загрузить данные для manual review.";
}

export function getOperationsOrderReviewNotFoundMessage(): string {
  return "Заявка не найдена.";
}
