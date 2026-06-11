import type { ContactState, ConstructorFormErrors } from "../types";
import { ContactField } from "./shared";

export function CheckoutContactCard({
  contact,
  errors,
  onContactChange,
}: {
  contact: ContactState;
  errors: ConstructorFormErrors;
  onContactChange: (value: ContactState) => void;
}) {
  const filledFields = [contact.name.trim(), contact.phone.trim(), contact.email.trim()].filter(Boolean).length;

  return (
    <section className="rzm-constructor-card rzm-checkout-contact-card rzm-r18-contact-card rzm-r28-contact-card">
      <div className="rzm-r18-section-head rzm-r28-section-head">
        <div>
          <span className="rzm-r18-section-kicker">Контакты</span>
          <h2 className="rzm-constructor-card-title">Куда отправить номер заявки</h2>
        </div>
        <span className="rzm-checkout-required rzm-r28-required">{filledFields}/3</span>
      </div>
      <div className="rzm-constructor-field-grid rzm-r18-contact-grid rzm-r28-contact-grid">
        <ContactField
          label="Имя"
          value={contact.name}
          placeholder="Ваше имя"
          error={errors.name}
          autoComplete="name"
          onChange={(name) => onContactChange({ ...contact, name })}
        />
        <ContactField
          label="Телефон"
          value={contact.phone}
          placeholder="+7 (___) ___-__-__"
          error={errors.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          onChange={(phone) => onContactChange({ ...contact, phone })}
        />
        <ContactField
          label="Email"
          value={contact.email}
          placeholder="mail@example.ru"
          error={errors.email}
          type="email"
          inputMode="email"
          autoComplete="email"
          onChange={(email) => onContactChange({ ...contact, email })}
        />
        <input
          className="rzm-honeypot"
          value={contact.company}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          onChange={(event) => onContactChange({ ...contact, company: event.target.value })}
        />
      </div>
    </section>
  );
}
