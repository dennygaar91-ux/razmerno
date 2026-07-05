import { useState } from "react";
import type { OperationsOrderReview } from "../shared/operations/reviewTypes";
import {
  isManualDraftPriceInputValid,
  parseManualDraftPriceInput,
  saveOperationsManualPricingDraft,
} from "../shared/operations/operationsManualPricingDraftApi";
import {
  getOperationsManualPricingDraftDescription,
  getOperationsManualPricingDraftInputLabel,
  getOperationsManualPricingDraftTitle,
  getOperationsManualPricingReasonLabel,
  getOperationsManualPricingSaveButtonLabel,
  getOperationsManualPricingSavedMessage,
  getOperationsManualPricingSaveErrorMessage,
} from "../shared/operations/reviewTypes";

export function OperationsManualPricingDraftSection({
  review,
  accessToken,
  onSaved,
}: {
  review: OperationsOrderReview;
  accessToken: string;
  onSaved: () => Promise<void> | void;
}) {
  const [draftPrice, setDraftPrice] = useState(
    review.manualPricingDraft ? String(review.manualPricingDraft.manualTotalPrice) : "",
  );
  const [reason, setReason] = useState(review.manualPricingDraft?.reason ?? "");
  const [saveState, setSaveState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValid = isManualDraftPriceInputValid(draftPrice);
  const canSave = isValid && saveState !== "loading";

  async function handleSave() {
    const manualTotalPrice = parseManualDraftPriceInput(draftPrice);
    if (!manualTotalPrice) {
      setSaveState("error");
      setErrorMessage(getOperationsManualPricingSaveErrorMessage());
      return;
    }

    setSaveState("loading");
    setErrorMessage(null);

    const result = await saveOperationsManualPricingDraft(accessToken, {
      orderId: review.orderId,
      manualTotalPrice,
      reason: reason.trim().length > 0 ? reason.trim() : null,
    });

    if (!result.ok) {
      setSaveState("error");
      setErrorMessage(result.message || getOperationsManualPricingSaveErrorMessage());
      return;
    }

    setSaveState("success");
    await onSaved();
  }

  return (
    <div className="rzm-card p-4 md:p-5">
      <div className="mb-1 font-semibold">{getOperationsManualPricingDraftTitle()}</div>
      <p className="mt-1 text-[13px] leading-[1.55] text-[var(--rzm-text-muted)]">
        {getOperationsManualPricingDraftDescription()}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 text-[13px] md:grid-cols-2">
        <PricingRow label="Текущая сумма (snapshot)" value={review.totalPriceLabel} />
        <PricingRow label="Pricing status" value={review.pricingLabel} />
        <PricingRow label="Pricing source" value={review.pricingSource} />
        <PricingRow label="Изделие" value={review.productSummary} />
        <PricingRow label="Pricing snapshot" value={review.pricingSnapshotSummary} />
        <PricingRow label="Breakdown summary" value={review.priceBreakdownSummary} />
        <PricingRow label="Доставка" value={review.deliverySummary} />
        <PricingRow label="Сборка" value={review.assemblySummary} />
      </div>

      {review.manualPricingDraft && (
        <div className="mt-4 rzm-status" data-status="warning">
          <span>
            Сохранённый operations draft: {review.manualPricingDraft.manualTotalPriceLabel}
            {review.manualPricingDraft.reason ? ` · ${review.manualPricingDraft.reason}` : ""}
          </span>
        </div>
      )}

      <label className="mt-5 block">
        <span className="rzm-field-label mb-2">{getOperationsManualPricingDraftInputLabel()}</span>
        <input
          type="text"
          inputMode="decimal"
          value={draftPrice}
          onChange={(event) => {
            setDraftPrice(event.target.value);
            if (saveState === "success") setSaveState("idle");
          }}
          className="control-field w-full max-w-[320px] px-4 outline-none"
          placeholder={review.totalPriceLabel}
          aria-describedby="operations-manual-pricing-draft-note"
        />
      </label>

      <label className="mt-4 block">
        <span className="rzm-field-label mb-2">{getOperationsManualPricingReasonLabel()}</span>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="control-field min-h-[88px] w-full max-w-[520px] px-4 py-3 outline-none"
          maxLength={500}
          placeholder="Manual review adjustment"
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canSave}
          onClick={() => void handleSave()}
          className="btn btn-primary focus-ring"
          aria-disabled={!canSave}
        >
          {saveState === "loading" ? "Сохраняю..." : getOperationsManualPricingSaveButtonLabel()}
        </button>
      </div>

      {saveState === "success" && (
        <div className="mt-3 rzm-status" data-status="success">
          <span>{getOperationsManualPricingSavedMessage()}</span>
        </div>
      )}

      {saveState === "error" && errorMessage && (
        <div className="mt-3 rzm-status" data-status="error">
          <span>{errorMessage}</span>
        </div>
      )}

      <p id="operations-manual-pricing-draft-note" className="mt-3 text-[12px] leading-[1.55] text-[var(--rzm-text-muted)]">
        Черновик сохраняется только как operations manual pricing draft. Статус заказа, production и оплата не изменяются.
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
