export type PaymentReadinessState = "awaiting_manual_confirmation" | "confirmed" | "not_applicable";

export function isCustomerPaymentInstructionsVisible(paymentState: PaymentReadinessState): boolean {
  return paymentState === "awaiting_manual_confirmation";
}

export function getCustomerPaymentInstructionsTitle(): string {
  return "Оплата";
}

export function getCustomerPaymentInstructionsVerifiedLine(): string {
  return "Заявка проверена";
}

export function getCustomerPaymentInstructionsAwaitingLine(): string {
  return "Ожидает оплаты";
}

export function getCustomerPaymentInstructionsManagerLine(): string {
  return "Менеджер свяжется с вами для подтверждения оплаты";
}
