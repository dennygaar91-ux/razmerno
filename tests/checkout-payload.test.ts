import assert from "node:assert/strict";
import { initialState } from "../src/configurator/context";
import { buildCheckoutOrderPayload } from "../src/configurator/checkout/buildCheckoutOrderPayload";

const payload = buildCheckoutOrderPayload({
  state: {
    ...initialState,
    type: "wardrobe",
    checkoutMode: "order",
    facadeMaterialKind: "mdf",
  },
  price: {
    total: 100000,
    body: 30000,
    facades: 25000,
    filling: 10000,
    hardware: 12000,
    production: 23000,
  },
  deliveryQuote: {
    enabled: true,
    address: "Москва, Тверская 1",
    zone: "mkad",
    distanceKm: 0,
    price: 6000,
    message: "Доставка в пределах МКАД",
  },
  assemblyQuote: {
    enabled: true,
    rate: 0.1,
    basePrice: 100000,
    price: 10000,
    message: "Сборка",
  },
  customer: {
    name: "Иван",
    phone: "+79999999999",
    email: "test@example.com",
    comment: "Комментарий",
    honeypot: "",
  },
  deliveryEnabled: true,
  deliveryAddress: "Москва, Тверская 1",
  assemblyEnabled: true,
  consentAccepted: true,
});

assert.equal(payload.productType, "wardrobe");
assert.equal(payload.materials.facadeKind, "mdf");
assert.equal(payload.totalPrice, 116000);
assert.equal(payload.delivery?.price, 6000);
assert.equal(payload.assembly?.price, 10000);
assert.equal(payload.priceBreakdown.materials, 55000);
assert.equal(payload.source, "order");

console.log("Checkout payload test passed.");
