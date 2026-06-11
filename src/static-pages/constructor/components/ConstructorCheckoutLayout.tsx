import type { ConstructorFormErrors, ConstructorValidationState, ContactState, QuoteState, StepKey } from "../types";
import type { ConstructorSnapshot } from "../adapters/constructorPayload";
import { CheckoutStep } from "./CheckoutStep";
import { ConstructorFlowActions } from "./ConstructorFlowActions";
import { ConstructorStepper } from "./ConstructorStepper";

export function ConstructorCheckoutLayout({
  step,
  onStepChange,
  contact,
  errors,
  consent,
  deliveryEnabled,
  assemblyEnabled,
  deliveryAddress,
  quote,
  quoteError,
  snapshot,
  validation,
  formatPrice,
  submitStatus,
  submitMessage,
  onContactChange,
  onConsentChange,
  onDeliveryEnabledChange,
  onAssemblyEnabledChange,
  onDeliveryAddressChange,
  onPreviousStep,
  onSubmit,
}: {
  step: StepKey;
  onStepChange: (step: StepKey) => void;
  contact: ContactState;
  errors: ConstructorFormErrors;
  consent: boolean;
  deliveryEnabled: boolean;
  assemblyEnabled: boolean;
  deliveryAddress: string;
  quote: QuoteState | null;
  quoteError: string;
  snapshot: ConstructorSnapshot;
  validation: ConstructorValidationState;
  formatPrice: (value: number) => string;
  submitStatus: "idle" | "submitting" | "success" | "error";
  submitMessage: string;
  onContactChange: (contact: ContactState) => void;
  onConsentChange: (consent: boolean) => void;
  onDeliveryEnabledChange: (enabled: boolean) => void;
  onAssemblyEnabledChange: (enabled: boolean) => void;
  onDeliveryAddressChange: (address: string) => void;
  onPreviousStep: () => void;
  onSubmit: () => void;
}) {
  const blockingIssues = validation.issues.filter((issue) => issue.blocksCheckout);
  const contactErrors = [errors.name, errors.phone, errors.email, errors.deliveryAddress, errors.consent].filter(Boolean).length;
  const readyText = blockingIssues.length
    ? "Нужно исправить проект"
    : contactErrors
      ? "Проверьте поля заявки"
      : "Готово к отправке";

  return (
    <section className="rzm-constructor-checkout-shell rzm-r18-checkout-shell rzm-r28-checkout-shell">
      <div className="rzm-checkout-hero-panel rzm-r18-checkout-topbar rzm-r28-checkout-topbar">
        <ConstructorStepper value={step} onChange={onStepChange} />
        <div className="rzm-r18-checkout-titlebar rzm-r28-checkout-titlebar">
          <div>
            <span className="rzm-how-chip-title"><span className="rzm-chip-dot" />Заявка без оплаты</span>
            <h1>Проверьте контакты и отправьте проект</h1>
          </div>
          <div className="rzm-r18-topbar-price rzm-r28-topbar-price" aria-label="Итоговая стоимость">
            <span>Итого</span>
            <strong>{quote ? formatPrice(quote.total) : "Считаем"}</strong>
          </div>
        </div>
      </div>

      <div className="rzm-checkout-layout-grid rzm-r18-checkout-grid rzm-r28-checkout-grid">
        <CheckoutStep
          contact={contact}
          errors={errors}
          consent={consent}
          deliveryEnabled={deliveryEnabled}
          assemblyEnabled={assemblyEnabled}
          deliveryAddress={deliveryAddress}
          quote={quote}
          quoteError={quoteError}
          snapshot={snapshot}
          validation={validation}
          formatPrice={formatPrice}
          onContactChange={onContactChange}
          onConsentChange={onConsentChange}
          onDeliveryEnabledChange={onDeliveryEnabledChange}
          onAssemblyEnabledChange={onAssemblyEnabledChange}
          onDeliveryAddressChange={onDeliveryAddressChange}
        />

        <aside className="rzm-checkout-action-panel rzm-r18-action-panel rzm-r28-action-panel">
          <div className="rzm-checkout-final-price rzm-r18-final-price rzm-r28-final-price">
            <span>{readyText}</span>
            <strong>{quote ? formatPrice(quote.total) : "Считаем"}</strong>
            <p>Оплаты сейчас нет. После заявки менеджер проверит проект и свяжется с вами.</p>
          </div>

          <div className="rzm-r18-next-list rzm-r28-next-list" aria-label="Что будет после заявки">
            <span><i>1</i>Проверим размеры</span>
            <span><i>2</i>Уточним детали</span>
            <span><i>3</i>Согласуем запуск</span>
          </div>

          <ConstructorFlowActions
            canGoBack
            isCheckoutStep
            submitStatus={submitStatus}
            submitMessage={submitMessage}
            onPreviousStep={onPreviousStep}
            onNextStep={() => undefined}
            onSubmit={onSubmit}
          />
        </aside>
      </div>
    </section>
  );
}
