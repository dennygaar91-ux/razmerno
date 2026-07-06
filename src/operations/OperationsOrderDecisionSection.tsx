import { useState } from "react";
import type { OperationsOrderReview } from "../shared/operations/reviewTypes";
import {
  getOperationsApproveButtonLabel,
  getOperationsDecisionApprovedMessage,
  getOperationsDecisionErrorMessage,
  getOperationsDecisionRejectReasonRequiredMessage,
  getOperationsDecisionRejectedMessage,
  getOperationsLatestDecisionAuditLabel,
  getOperationsRejectButtonLabel,
  getOperationsRejectReasonLabel,
  getOperationsRejectReasonPlaceholder,
} from "../shared/operations/reviewTypes";
import {
  isOperationsRejectReasonValid,
  submitOperationsOrderDecision,
} from "../shared/operations/operationsOrderDecisionApi";

export function OperationsOrderDecisionSection({
  review,
  accessToken,
  onDecisionApplied,
}: {
  review: OperationsOrderReview;
  accessToken: string;
  onDecisionApplied: () => Promise<void> | void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionState, setActionState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canAct = review.reviewDecisionAllowed && actionState !== "loading";

  async function handleApprove() {
    setActionState("loading");
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await submitOperationsOrderDecision(accessToken, {
      orderId: review.orderId,
      decision: "approve",
      reason: null,
    });

    if (!result.ok) {
      setActionState("error");
      setErrorMessage(result.message || getOperationsDecisionErrorMessage());
      return;
    }

    setActionState("success");
    setSuccessMessage(getOperationsDecisionApprovedMessage());
    await onDecisionApplied();
  }

  async function handleReject() {
    if (!isOperationsRejectReasonValid(rejectReason)) {
      setActionState("error");
      setErrorMessage(getOperationsDecisionRejectReasonRequiredMessage());
      return;
    }

    setActionState("loading");
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await submitOperationsOrderDecision(accessToken, {
      orderId: review.orderId,
      decision: "reject",
      reason: rejectReason.trim(),
    });

    if (!result.ok) {
      setActionState("error");
      setErrorMessage(result.message || getOperationsDecisionErrorMessage());
      return;
    }

    setActionState("success");
    setSuccessMessage(getOperationsDecisionRejectedMessage());
    setShowRejectForm(false);
    await onDecisionApplied();
  }

  return (
    <div className="mt-5 border-t border-[var(--rzm-line-soft)] pt-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canAct}
          onClick={() => void handleApprove()}
          className="btn btn-primary focus-ring"
        >
          {actionState === "loading" && !showRejectForm ? "Применяю..." : getOperationsApproveButtonLabel()}
        </button>
        <button
          type="button"
          disabled={!canAct}
          onClick={() => {
            setShowRejectForm((value) => !value);
            setErrorMessage(null);
          }}
          className="btn btn-outline focus-ring"
        >
          {getOperationsRejectButtonLabel()}
        </button>
      </div>

      {showRejectForm && review.reviewDecisionAllowed && (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="rzm-field-label mb-2">{getOperationsRejectReasonLabel()}</span>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              className="control-field min-h-[96px] w-full px-4 py-3 outline-none"
              placeholder={getOperationsRejectReasonPlaceholder()}
            />
          </label>
          <button
            type="button"
            disabled={!canAct || !isOperationsRejectReasonValid(rejectReason)}
            onClick={() => void handleReject()}
            className="btn btn-outline focus-ring"
          >
            {actionState === "loading" && showRejectForm ? "Отклоняю..." : "Подтвердить отклонение"}
          </button>
        </div>
      )}

      {actionState === "success" && successMessage && (
        <div className="mt-3 rzm-status" data-status="success">
          <span>{successMessage}</span>
        </div>
      )}

      {actionState === "error" && errorMessage && (
        <div className="mt-3 rzm-status" data-status="error">
          <span>{errorMessage}</span>
        </div>
      )}

      {!review.reviewDecisionAllowed && (
        <p className="mt-3 text-[12px] leading-[1.55] text-[var(--rzm-text-muted)]">
          Решение недоступно: текущий domain status — {review.domainStatus}.
        </p>
      )}

      {review.latestDecisionAudit && (
        <div className="mt-4 rounded-[var(--rzm-radius-sm)] border border-[var(--rzm-line-soft)] px-3 py-2 text-[13px]">
          <div className="control-meta">{getOperationsLatestDecisionAuditLabel()}</div>
          <div className="mt-1">
            {review.latestDecisionAudit.decision === "approve" ? "Одобрено" : "Отклонено"}
            {review.latestDecisionAudit.reason ? ` · ${review.latestDecisionAudit.reason}` : ""}
          </div>
        </div>
      )}
    </div>
  );
}
