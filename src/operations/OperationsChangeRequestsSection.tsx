import { useState } from "react";
import { formatOperationsDate } from "../shared/operations/formatOperations";
import type {
  OperationsChangeRequest,
  OperationsChangeRequestDecision,
  OperationsOrderReview,
} from "../shared/operations/reviewTypes";
import {
  getOperationsChangeRequestDecisionErrorMessage,
  getOperationsChangeRequestDecisionSuccessMessage,
  getOperationsChangeRequestRejectedButtonLabel,
  getOperationsChangeRequestResolvedButtonLabel,
  getOperationsChangeRequestReviewedButtonLabel,
  getOperationsChangeRequestStatusLabel,
  getOperationsChangeRequestsEmptyMessage,
  getOperationsChangeRequestsSectionTitle,
} from "../shared/operations/reviewTypes";
import { submitOperationsChangeRequestDecision } from "../shared/operations/operationsChangeRequestDecisionApi";

function OperationsChangeRequestItem({
  request,
  accessToken,
  onDecisionApplied,
}: {
  request: OperationsChangeRequest;
  accessToken: string;
  onDecisionApplied: () => Promise<void> | void;
}) {
  const [actionState, setActionState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDecision(decision: OperationsChangeRequestDecision) {
    setActionState("loading");
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await submitOperationsChangeRequestDecision(accessToken, {
      changeRequestId: request.id,
      decision,
    });

    if (!result.ok) {
      setActionState("error");
      setErrorMessage(result.message || getOperationsChangeRequestDecisionErrorMessage());
      return;
    }

    setActionState("success");
    setSuccessMessage(getOperationsChangeRequestDecisionSuccessMessage(decision));
    await onDecisionApplied();
  }

  return (
    <li className="rounded-[16px] border border-[var(--rzm-line-soft)] bg-white/70 p-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <p className="font-semibold text-[var(--rzm-dark)]">{request.requestTypeLabel}</p>
        <p className="text-[12px] text-[var(--rzm-text-muted)]">
          {formatOperationsDate(request.createdAt)} · {getOperationsChangeRequestStatusLabel(request.status)}
        </p>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-[14px] leading-[1.55] text-[var(--rzm-dark)]">{request.message}</p>

      {request.decisionAllowed ? (
        <div className="mt-4 flex flex-wrap gap-2" data-testid="operations-change-request-actions">
          {request.status === "submitted" ? (
            <button
              type="button"
              className="btn btn-outline focus-ring"
              disabled={actionState === "loading"}
              onClick={() => void handleDecision("reviewed")}
            >
              {getOperationsChangeRequestReviewedButtonLabel()}
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-primary focus-ring"
            disabled={actionState === "loading"}
            onClick={() => void handleDecision("resolved")}
          >
            {getOperationsChangeRequestResolvedButtonLabel()}
          </button>
          <button
            type="button"
            className="btn btn-outline focus-ring"
            disabled={actionState === "loading"}
            onClick={() => void handleDecision("rejected")}
          >
            {getOperationsChangeRequestRejectedButtonLabel()}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-[12px] text-[var(--rzm-text-muted)]" data-testid="operations-change-request-readonly">
          Запрос уже обработан.
        </p>
      )}

      {actionState === "success" && successMessage ? (
        <div className="mt-3 rzm-status" data-status="success">
          <span>{successMessage}</span>
        </div>
      ) : null}

      {actionState === "error" && errorMessage ? (
        <div className="mt-3 rzm-status" data-status="error">
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </li>
  );
}

export function OperationsChangeRequestsSection({
  review,
  accessToken,
  onDecisionApplied,
}: {
  review: OperationsOrderReview;
  accessToken: string;
  onDecisionApplied: () => Promise<void> | void;
}) {
  return (
    <section className="rzm-card p-4 md:p-5" data-testid="operations-change-requests-section">
      <div className="mb-1 font-semibold">{getOperationsChangeRequestsSectionTitle()}</div>
      <p className="text-[13px] leading-[1.55] text-[var(--rzm-text-muted)]">
        Клиентские запросы на изменение по этой заявке.
      </p>

      {review.changeRequests.length === 0 ? (
        <p className="mt-4 text-[14px] text-[var(--rzm-text-muted)]" data-testid="operations-change-requests-empty">
          {getOperationsChangeRequestsEmptyMessage()}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {review.changeRequests.map((request) => (
            <OperationsChangeRequestItem
              key={request.id}
              request={request}
              accessToken={accessToken}
              onDecisionApplied={onDecisionApplied}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
