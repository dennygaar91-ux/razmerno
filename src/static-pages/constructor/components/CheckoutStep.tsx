import type { ContactState, ConstructorFormErrors, ConstructorValidationState, QuoteState } from "../types";
import type { ConstructorSnapshot } from "../adapters/constructorPayload";
import { CheckoutConsentCard } from "./CheckoutConsentCard";
import { CheckoutContactCard } from "./CheckoutContactCard";
import { CheckoutOptionsCard } from "./CheckoutOptionsCard";
import { CheckoutPriceCard } from "./CheckoutPriceCard";
import { CheckoutProjectReviewCard } from "./CheckoutProjectReviewCard";

export function CheckoutStep({
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
  onContactChange,
  onConsentChange,
  onDeliveryEnabledChange,
  onAssemblyEnabledChange,
  onDeliveryAddressChange,
}: {
  contact: ContactState;
  errors: ConstructorFormErrors;
  consent: boolean;
  deliveryEnabled: boolean;
  assemblyEnabled: boolean;
  deliveryAddress: string;
  quote: QuoteState | null;
  quoteError: string;
  snapshot?: ConstructorSnapshot;
  validation?: ConstructorValidationState;
  formatPrice: (value: number) => string;
  onContactChange: (value: ContactState) => void;
  onConsentChange: (value: boolean) => void;
  onDeliveryEnabledChange: (value: boolean) => void;
  onAssemblyEnabledChange: (value: boolean) => void;
  onDeliveryAddressChange: (value: string) => void;
}) {
  return (
    <div className="rzm-constructor-step-panel rzm-checkout-step-v58 rzm-checkout-step--simple rzm-r18-checkout-flow rzm-r28-checkout-flow is-active">
      <CheckoutContactCard contact={contact} errors={errors} onContactChange={onContactChange} />
      <CheckoutOptionsCard
        deliveryEnabled={deliveryEnabled}
        assemblyEnabled={assemblyEnabled}
        deliveryAddress={deliveryAddress}
        errors={errors}
        onDeliveryEnabledChange={onDeliveryEnabledChange}
        onAssemblyEnabledChange={onAssemblyEnabledChange}
        onDeliveryAddressChange={onDeliveryAddressChange}
      />
      <CheckoutPriceCard quote={quote} quoteError={quoteError} formatPrice={formatPrice} />
      <CheckoutConsentCard consent={consent} error={errors.consent} onConsentChange={onConsentChange} />
      {snapshot && validation ? <CheckoutProjectReviewCard snapshot={snapshot} validation={validation} /> : null}
    </div>
  );
}
