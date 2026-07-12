import type { PaymentReadinessState } from "../../shared/workspace/paymentInstructionsTypes";
import {
  getCustomerPaymentInstructionsAwaitingLine,
  getCustomerPaymentInstructionsManagerLine,
  getCustomerPaymentInstructionsTitle,
  getCustomerPaymentInstructionsVerifiedLine,
  isCustomerPaymentInstructionsVisible,
} from "../../shared/workspace/paymentInstructionsTypes";

export function CustomerPaymentInstructionsSection({
  paymentState,
}: {
  paymentState: PaymentReadinessState;
}) {
  if (!isCustomerPaymentInstructionsVisible(paymentState)) {
    return null;
  }

  return (
    <section
      className="rzm-account-section"
      aria-labelledby="order-payment-instructions-title"
      data-testid="customer-payment-instructions"
    >
      <div className="rzm-account-section-head">
        <h2 id="order-payment-instructions-title">{getCustomerPaymentInstructionsTitle()}</h2>
      </div>
      <ul className="rzm-account-payment-instructions">
        <li>{getCustomerPaymentInstructionsVerifiedLine()}</li>
        <li>{getCustomerPaymentInstructionsAwaitingLine()}</li>
        <li>{getCustomerPaymentInstructionsManagerLine()}</li>
      </ul>
    </section>
  );
}
