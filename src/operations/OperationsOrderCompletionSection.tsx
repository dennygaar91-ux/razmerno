import { useState } from "react";
import type { OperationsOrderReview } from "../shared/operations/reviewTypes";
import {
  getOperationsOrderCompletionButtonLabel,
  getOperationsOrderCompletionErrorMessage,
  getOperationsOrderCompletionIneligibleMessage,
  getOperationsOrderCompletionNoteLabel,
  getOperationsOrderCompletionNotePlaceholder,
  getOperationsOrderCompletionSuccessMessage,
  getOperationsOrderCompletionTitle,
} from "../shared/operations/reviewTypes";
import { submitOperationsOrderCompletion } from "../shared/operations/operationsOrderCompletionApi";

export function OperationsOrderCompletionSection({
  review,
  accessToken,
  onCompletionApplied,
}: {
  review: OperationsOrderReview;
  accessToken: string;
  onCompletionApplied: () => Promise<void> | void;
}) {
  const [note, setNote] = useState("");
  const [actionState, setActionState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!review.orderCompletionAllowed) {
    return (
      <section className="rzm-card p-4 md:p-5" data-testid="operations-order-completion-readonly">
        <div className="font-semibold">{getOperationsOrderCompletionTitle()}</div>
        <div className="mt-3 rzm-status" data-status="info">
          <span>{getOperationsOrderCompletionIneligibleMessage(review.domainStatus)}</span>
        </div>
      </section>
    );
  }

  const canAct = actionState !== "loading";

  async function handleComplete() {
    setActionState("loading");
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await submitOperationsOrderCompletion(accessToken, {
      orderId: review.orderId,
      note: note.trim().length > 0 ? note.trim() : null,
    });

    if (!result.ok) {
      setActionState("error");
      setErrorMessage(result.message || getOperationsOrderCompletionErrorMessage());
      return;
    }

    setActionState("success");
    setSuccessMessage(getOperationsOrderCompletionSuccessMessage());
    await onCompletionApplied();
  }

  return (
    <section className="rzm-card p-4 md:p-5" data-testid="operations-order-completion">
      <div className="font-semibold">{getOperationsOrderCompletionTitle()}</div>
      <p className="mt-2 text-[13px] leading-[1.55] text-[var(--rzm-text-muted)]">
        Ручное завершение заказа после этапа «В работе».
      </p>

      <label className="mt-4 block text-[13px] font-medium" htmlFor="order-completion-note">
        {getOperationsOrderCompletionNoteLabel()}
      </label>
      <textarea
        id="order-completion-note"
        className="mt-2 w-full rounded-[var(--rzm-radius-sm)] border border-[var(--rzm-line-soft)] px-3 py-2 text-[14px]"
        rows={3}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={getOperationsOrderCompletionNotePlaceholder()}
        disabled={!canAct}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary focus-ring"
          onClick={() => void handleComplete()}
          disabled={!canAct}
        >
          {getOperationsOrderCompletionButtonLabel()}
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
