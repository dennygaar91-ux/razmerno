import { formatOperationsDate } from "../shared/operations/formatOperations";
import type { OperationsChangeRequest, OperationsOrderReview } from "../shared/operations/reviewTypes";
import {
  getOperationsChangeRequestStatusLabel,
  getOperationsChangeRequestsEmptyMessage,
  getOperationsChangeRequestsSectionTitle,
} from "../shared/operations/reviewTypes";

function OperationsChangeRequestItem({ request }: { request: OperationsChangeRequest }) {
  return (
    <li className="rounded-[16px] border border-[var(--rzm-line-soft)] bg-white/70 p-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <p className="font-semibold text-[var(--rzm-dark)]">{request.requestTypeLabel}</p>
        <p className="text-[12px] text-[var(--rzm-text-muted)]">
          {formatOperationsDate(request.createdAt)} · {getOperationsChangeRequestStatusLabel(request.status)}
        </p>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-[14px] leading-[1.55] text-[var(--rzm-dark)]">{request.message}</p>
    </li>
  );
}

export function OperationsChangeRequestsSection({ review }: { review: OperationsOrderReview }) {
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
            <OperationsChangeRequestItem key={request.id} request={request} />
          ))}
        </ul>
      )}
    </section>
  );
}
