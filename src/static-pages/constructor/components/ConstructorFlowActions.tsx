export function ConstructorFlowActions({
  canGoBack,
  isCheckoutStep,
  submitStatus,
  submitMessage,
  onPreviousStep,
  onNextStep,
  onSubmit,
}: {
  canGoBack: boolean;
  isCheckoutStep: boolean;
  submitStatus: "idle" | "submitting" | "success" | "error";
  submitMessage: string;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rzm-constructor-submit rzm-constructor-submit--simple">
      <div className="rzm-constructor-flow-actions">
        {canGoBack && (
          <button className="rzm-secondary-cta rzm-constructor-back-btn" type="button" onClick={onPreviousStep}>
            Назад
          </button>
        )}

        {isCheckoutStep ? (
          <button className="rzm-cta rzm-constructor-submit-btn" type="button" disabled={submitStatus === "submitting"} onClick={onSubmit}>
            {submitStatus === "submitting" ? "Отправляем" : submitStatus === "success" ? "Отправлено" : "Отправить заявку"}
          </button>
        ) : (
          <button className="rzm-cta rzm-constructor-submit-btn" type="button" onClick={onNextStep}>
            Далее
          </button>
        )}
      </div>

      {submitMessage && submitStatus !== "idle" && (
        <div className="rzm-constructor-success">{submitMessage}</div>
      )}
    </div>
  );
}
