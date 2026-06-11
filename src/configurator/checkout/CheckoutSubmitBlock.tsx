import type { CheckoutErrors } from "./useCheckoutSubmit";

export function CheckoutSubmitBlock({
  consent,
  error,
  submitError,
  isSubmitting,
  onConsentChange,
  clearError,
  onSubmit,
}: {
  consent: boolean;
  error?: string;
  submitError?: string;
  isSubmitting: boolean;
  onConsentChange: (value: boolean) => void;
  clearError: (key: keyof CheckoutErrors) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      {submitError && (
        <div className="mt-4 p-3 rounded-[16px] bg-[var(--rzm-error-soft)] text-[13px] text-[var(--rzm-error-ink)]">
          {submitError}
        </div>
      )}

      <label className="mt-5 flex items-start gap-3 rounded-[18px] bg-[var(--rzm-surface-soft)] px-3.5 py-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => {
            onConsentChange(event.target.checked);
            if (error) clearError("consent");
          }}
          className="mt-0.5 h-4 w-4 accent-[var(--rzm-text-main)]"
        />
        <span className="text-[12px] leading-snug text-[var(--rzm-text-muted)]">
          Даю согласие на обработку контактных данных для связи по заявке.
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-[var(--rzm-text-main)] underline underline-offset-2">
            Политика конфиденциальности
          </a>
          . Без рассылок и спама.
          {error && <span className="mt-1 block text-[var(--rzm-error-ink)]" role="alert">{error}</span>}
        </span>
      </label>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="btn btn-primary w-full mt-5 focus-ring motion-soft"
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Отправляем заявку...
          </>
        ) : (
          <>
            Отправить и получить смету
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>
    </>
  );
}
