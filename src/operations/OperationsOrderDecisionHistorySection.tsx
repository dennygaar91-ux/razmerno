import { formatOperationsDate } from "../shared/operations/formatOperations";
import type { OperationsOrderReview } from "../shared/operations/reviewTypes";
import {
  formatOperationsDecisionHistoryActor,
  formatOperationsDecisionHistoryStatus,
  getOperationsDecisionHistoryEmptyMessage,
  getOperationsDecisionHistoryTitle,
} from "../shared/operations/reviewTypes";

export function OperationsOrderDecisionHistorySection({ review }: { review: OperationsOrderReview }) {
  const history = review.decisionHistory ?? [];

  return (
    <div className="rzm-card p-4 md:p-5">
      <div className="mb-1 font-semibold">{getOperationsDecisionHistoryTitle()}</div>

      {history.length === 0 ? (
        <p className="mt-2 text-[13px] leading-[1.55] text-[var(--rzm-text-muted)]">
          {getOperationsDecisionHistoryEmptyMessage()}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="rounded-[var(--rzm-radius-sm)] border border-[var(--rzm-line-soft)] px-3 py-2 text-[13px]"
            >
              <div className="font-medium">{formatOperationsDecisionHistoryStatus(entry)}</div>
              {entry.reason && (
                <div className="mt-1 text-[var(--rzm-text-muted)]">Причина: {entry.reason}</div>
              )}
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[var(--rzm-text-muted)]">
                <span>{formatOperationsDecisionHistoryActor(entry.changedBy)}</span>
                <span>{formatOperationsDate(entry.createdAt || null)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
