export type OperationsManualPricingDraft = {
  orderId: string;
  manualTotalPrice: number;
  manualTotalPriceLabel: string;
  reason: string | null;
  status: "draft";
  updatedAt: string | null;
};

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
  manualPricingDraft: OperationsManualPricingDraft | null;
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

export function getOperationsManualPricingDraftTitle(): string {
  return "Manual pricing draft";
}

export function getOperationsManualPricingDraftDescription(): string {
  return "Черновик ручной цены для операционной проверки. Это не финальная customer-facing цена и не одобрение заказа.";
}

export function getOperationsManualPricingSaveNotImplementedMessage(): string {
  return "Сохранение ручной цены пока не реализовано. Черновик остаётся только на экране.";
}

export function getOperationsManualPricingSavedMessage(): string {
  return "Черновик ручной цены сохранён. Это operations draft, не финальная цена для клиента.";
}

export function getOperationsManualPricingSaveErrorMessage(): string {
  return "Не удалось сохранить черновик ручной цены.";
}

export function getOperationsManualPricingReasonLabel(): string {
  return "Примечание (опционально)";
}

export function getOperationsManualPricingDraftInputLabel(): string {
  return "Черновик новой суммы";
}

export function getOperationsManualPricingSaveButtonLabel(): string {
  return "Сохранить ручную цену";
}
