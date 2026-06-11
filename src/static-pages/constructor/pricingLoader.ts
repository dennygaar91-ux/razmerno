import type { PricingModules } from "./types";

let pricingPromise: Promise<PricingModules> | null = null;

export function loadPricingModules() {
  if (!pricingPromise) {
    pricingPromise = Promise.all([
      import("../../shared/lib/price"),
      import("../../pricing/delivery"),
      import("../../pricing/assembly"),
    ]).then(([price, delivery, assembly]) => ({
      calculatePrice: price.calculatePrice,
      formatPrice: price.formatPrice,
      calculateDeliveryQuote: delivery.calculateDeliveryQuote,
      validateDelivery: delivery.validateDelivery,
      calculateAssemblyQuote: assembly.calculateAssemblyQuote,
    }));
  }

  return pricingPromise;
}
