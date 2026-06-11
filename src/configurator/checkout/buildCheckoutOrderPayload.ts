import type { OrderPayload } from "../../shared/lib/order";
import type { ConfigState } from "../context";
import type { PriceBreakdown, CatalogPriceBreakdown } from "../../shared/lib/price";
import { hasCatalogBreakdown } from "../../shared/lib/price";
import type { DeliveryQuote } from "../../pricing/delivery";
import type { AssemblyQuote } from "../../pricing/assembly";

export type CheckoutCustomerDraft = {
  name: string;
  phone: string;
  email: string;
  comment: string;
  honeypot: string;
};

export function buildCheckoutOrderPayload({
  state,
  price,
  deliveryQuote,
  assemblyQuote,
  customer,
  deliveryEnabled,
  deliveryAddress,
  assemblyEnabled,
  consentAccepted,
}: {
  state: ConfigState;
  price: PriceBreakdown | CatalogPriceBreakdown;
  deliveryQuote: DeliveryQuote;
  assemblyQuote: AssemblyQuote;
  customer: CheckoutCustomerDraft;
  deliveryEnabled: boolean;
  deliveryAddress: string;
  assemblyEnabled: boolean;
  consentAccepted: boolean;
}): Omit<OrderPayload, "utm" | "source"> & { source?: string } {
  const catalogPrice = hasCatalogBreakdown(price);
  const checkoutTotal = price.total + deliveryQuote.price + assemblyQuote.price;

  return {
    productType: state.type ?? "wardrobe",
    dimensions: { width: state.width, height: state.height, depth: state.depth },
    sections: state.sections,
    filling: state.filling,
    layout: state.layout,
    materials: {
      bodyId: state.bodyMaterialId,
      facadeId: state.facadeMaterialId,
      facadeKind: state.facadeMaterialKind,
    },
    style: {
      facadeStyleId: state.facadeStyleId,
      hardwareId: state.hardwareId,
    },
    priceBreakdown: {
      body: price.body,
      facades: price.facades,
      filling: price.filling,
      hardware: price.hardware,
      production: price.production,
      delivery: deliveryQuote.price,
      assembly: assemblyQuote.price,
      materials: catalogPrice ? price.materials : price.body + price.facades,
      edgeBanding: catalogPrice ? price.edgeBanding : 0,
      services: catalogPrice ? price.services : price.production,
    },
    totalPrice: checkoutTotal,
    customer: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      comment: customer.comment || undefined,
    },
    delivery: {
      enabled: deliveryEnabled,
      address: deliveryEnabled ? deliveryAddress : undefined,
      price: deliveryQuote.price,
    },
    assembly: {
      enabled: assemblyEnabled,
      price: assemblyQuote.price,
      rate: assemblyQuote.rate,
      basePrice: price.total,
    },
    consent: {
      personalData: consentAccepted,
      privacyVersion: "2026-05-24",
      acceptedAt: new Date().toISOString(),
    },
    source: state.checkoutMode,
    honeypot: customer.honeypot,
  };
}
