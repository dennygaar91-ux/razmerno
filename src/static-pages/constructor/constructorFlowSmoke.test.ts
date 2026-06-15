import { validateOrderLayout } from "../../../api/_shared/layout-validation";
import { buildConstructorDraft, buildOrderPayloadFromConstructor, type ConstructorSnapshot } from "./adapters/constructorPayload";
import { stepOrder } from "./options";
import { useConstructorStore } from "./store/constructorStore";
import type { QuoteState } from "./types";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const quote: QuoteState = {
  total: 74200,
  materials: 42000,
  hardwareAndFilling: 11200,
  services: 15000,
  extra: 6000,
  message: "Доставка в пределах МКАД",
  price: {
    body: 18000,
    facades: 16000,
    filling: 5200,
    hardware: 6000,
    production: 9000,
    delivery: 0,
    total: 68200,
    isPreliminary: true,
    materials: 42000,
    edgeBanding: 3000,
    services: 12000,
    source: "catalog",
    debug: {
      bodyAreaM2: 1,
      facadeAreaM2: 1,
      backAreaM2: 1,
      edgeLengthM: 1,
      boardPriceM2: 1,
      facadePriceM2: 1,
      edgePriceM: 1,
    },
  },
  deliveryQuote: {
    enabled: true,
    address: "Москва, в пределах МКАД",
    zone: "mkad",
    distanceKm: 0,
    price: 6000,
    message: "Доставка в пределах МКАД",
  },
  assemblyQuote: {
    enabled: false,
    rate: 0.1,
    basePrice: 68200,
    price: 0,
    message: "Сборка не выбрана",
  },
  formatPrice: (value) => `${value} ₽`,
};

function createSnapshot(): ConstructorSnapshot {
  const state = useConstructorStore.getState();

  return {
    furniture: state.furniture,
    width: state.width,
    height: state.height,
    depth: state.depth,
    fill: state.fill,
    sections: state.sections,
    compartments: state.compartments,
    handleless: state.handleless,
    material: state.material,
    deliveryEnabled: state.deliveryEnabled,
    assemblyEnabled: state.assemblyEnabled,
    deliveryAddress: state.deliveryAddress,
    contact: state.contact,
    consent: state.consent,
  };
}

test("constructor flow: step order stays sizes -> fill -> materials -> checkout", () => {
  assert(stepOrder.join(" > ") === "sizes > fill > materials > checkout", "Unexpected constructor step order");
});

test("constructor flow: user can move through base wizard and keep configuration", () => {
  const store = useConstructorStore.getState();
  store.reset();

  assert(useConstructorStore.getState().step === "sizes", "Initial step should be sizes");

  useConstructorStore.getState().setWidth(2100);
  useConstructorStore.getState().setHeight(2450);
  useConstructorStore.getState().setDepth(650);
  useConstructorStore.getState().setStep("fill");

  useConstructorStore.getState().setSections(4);
  useConstructorStore.getState().setCompartments(3);
  useConstructorStore.getState().setFill("drawers");
  useConstructorStore.getState().setHandleless(true);
  useConstructorStore.getState().setStep("materials");

  useConstructorStore.getState().setMaterial("graphite");
  useConstructorStore.getState().setStep("checkout");

  useConstructorStore.getState().setDeliveryEnabled(true);
  useConstructorStore.getState().setDeliveryAddress("Москва, в пределах МКАД");
  useConstructorStore.getState().setContact({
    name: "Иван",
    phone: "+7 (999) 111-22-33",
    email: "ivan@example.ru",
    company: "",
  });
  useConstructorStore.getState().setConsent(true);

  const snapshot = createSnapshot();

  assert(!("step" in snapshot), "Snapshot must not contain UI-only step state");
  assert(useConstructorStore.getState().step === "checkout", "Final step should be checkout");
  assert(snapshot.width === 2100, "Width should persist through steps");
  assert(snapshot.height === 2450, "Height should persist through steps");
  assert(snapshot.depth === 650, "Depth should persist through steps");
  assert(snapshot.sections === 4, "Sections should persist through steps");
  assert(snapshot.compartments === 3, "Compartments should persist through steps");
  assert(snapshot.fill === "drawers", "Filling should persist through steps");
  assert(snapshot.handleless === true, "Handleless should persist through steps");
  assert(snapshot.material === "ldsp-egger-u780-seryy-monumentalnyy-st9", "Material should persist through steps as resolved real material id");
  assert(snapshot.deliveryEnabled === true, "Delivery toggle should persist");
  assert(snapshot.consent === true, "Consent should be true for submit-ready state");
});

test("constructor flow: checkout snapshot creates production-safe order payload", () => {
  const snapshot = createSnapshot();
  const payload = buildOrderPayloadFromConstructor(snapshot, quote, {
    source: "constructor-flow-smoke",
  });

  assert(payload.customer.name === "Иван", "Order payload should include customer name");
  assert(payload.customer.phone === "+7 (999) 111-22-33", "Order payload should include customer phone");
  assert(payload.customer.email === "ivan@example.ru", "Order payload should include customer email");
  assert(payload.productType === "wardrobe", "Order payload should use wardrobe product type");
  assert(payload.dimensions.width === 2100, "Order payload should keep width");
  assert(payload.filling.drawers === 4, "Drawers should follow sections for drawer filling");
  assert(payload.filling.hangingRod === false, "Drawer flow should not enable rod");
  assert(payload.totalPrice === quote.total, "Order payload should use quote total");
  assert(payload.source === "constructor-flow-smoke", "Order source should be preserved");

  const validationError = validateOrderLayout(payload.layout, payload.dimensions);
  assert(validationError === null, validationError ?? "Layout should be valid");
});

test("constructor flow: draft from checkout snapshot excludes PII", () => {
  const snapshot = createSnapshot();
  const draft = buildConstructorDraft(snapshot);
  const draftText = JSON.stringify(draft);

  assert(draft.dimensions[0] === 2100, "Draft should include configuration width");
  assert(draft.sections === 4, "Draft should include sections");
  assert(draft.filling === "drawers", "Draft should include filling");
  assert(!draftText.includes("Иван"), "Draft must not include name");
  assert(!draftText.includes("999"), "Draft must not include phone");
  assert(!draftText.includes("ivan@example.ru"), "Draft must not include email");
  assert(!draftText.includes("Москва"), "Draft must not include delivery address");
});

test("constructor flow: reset restores configuration and preserves current step", () => {
  useConstructorStore.getState().reset();
  const state = useConstructorStore.getState();

  assert(state.step === "checkout", "Reset should preserve current step");
  assert(state.width === 1800, "Reset should restore initial width");
  assert(state.height === 2400, "Reset should restore initial height");
  assert(state.depth === 600, "Reset should restore initial depth");
  assert(state.contact.email === "ivan@example.ru", "Reset should preserve contact email");
  assert(state.deliveryAddress === "Москва, в пределах МКАД", "Reset should preserve delivery address");
});
