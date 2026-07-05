import { useState } from "react";
import type { OperationsOrderReview } from "../shared/operations/reviewTypes";
import {
  getOperationsManualPricingDraftDescription,
  getOperationsManualPricingDraftInputLabel,
  getOperationsManualPricingDraftTitle,
  getOperationsManualPricingSaveButtonLabel,
  getOperationsManualPricingSaveNotImplementedMessage,
} from "../shared/operations/reviewTypes";

export function OperationsManualPricingDraftSection({ review }: { review: OperationsOrderReview }) {
  const [draftPrice, setDraftPrice] = useState("");

  return (
    <div className="rzm-card p-4 md:p-5">
      <div className="mb-1 font-semibold">{getOperationsManualPricingDraftTitle()}</div>
      <p className="mt-1 text-[13px] leading-[1.55] text-[var(--rzm-text-muted)]">
        {getOperationsManualPricingDraftDescription()}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 text-[13px] md:grid-cols-2">
        <PricingRow label="Текущая сумма" value={review.totalPriceLabel} />
        <PricingRow label="Pricing status" value={review.pricingLabel} />
        <PricingRow label="Pricing source" value={review.pricingSource} />
        <PricingRow label="Изделие" value={review.productSummary} />
        <PricingRow label="Pricing snapshot" value={review.pricingSnapshotSummary} />
        <PricingRow label="Breakdown summary" value={review.priceBreakdownSummary} />
        <PricingRow label="Доставка" value={review.deliverySummary} />
        <PricingRow label="Сборка" value={review.assemblySummary} />
      </div>

      <label className="mt-5 block">
        <span className="rzm-field-label mb-2">{getOperationsManualPricingDraftInputLabel()}</span>
        <input
          type="text"
          inputMode="decimal"
          value={draftPrice}
          onChange={(event) => setDraftPrice(event.target.value)}
          className="control-field w-full max-w-[320px] px-4 outline-none"
          placeholder={review.totalPriceLabel}
          aria-describedby="operations-manual-pricing-draft-note"
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled
          className="btn btn-primary focus-ring"
          aria-disabled="true"
          title="Not implemented"
        >
          {getOperationsManualPricingSaveButtonLabel()}
        </button>
        {draftPrice.trim().length > 0 && (
          <span className="text-[12px] text-[var(--rzm-text-muted)]">
            Локальный черновик: {draftPrice.trim()} (не сохранено)
          </span>
        )}
      </div>

      <p id="operations-manual-pricing-draft-note" className="mt-3 text-[12px] leading-[1.55] text-[var(--rzm-text-muted)]">
        {getOperationsManualPricingSaveNotImplementedMessage()}
      </p>
    </div>
  );
}

function PricingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--rzm-radius-sm)] border border-[var(--rzm-line-soft)] px-3 py-2">
      <div className="control-meta">{label}</div>
      <div className="mt-1 text-[14px] leading-[1.45]">{value}</div>
    </div>
  );
}
