import { FieldError } from "./shared";

export function CheckoutConsentCard({
  consent,
  error,
  onConsentChange,
}: {
  consent: boolean;
  error?: string;
  onConsentChange: (value: boolean) => void;
}) {
  return (
    <section className="rzm-constructor-card rzm-constructor-card--compact rzm-checkout-consent-card rzm-r18-consent-card rzm-r28-consent-card">
      <label className={`rzm-consent-row rzm-r18-consent-row rzm-r28-consent-row ${error ? "is-error" : ""}`}>
        <input type="checkbox" checked={consent} aria-invalid={error ? "true" : undefined} onChange={(event) => onConsentChange(event.target.checked)} />
        <span>
          <b>Согласен на обработку персональных данных</b>
          <em>Заявка не является оплатой. Менеджер свяжется для проверки проекта.</em>
        </span>
      </label>
      <FieldError message={error} />
    </section>
  );
}
