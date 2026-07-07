import { AdminOrderDetailPage } from "../admin/AdminOrderDetailPage";
import type { AdminOrderDetailSummary } from "../admin/orderSummary";
import { OperationsChangeRequestsSection } from "./OperationsChangeRequestsSection";
import { OperationsManualPricingDraftSection } from "./OperationsManualPricingDraftSection";
import { OperationsOrderDecisionSection } from "./OperationsOrderDecisionSection";
import { OperationsOrderDecisionHistorySection } from "./OperationsOrderDecisionHistorySection";
import { formatOperationsDate } from "../shared/operations/formatOperations";
import { mapOperationsReviewToAdminDetailSummary } from "../shared/operations/mapOperationsReviewToAdminDetailSummary";
import type { OperationsOrderReview, OperationsOrderReviewLoadState } from "../shared/operations/reviewTypes";
import {
  getOperationsManualReviewDescription,
  getOperationsManualReviewTitle,
  getOperationsOrderReviewErrorMessage,
  getOperationsOrderReviewNotFoundMessage,
} from "../shared/operations/reviewTypes";
import { getOperationsOrderStatusLabel } from "../shared/operations/types";

export function OperationsManualReviewView({
  review,
  state,
  errorMessage,
  loading,
  accessToken,
  onBack,
  onDraftSaved,
  onDecisionApplied,
}: {
  review: OperationsOrderReview | null;
  state: OperationsOrderReviewLoadState;
  errorMessage: string | null;
  loading: boolean;
  accessToken: string;
  onBack: () => void;
  onDraftSaved: () => Promise<void> | void;
  onDecisionApplied: () => Promise<void> | void;
}) {
  if (state === "not_found" || (state === "success" && !review)) {
    return (
      <section className="mt-6 rzm-card p-4 md:p-5">
        <div className="eyebrow mb-2">{getOperationsManualReviewTitle()}</div>
        <p className="text-[14px] text-[var(--rzm-text-muted)]">{getOperationsOrderReviewNotFoundMessage()}</p>
        <button type="button" onClick={onBack} className="mt-4 btn btn-outline focus-ring">
          К очереди заявок
        </button>
      </section>
    );
  }

  if (state === "error" || state === "unauthorized") {
    return (
      <section className="mt-6 rzm-card p-4 md:p-5">
        <div className="eyebrow mb-2">{getOperationsManualReviewTitle()}</div>
        <div className="rzm-status" data-status="error">
          <span>{errorMessage ?? getOperationsOrderReviewErrorMessage()}</span>
        </div>
        <button type="button" onClick={onBack} className="mt-4 btn btn-outline focus-ring">
          К очереди заявок
        </button>
      </section>
    );
  }

  const detailSummary: AdminOrderDetailSummary | null = review
    ? mapOperationsReviewToAdminDetailSummary(review)
    : null;

  return (
    <section className="mt-6 space-y-4">
      <div className="rzm-card-soft p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="eyebrow mb-2">Operations Workspace · {getOperationsManualReviewTitle()}</div>
            <h2 className="font-display text-[26px] font-bold leading-[1] tracking-[-0.04em] md:text-[34px]">
              {review ? `Review ${review.orderId}` : "Загрузка review..."}
            </h2>
            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--rzm-text-muted)]">
              {getOperationsManualReviewDescription()}
            </p>
          </div>
          <button type="button" onClick={onBack} className="btn btn-outline focus-ring w-fit">
            К очереди заявок
          </button>
        </div>
      </div>

      {review && (
        <div className="rzm-card p-4 md:p-5">
          <div className="mb-1 font-semibold">Approval summary</div>
          <div className="mt-3 grid grid-cols-1 gap-2 text-[13px] md:grid-cols-2">
            <SummaryRow label="Статус" value={getOperationsOrderStatusLabel(review.status)} />
            <SummaryRow label="Domain status" value={review.domainStatus} />
            <SummaryRow label="Создана" value={formatOperationsDate(review.createdAt)} />
            <SummaryRow label="Обновлена" value={formatOperationsDate(review.updatedAt)} />
            <SummaryRow label="Клиент" value={review.customerNameMasked} />
            <SummaryRow label="Изделие" value={review.productSummary} />
            <SummaryRow label="Production review" value={review.productionReviewStatus} />
            <SummaryRow label="Сумма" value={review.totalPriceLabel} />
          </div>

          {review.approvalActionsImplemented && (
            <OperationsOrderDecisionSection
              review={review}
              accessToken={accessToken}
              onDecisionApplied={onDecisionApplied}
            />
          )}
        </div>
      )}

      {review && (
        <OperationsChangeRequestsSection review={review} />
      )}

      {review && (
        <OperationsManualPricingDraftSection
          review={review}
          accessToken={accessToken}
          onSaved={onDraftSaved}
        />
      )}

      {review && <OperationsOrderDecisionHistorySection review={review} />}

      <AdminOrderDetailPage summary={detailSummary} loading={loading} onBack={onBack} />
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--rzm-radius-sm)] border border-[var(--rzm-line-soft)] px-3 py-2">
      <div className="control-meta">{label}</div>
      <div className="mt-1 text-[14px] leading-[1.45]">{value}</div>
    </div>
  );
}
