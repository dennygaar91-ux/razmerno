import type { CheckoutErrors } from "./useCheckoutSubmit";
import { CheckoutField } from "./CheckoutField";

export function CheckoutContactForm({
  name,
  phone,
  email,
  company,
  errors,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onCompanyChange,
  clearError,
}: {
  name: string;
  phone: string;
  email: string;
  company: string;
  errors: CheckoutErrors;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  clearError: (key: keyof CheckoutErrors) => void;
}) {
  return (
    <>
      <div className="hidden" aria-hidden="true">
        <label>
          Компания
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => onCompanyChange(e.target.value)}
          />
        </label>
      </div>
      <CheckoutField
        label="Имя"
        value={name}
        onChange={(value) => {
          onNameChange(value);
          if (errors.name) clearError("name");
        }}
        error={errors.name}
        placeholder="Как к вам обращаться"
        autoComplete="name"
        required
      />
      <CheckoutField
        label="Телефон"
        type="tel"
        value={phone}
        onChange={(value) => {
          onPhoneChange(value);
          if (errors.phone) clearError("phone");
        }}
        error={errors.phone}
        placeholder="+7 999 123-45-67"
        autoComplete="tel"
        required
      />
      <CheckoutField
        label="Email"
        type="email"
        value={email}
        onChange={(value) => {
          onEmailChange(value);
          if (errors.email) clearError("email");
        }}
        error={errors.email}
        placeholder="mail@example.ru"
        autoComplete="email"
        required
      />
    </>
  );
}
