import { TextInput3D, StepIntro, ValidationAssist } from "./ConstructorDrawerPrimitives";
import type { ConstructorFormErrors, ContactState, ConstructorValidationState, QuoteState } from "../types";

export function Checkout3DStep({
  contact,
  errors,
  deliveryEnabled,
  assemblyEnabled,
  deliveryAddress,
  quote,
  quoteError,
  validation,
  formatPrice,
  onContactChange,
  onDeliveryEnabledChange,
  onAssemblyEnabledChange,
  onDeliveryAddressChange,
  onAutoFix,
}: {
  contact: ContactState;
  errors: ConstructorFormErrors;
  deliveryEnabled: boolean;
  assemblyEnabled: boolean;
  deliveryAddress: string;
  quote: QuoteState | null;
  quoteError: string;
  validation: ConstructorValidationState;
  formatPrice: (value: number) => string;
  onContactChange: (value: ContactState) => void;
  onDeliveryEnabledChange: (value: boolean) => void;
  onAssemblyEnabledChange: (value: boolean) => void;
  onDeliveryAddressChange: (value: string) => void;
  onAutoFix: (issueId?: string | null) => void;
}) {
  const completedContacts = [contact.name, contact.phone, contact.email].filter(
    (value) => value.trim(),
  ).length;
  const priceRows = [
    {
      label: "Материалы",
      value: quote ? formatPrice(quote.materials) : "Считаем",
    },
    {
      label: "Фурнитура",
      value: quote ? formatPrice(quote.hardwareAndFilling) : "Считаем",
    },
    { label: "Работы", value: quote ? formatPrice(quote.services) : "Считаем" },
    {
      label: "Доставка / сборка",
      value: quote ? formatPrice(quote.extra) : "Считаем",
    },
  ];
  return (
    <div
      className="rzm-3d-drawer-body rzm-3d-checkout rzm-3d-checkout--q7 rzm-3d-checkout--stage15"
      data-stage="checkout-polish"
      data-checkout-stage="STAGE15"
    >
      <StepIntro
        title="Заявка"
        text="Заполните контакты, проверьте условия и отправьте заявку без оплаты. Точная стоимость закреплена внизу панели."
      />

      <section className="rzm-3d-checkout-card">
        <header>
          <span>Контакты</span>
          <strong>{completedContacts}/3</strong>
        </header>
        <TextInput3D
          label="Имя"
          required
          value={contact.name}
          error={errors.name}
          autoComplete="name"
          onChange={(name) => onContactChange({ ...contact, name })}
        />
        <TextInput3D
          label="Телефон"
          required
          value={contact.phone}
          error={errors.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 999 000-00-00"
          onChange={(phone) => onContactChange({ ...contact, phone })}
        />
        <TextInput3D
          label="Email"
          required
          value={contact.email}
          error={errors.email}
          type="email"
          inputMode="email"
          autoComplete="email"
          onChange={(email) => onContactChange({ ...contact, email })}
        />
      </section>

      <section className="rzm-3d-checkout-card">
        <header>
          <span>Условия</span>
          <strong>Доставка и сборка</strong>
        </header>
        <label className="rzm-3d-toggle-row rzm-3d-checkout-toggle">
          <input
            type="checkbox"
            checked={deliveryEnabled}
            onChange={(event) => onDeliveryEnabledChange(event.target.checked)}
          />
          <span>
            <strong>Нужна доставка</strong>
            <small>Москва и МО, адрес нужен для расчёта.</small>
          </span>
        </label>
        {deliveryEnabled ? (
          <TextInput3D
            label="Адрес доставки"
            value={deliveryAddress}
            error={errors.deliveryAddress}
            autoComplete="street-address"
            onChange={onDeliveryAddressChange}
          />
        ) : null}
        <label className="rzm-3d-toggle-row rzm-3d-checkout-toggle">
          <input
            type="checkbox"
            checked={assemblyEnabled}
            onChange={(event) => onAssemblyEnabledChange(event.target.checked)}
          />
          <span>
            <strong>Нужна сборка</strong>
            <small>Стоимость добавляется к смете.</small>
          </span>
        </label>
      </section>

      <section className="rzm-3d-checkout-card rzm-3d-checkout-price">
        <header>
          <span>Смета</span>
          <strong>Детали расчёта</strong>
        </header>
        {quoteError ? (
          <p className="rzm-3d-checkout-warning">{quoteError}</p>
        ) : null}
        <div className="rzm-3d-checkout-price-list rzm-3d-checkout-price-list--stage14">
          {priceRows.map((row) => (
            <span key={row.label}>
              <b>{row.label}</b>
              <strong>{row.value}</strong>
            </span>
          ))}
        </div>
        <details className="rzm-3d-checkout-details">
          <summary>Состав заявки</summary>
          <p>
            {quote?.message ??
              "В заявку войдут размеры, секции, зоны, наполнение, материалы, доставка, сборка и контактные данные."}
          </p>
        </details>
        <div className="rzm-3d-price-note rzm-3d-price-note--stage14" role="note">
          Стоимость рассчитана по текущей конфигурации. Технические
          предупреждения относятся к проверке исполнения, а не к статусу цены.
        </div>
      </section>

      <ValidationAssist
        validation={validation}
        onAutoFix={onAutoFix}
        mode="checkout"
      />

      <div className="rzm-3d-checkout-submit-note" role="note">
        Согласие и кнопка отправки закреплены внизу панели рядом с точной
        стоимостью.
      </div>
    </div>
  );
}
