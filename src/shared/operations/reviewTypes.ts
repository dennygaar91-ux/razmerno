export type OperationsManualPricingDraft = {
  orderId: string;
  manualTotalPrice: number;
  manualTotalPriceLabel: string;
  reason: string | null;
  status: "draft";
  updatedAt: string | null;
};

export type OperationsDecisionAudit = {
  decision: "approve" | "reject";
  reason: string | null;
  fromDomainStatus: string | null;
  toDomainStatus: string;
  changedBy: string;
  createdAt: string | null;
};

export type OperationsDecisionHistoryEntry = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  changedBy: string;
  createdAt: string;
};

export type OperationsChangeRequest = {
  id: string;
  requestType: string;
  requestTypeLabel: string;
  status: string;
  message: string;
  createdAt: string;
  decisionAllowed: boolean;
};

export type OperationsChangeRequestDecision = "reviewed" | "resolved" | "rejected";

export type OperationsOrderReview = {
  orderId: string;
  status: string;
  domainStatus: string;
  reviewDecisionAllowed: boolean;
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
  approvalActionsImplemented: boolean;
  manualPricingDraft: OperationsManualPricingDraft | null;
  latestDecisionAudit: OperationsDecisionAudit | null;
  decisionHistory: OperationsDecisionHistoryEntry[];
  changeRequests: OperationsChangeRequest[];
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
  return "Approval-oriented summary for operations review. Approve and reject update domain status through API; manual pricing draft remains separate.";
}

export function getOperationsApprovalActionsNotImplementedMessage(): string {
  return "Решение уже принято или недоступно для текущего статуса заказа.";
}

export function getOperationsDecisionIneligibleMessage(domainStatus: string): string {
  if (domainStatus === "Оплата" || domainStatus === "Отмена") {
    return "Решение уже принято";
  }
  return "Действия недоступны для текущего статуса";
}

export function getOperationsApproveButtonLabel(): string {
  return "Одобрить";
}

export function getOperationsRejectButtonLabel(): string {
  return "Отклонить";
}

export function getOperationsRejectReasonLabel(): string {
  return "Причина отклонения";
}

export function getOperationsRejectReasonPlaceholder(): string {
  return "Укажите причину отклонения";
}

export function getOperationsDecisionApprovedMessage(): string {
  return "Заказ одобрен для следующего внутреннего шага.";
}

export function getOperationsDecisionRejectedMessage(): string {
  return "Заказ отклонён на этапе ручной проверки.";
}

export function getOperationsDecisionErrorMessage(): string {
  return "Не удалось применить решение.";
}

export function getOperationsDecisionRejectReasonRequiredMessage(): string {
  return "Для отклонения укажите причину.";
}

export function getOperationsLatestDecisionAuditLabel(): string {
  return "Последнее решение (audit)";
}

export function getOperationsDecisionHistoryTitle(): string {
  return "История решений";
}

export function getOperationsDecisionHistoryEmptyMessage(): string {
  return "Решений пока нет";
}

export function formatOperationsDecisionHistoryActor(changedBy: string): string {
  if (changedBy === "operations:approve") return "Оператор · одобрение";
  if (changedBy === "operations:reject") return "Оператор · отклонение";
  if (changedBy === "admin") return "Admin";
  return changedBy;
}

export function formatOperationsDecisionHistoryStatus(entry: OperationsDecisionHistoryEntry): string {
  if (entry.fromStatus && entry.fromStatus !== entry.toStatus) {
    return `${entry.fromStatus} → ${entry.toStatus}`;
  }
  return entry.toStatus;
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

export function getOperationsChangeRequestsSectionTitle(): string {
  return "Запросы на изменение";
}

export function getOperationsChangeRequestsEmptyMessage(): string {
  return "Запросов на изменение от клиента пока нет.";
}

export function getOperationsChangeRequestStatusLabel(status: string): string {
  if (status === "submitted") return "Открыт";
  if (status === "reviewed") return "На рассмотрении";
  if (status === "resolved") return "Принят";
  if (status === "rejected") return "Отклонён";
  return status;
}

export function getOperationsChangeRequestReviewedButtonLabel(): string {
  return "На рассмотрении";
}

export function getOperationsChangeRequestResolvedButtonLabel(): string {
  return "Принять";
}

export function getOperationsChangeRequestRejectedButtonLabel(): string {
  return "Отклонить";
}

export function getOperationsChangeRequestDecisionSuccessMessage(decision: OperationsChangeRequestDecision): string {
  if (decision === "reviewed") return "Запрос отмечен как рассмотренный.";
  if (decision === "resolved") return "Запрос принят в работу.";
  return "Запрос отклонён.";
}

export function getOperationsChangeRequestDecisionErrorMessage(): string {
  return "Не удалось обработать запрос на изменение.";
}
