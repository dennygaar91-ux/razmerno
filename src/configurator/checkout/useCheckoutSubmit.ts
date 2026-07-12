import { useState } from "react";
import type { ConfigState } from "../context";
import type { PriceBreakdown, CatalogPriceBreakdown } from "../../shared/lib/price";
import { submitOrder, validateCustomer } from "../../shared/lib/order";
import { validateDelivery, type DeliveryQuote } from "../../pricing/delivery";
import { validateAssembly, type AssemblyQuote } from "../../pricing/assembly";
import { buildCheckoutOrderPayload, type CheckoutCustomerDraft } from "./buildCheckoutOrderPayload";

export type CheckoutErrorKey = "name" | "phone" | "email" | "deliveryAddress" | "consent" | "submit";
export type CheckoutErrors = Partial<Record<CheckoutErrorKey, string>>;

export function useCheckoutSubmit({
  state,
  price,
  deliveryQuote,
  assemblyQuote,
  deliveryEnabled,
  deliveryAddress,
  assemblyEnabled,
  consentAccepted,
  onSuccess,
  accessToken,
}: {
  state: ConfigState;
  price: PriceBreakdown | CatalogPriceBreakdown;
  deliveryQuote: DeliveryQuote;
  assemblyQuote: AssemblyQuote;
  deliveryEnabled: boolean;
  deliveryAddress: string;
  assemblyEnabled: boolean;
  consentAccepted: boolean;
  onSuccess: (orderId: string) => void;
  accessToken?: string | null;
}) {
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(customer: CheckoutCustomerDraft) {
    const now = Date.now();
    const secondsSinceLastSubmit = state.lastSubmittedAt ? Math.floor((now - state.lastSubmittedAt) / 1000) : null;
    if (secondsSinceLastSubmit !== null && secondsSinceLastSubmit < 30) {
      setErrors({ submit: `Новую заявку можно отправить через ${30 - secondsSinceLastSubmit} сек.` });
      return;
    }

    const customerErrors = validateCustomer({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    });

    const nextErrors: CheckoutErrors = { ...customerErrors };
    const deliveryError = validateDelivery(deliveryEnabled, deliveryAddress);
    if (deliveryError) nextErrors.deliveryAddress = deliveryError;

    const assemblyError = validateAssembly(assemblyEnabled, price.total);
    if (assemblyError) nextErrors.submit = assemblyError;

    if (!consentAccepted) nextErrors.consent = "Нужно согласие на обработку персональных данных";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await submitOrder(buildCheckoutOrderPayload({
        state,
        price,
        deliveryQuote,
        assemblyQuote,
        customer,
        deliveryEnabled,
        deliveryAddress,
        assemblyEnabled,
        consentAccepted,
      }), { accessToken });

      if (result.ok && result.orderId) {
        onSuccess(result.orderId);
      } else {
        setErrors({ submit: result.error ?? "Не удалось отправить заявку. Попробуйте ещё раз." });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    errors,
    setErrors,
    isSubmitting,
    submit,
  };
}
