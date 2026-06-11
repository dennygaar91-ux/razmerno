import type { ConstructorFormErrors } from "../types";
import { FieldError } from "./shared";

export function CheckoutOptionsCard({
  deliveryEnabled,
  assemblyEnabled,
  deliveryAddress,
  errors,
  onDeliveryEnabledChange,
  onAssemblyEnabledChange,
  onDeliveryAddressChange,
}: {
  deliveryEnabled: boolean;
  assemblyEnabled: boolean;
  deliveryAddress: string;
  errors: ConstructorFormErrors;
  onDeliveryEnabledChange: (value: boolean) => void;
  onAssemblyEnabledChange: (value: boolean) => void;
  onDeliveryAddressChange: (value: string) => void;
}) {
  return (
    <section className="rzm-constructor-card rzm-constructor-card--compact rzm-checkout-options-card rzm-r18-options-card rzm-r28-options-card">
      <div className="rzm-r18-section-head rzm-r28-section-head">
        <div>
          <span className="rzm-r18-section-kicker">Услуги</span>
          <h2 className="rzm-constructor-card-title">Доставка и сборка</h2>
        </div>
      </div>

      <div className="rzm-checkout-options-grid rzm-r18-options-grid rzm-r28-options-grid">
        <div className={`rzm-checkout-option rzm-r18-option rzm-r28-option ${deliveryEnabled ? "is-active" : ""}`}>
          <div>
            <h3>Доставка</h3>
            <p className="rzm-step-text">Москва и МО</p>
          </div>
          <label className="rzm-constructor-toggle" aria-label="Нужна доставка">
            <input className="rzm-constructor-toggle-input" type="checkbox" checked={deliveryEnabled} onChange={(event) => onDeliveryEnabledChange(event.target.checked)} />
            <span className="rzm-constructor-toggle-track"><span className="rzm-constructor-toggle-thumb" /></span>
          </label>
        </div>

        <div className={`rzm-checkout-option rzm-r18-option rzm-r28-option ${assemblyEnabled ? "is-active" : ""}`}>
          <div>
            <h3>Сборка</h3>
            <p className="rzm-step-text">+10% к мебели</p>
          </div>
          <label className="rzm-constructor-toggle" aria-label="Нужна сборка">
            <input className="rzm-constructor-toggle-input" type="checkbox" checked={assemblyEnabled} onChange={(event) => onAssemblyEnabledChange(event.target.checked)} />
            <span className="rzm-constructor-toggle-track"><span className="rzm-constructor-toggle-thumb" /></span>
          </label>
        </div>
      </div>

      {deliveryEnabled ? (
        <label className="rzm-checkout-address rzm-r18-checkout-address rzm-r28-checkout-address">
          <span className="rzm-constructor-label">Адрес доставки</span>
          <input
            className={`rzm-constructor-input rzm-constructor-input--text rzm-delivery-address ${errors.deliveryAddress ? "is-error" : ""}`}
            placeholder="Город, улица, дом, квартира"
            value={deliveryAddress}
            autoComplete="street-address"
            aria-invalid={errors.deliveryAddress ? "true" : undefined}
            onChange={(event) => onDeliveryAddressChange(event.target.value)}
          />
          <FieldError message={errors.deliveryAddress} />
        </label>
      ) : null}
    </section>
  );
}
