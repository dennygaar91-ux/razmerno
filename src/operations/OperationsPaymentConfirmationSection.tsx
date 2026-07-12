import { useState } from "react";
import type { OperationsOrderReview } from "../shared/operations/reviewTypes";
import {
  getOperationsPaymentConfirmationButtonLabel,
  getOperationsPaymentConfirmationErrorMessage,
  getOperationsPaymentConfirmationIneligibleMessage,
  getOperationsPaymentConfirmationNoteLabel,
  getOperationsPaymentConfirmationNotePlaceholder,
  getOperationsPaymentConfirmationSuccessMessage,
  getOperationsPaymentConfirmationTitle,
} from "../shared/operations/reviewTypes";
import { submitOperationsPaymentConfirmation } from "../shared/operations/operationsPaymentConfirmationApi";

export function OperationsPaymentConfirmationSection({
  review,
  accessToken,
  onConfirmationApplied,
}: {
  review: OperationsOrderReview;
  accessToken: string;
  onConfirmationApplied: () => Promise<void> | void;
}) {
  const [note, setNote] = useState("");
  const [actionState, setActionState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!review.paymentConfirmationAllowed) {
    return (
      <section className="rzm-card p-4 md:p-5" data-testid="operations-payment-confirmation-readonly">
        <div className="font-semibold">{getOperationsPaymentConfirmationTitle()}</div>
        <div className="mt-3 rzm-status" data-status="info">
          <span>{getOperationsPaymentConfirmationIneligibleMessage(review.domainStatus)}</span>
        </div>
      </section>
    );
  }

  const canAct = actionState !== "loading";

  async function handleConfirm() {
    setActionState("loading");
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await submitOperationsPaymentConfirmation(accessToken, {
      orderId: review.orderId,
      note: note.trim().length > 0 ? note.trim() : null,
    });

    if (!result.ok) {
      setActionState("error");
      setErrorMessage(result.message || getOperationsPaymentConfirmationErrorMessage());
      return;
    }

    setActionState("success");
    setSuccessMessage(getOperationsPaymentConfirmationSuccessMessage());
    await onConfirmationApplied();
  }

  return (
    <section className="rzm-card p-4 md:p-5" data-testid="operations-payment-confirmation">
      <div className="font-semibold">{getOperationsPaymentConfirmationTitle()}</div>
      <p className="mt-2 text-[13px] leading-[1.55] text-[var(--rzm-text-muted)]">
        Ручное подтверждение оплаты без платёжного провайдера.
      </p>

      <label className="mt-4 block text-[13px] font-medium" htmlFor="payment-confirmation-note">
        {getOperationsPaymentConfirmationNoteLabel()}
      </label>
      <textarea
        id="payment-confirmation-note"
        className="mt-2 w-full rounded-[var(--rzm-radius-sm)] border border-[var(--rzm-line-soft)] px-3 py-2 text-[14px]"
        rows={3}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={getOperationsPaymentConfirmationNotePlaceholder()}
        disabled={!canAct}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary focus-ring"
          onClick={() => void handleConfirm()}
          disabled={!canAct}
        >
          {getOperationsPaymentConfirmationButtonLabel()}
        </button>
      </div>

      {successMessage ? (
        <div className="mt-3 rzm-status" data-status="success" role="status">
          <span>{successMessage}</span>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-3 rzm-status" data-status="error" role="alert">
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </section>
  );
}
