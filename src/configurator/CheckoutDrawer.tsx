import { useState, useEffect } from "react";
import { useConfigBridge } from "./store/useConfigBridge";
import { calculateDeliveryQuote } from "../pricing/delivery";
import { calculateAssemblyQuote } from "../pricing/assembly";
import { CheckoutSuccess } from "./checkout/CheckoutSuccess";
import { CheckoutOrderSummary } from "./checkout/CheckoutOrderSummary";
import { CheckoutNextSteps } from "./checkout/CheckoutNextSteps";
import { CheckoutContactForm } from "./checkout/CheckoutContactForm";
import { CheckoutDeliveryBlock } from "./checkout/CheckoutDeliveryBlock";
import { CheckoutAssemblyBlock } from "./checkout/CheckoutAssemblyBlock";
import { CheckoutSubmitBlock } from "./checkout/CheckoutSubmitBlock";
import { useCheckoutSubmit } from "./checkout/useCheckoutSubmit";

/**
 * Форма заявки (п.11.2 ТЗ).
 * Реальная отправка вынесена в useCheckoutSubmit() → orderId → success экран.
 */
export function CheckoutDrawer() {
  const { state, actions, price, bodyMaterial, facadeMaterial, facadeStyle, hardware } = useConfigBridge();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [company, setCompany] = useState("");
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [assemblyEnabled, setAssemblyEnabled] = useState(false);
  const [consent, setConsent] = useState(false);
  const deliveryQuote = calculateDeliveryQuote(deliveryEnabled, deliveryAddress);
  const assemblyQuote = calculateAssemblyQuote(assemblyEnabled, price.total);
  const checkoutTotal = price.total + deliveryQuote.price + assemblyQuote.price;
  const {
    errors,
    setErrors,
    isSubmitting,
    submit,
  } = useCheckoutSubmit({
    state,
    price,
    deliveryQuote,
    assemblyQuote,
    deliveryEnabled,
    deliveryAddress,
    assemblyEnabled,
    consentAccepted: consent,
    onSuccess: actions.setOrderId,
  });

  const clearError = (key: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Закрытие по Esc + блокировка скролла body
  useEffect(() => {
    if (!state.checkoutOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) actions.closeCheckout();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [state.checkoutOpen, isSubmitting, actions]);

  if (!state.checkoutOpen) return null;

  const close = () => {
    if (isSubmitting) return;
    actions.closeCheckout();
    if (state.orderId) actions.clearOrderStatus();
  };

  const handleSubmit = async () => {
    await submit({
      name,
      phone,
      email,
      comment,
      honeypot: company,
    });
  };

  const handleClose = () => {
    setName(""); setPhone(""); setEmail(""); setComment(""); setCompany(""); setDeliveryEnabled(false); setDeliveryAddress(""); setAssemblyEnabled(false); setConsent(false); setErrors({});
    actions.closeCheckout();
    actions.clearOrderStatus();
  };

  const success = !!state.orderId;
  const isConsult = state.checkoutMode === "consultation";

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Закрыть"
        onClick={close}
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] motion-soft"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Заявка на проект"
        className="absolute right-0 top-0 bottom-0 w-full md:w-[440px] bg-[var(--rzm-surface-canvas)] shadow-[0_24px_80px_rgba(0,0,0,0.16)] overflow-y-auto flex flex-col"
        style={{ animation: "checkoutIn 320ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        <style>{`@keyframes checkoutIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-[rgba(255,253,248,0.95)] backdrop-blur px-4 md:px-6 py-3.5 md:py-4 flex items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--rzm-text-muted)]">
              {success ? "Готово" : isConsult ? "Короткая консультация" : "Финальный шаг"}
            </div>
            <h2 className="font-display text-[18px] md:text-[20px] font-semibold text-[var(--rzm-text-main)] mt-0.5">
              {success ? "Ваш шкаф собран" : isConsult ? "Подскажем, что и как" : "Оставьте контакты для проверки"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={close}
            disabled={isSubmitting}
            className="w-10 h-10 rounded-full hover:bg-[var(--rzm-surface-soft)] grid place-items-center focus-ring disabled:opacity-50 motion-soft"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {success ? <CheckoutSuccess orderId={state.orderId!} onClose={handleClose} /> : (
          <div className="flex-1 px-4 md:px-6 py-4 md:py-6">
            <CheckoutOrderSummary
              state={state}
              checkoutTotal={checkoutTotal}
              bodyMaterial={bodyMaterial}
              facadeMaterial={facadeMaterial}
              facadeStyle={facadeStyle}
              hardware={hardware}
              assemblyEnabled={assemblyEnabled}
              assemblyQuote={assemblyQuote}
            />

            <CheckoutNextSteps />

            {/* Form */}
            <div className="space-y-3.5 md:space-y-4">
              <CheckoutContactForm
                name={name}
                phone={phone}
                email={email}
                company={company}
                errors={errors}
                onNameChange={setName}
                onPhoneChange={setPhone}
                onEmailChange={setEmail}
                onCompanyChange={setCompany}
                clearError={clearError}
              />
              <CheckoutDeliveryBlock
                enabled={deliveryEnabled}
                address={deliveryAddress}
                quote={deliveryQuote}
                error={errors.deliveryAddress}
                onEnabledChange={setDeliveryEnabled}
                onAddressChange={setDeliveryAddress}
                clearError={clearError}
              />

              <CheckoutAssemblyBlock
                enabled={assemblyEnabled}
                quote={assemblyQuote}
                onEnabledChange={setAssemblyEnabled}
              />

              <div>
                <label className="block text-[12px] font-medium text-[var(--rzm-text-main)] mb-1.5">
                  Комментарий <span className="text-[var(--rzm-text-subtle)] font-normal">(не обязательно)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Дополнительные пожелания или вопросы"
                  className="w-full min-h-[112px] bg-white border border-transparent focus:border-[var(--rzm-text-main)] outline-none rounded-[16px] px-4 py-3 text-[14px] resize-none transition-colors focus-ring"
                />
              </div>
            </div>

            <CheckoutSubmitBlock
              consent={consent}
              error={errors.consent}
              submitError={errors.submit}
              isSubmitting={isSubmitting}
              onConsentChange={setConsent}
              clearError={clearError}
              onSubmit={() => void handleSubmit()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
