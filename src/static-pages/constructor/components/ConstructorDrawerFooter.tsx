import type { ConstructorFormErrors, StepKey } from "../types";

export function ConstructorDrawerFooter({
  step,
  priceLabel,
  quoteStatus,
  checkoutBlocked,
  checkoutRequiredMissing,
  checkoutSubmitDisabled,
  submitStatus,
  submitMessage,
  isCooldownActive,
  cooldownRemainingMs,
  consent,
  errors,
  currentStepIndex,
  onConsentChange,
  onPrevious,
  onPrimaryAction,
}: {
  step: StepKey;
  priceLabel: string;
  quoteStatus: string;
  checkoutBlocked: boolean;
  checkoutRequiredMissing: boolean;
  checkoutSubmitDisabled: boolean;
  submitStatus: "idle" | "submitting" | "success" | "error";
  submitMessage: string;
  isCooldownActive: boolean;
  cooldownRemainingMs: number;
  consent: boolean;
  errors: ConstructorFormErrors;
  currentStepIndex: number;
  onConsentChange: (value: boolean) => void;
  onPrevious: () => void;
  onPrimaryAction: () => void;
}) {
  return (
    <div
      data-pricing-stage="STAGE14"
      className={`rzm-3d-price-block rzm-3d-drawer-footer ${step === "checkout" ? "is-checkout" : ""}`}
    >
      <div>
        <span>Точная стоимость</span>
        <strong>{priceLabel}</strong>
        <small
          className={`rzm-3d-price-status rzm-3d-status-badge rzm-3d-status-badge--price is-${quoteStatus === "calculating" ? "loading" : "ready"}`}
        >
          {quoteStatus === "calculating" ? "Пересчитываем..." : "Обновлено"}
        </small>
      </div>
      {step === "checkout" ? (
        <label
          className={`rzm-3d-consent rzm-3d-consent--footer ${errors.consent || !consent ? "is-error" : ""}`}
        >
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => onConsentChange(event.target.checked)}
          />
          <span>
            <strong>Согласен на обработку персональных данных</strong>
            <small>
              Заявка не является оплатой. Менеджер подтвердит технические детали.
            </small>
            {errors.consent ? <em>{errors.consent}</em> : null}
          </span>
        </label>
      ) : null}
      <div className="rzm-3d-drawer-actions">
        <button
          type="button"
          className="rzm-ui-btn rzm-ui-btn--secondary"
          aria-label="Вернуться на предыдущий шаг"
          disabled={currentStepIndex === 0}
          onClick={onPrevious}
        >
          Назад
        </button>
        <button
          type="button"
          className="is-primary rzm-ui-btn rzm-ui-btn--primary"
          aria-describedby="rzm-3d-primary-action-help"
          disabled={step === "checkout" ? checkoutSubmitDisabled : submitStatus === "submitting"}
          onClick={onPrimaryAction}
        >
          {getPrimaryActionLabel({
            step,
            checkoutBlocked,
            checkoutRequiredMissing,
            submitStatus,
            isCooldownActive,
            cooldownRemainingMs,
          })}
        </button>
      </div>
      <p id="rzm-3d-primary-action-help" aria-live="polite" className="rzm-3d-action-help">
        {getPrimaryActionHelp({
          step,
          checkoutBlocked,
          checkoutRequiredMissing,
          isCooldownActive,
          cooldownRemainingMs,
        })}
      </p>
      {step === "checkout" && submitMessage ? (
        <p className={`rzm-3d-submit-message is-${submitStatus}`} aria-live="polite">
          {submitMessage}
        </p>
      ) : null}
    </div>
  );
}

function getPrimaryActionLabel({
  step,
  checkoutBlocked,
  checkoutRequiredMissing,
  submitStatus,
  isCooldownActive,
  cooldownRemainingMs,
}: {
  step: StepKey;
  checkoutBlocked: boolean;
  checkoutRequiredMissing: boolean;
  submitStatus: "idle" | "submitting" | "success" | "error";
  isCooldownActive: boolean;
  cooldownRemainingMs: number;
}) {
  if (step !== "checkout") {
    return step === "sizes"
      ? "Перейти к наполнению"
      : step === "fill"
        ? "Выбрать материалы"
        : "Перейти к заявке";
  }
  if (checkoutBlocked) return "Исправьте замечания";
  if (checkoutRequiredMissing) return "Заполните заявку";
  if (submitStatus === "submitting") return "Отправляем";
  if (isCooldownActive) return `Повтор через ${Math.ceil(cooldownRemainingMs / 1000)} сек.`;
  if (submitStatus === "success") return "Отправлено";
  return "Отправить заявку";
}

function getPrimaryActionHelp({
  step,
  checkoutBlocked,
  checkoutRequiredMissing,
  isCooldownActive,
  cooldownRemainingMs,
}: {
  step: StepKey;
  checkoutBlocked: boolean;
  checkoutRequiredMissing: boolean;
  isCooldownActive: boolean;
  cooldownRemainingMs: number;
}) {
  if (checkoutBlocked) {
    return "Перед отправкой заявки нужно исправить замечания проверки.";
  }
  if (step === "checkout" && checkoutRequiredMissing) {
    return "Заполните имя, телефон, email и подтвердите согласие.";
  }
  if (step === "checkout" && isCooldownActive) {
    return `Повторная отправка будет доступна через ${Math.ceil(cooldownRemainingMs / 1000)} сек.`;
  }
  if (step === "checkout") {
    return "Заявка без оплаты — стоимость точная по текущей конфигурации, менеджер подтвердит технические детали.";
  }
  return "Основное действие текущего шага.";
}
