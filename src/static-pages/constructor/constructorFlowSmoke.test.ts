import { readFileSync } from "node:fs";
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

function prepareSubmitReadyState() {
  useConstructorStore.getState().reset();
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
  useConstructorStore.getState().setDeliveryAddress("РњРѕСЃРєРІР°, РІ РїСЂРµРґРµР»Р°С… РњРљРђР”");
  useConstructorStore.getState().setContact({
    name: "РРІР°РЅ",
    phone: "+7 (999) 111-22-33",
    email: "ivan@example.ru",
    company: "",
  });
  useConstructorStore.getState().setConsent(true);
}

test("constructor flow: step order stays sizes -> fill -> materials -> checkout", () => {
  assert(stepOrder.join(" > ") === "sizes > fill > materials > checkout", "Unexpected constructor step order");
});

test("constructor flow: Constructor3DPage keeps scene render mode store-owned", () => {
  const pageSource = readFileSync(new URL("../Constructor3DPage.tsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

  assert(
    pageSource.includes('const [sceneRenderMode, setSceneRenderMode] = useState') === false,
    "Constructor3DPage must not keep local sceneRenderMode state",
  );
  assert(
    pageSource.includes("advancedFill,\n      sceneRenderMode,\n      deliveryEnabled,"),
    "Constructor3DPage should read sceneRenderMode from useConstructorPageState values",
  );
  assert(
    pageSource.includes("setFacadeMaterial,\n      setSceneRenderMode,\n      setSceneViewMode,"),
    "Constructor3DPage should use store-owned setSceneRenderMode action",
  );
  assert(
    pageSource.includes('setSceneRenderMode("svg");'),
    "Constructor3DPage should switch fallback mode through store-owned svg render mode",
  );
});

test("constructor flow: SceneRuntimeStatus uses actual active runtime render mode", () => {
  const pageSource = readFileSync(new URL("../Constructor3DPage.tsx", import.meta.url), "utf8");

  assert(
    pageSource.includes('const activeRuntimeRenderMode = canRenderThree ? "three" : "blueprint";'),
    "Constructor3DPage should derive runtime status mode from the actual active scene branch",
  );
  assert(
    pageSource.includes("renderMode={activeRuntimeRenderMode}"),
    "SceneRuntimeStatus should receive active runtime render mode",
  );
  assert(
    pageSource.includes('renderMode={sceneRenderMode === "three" ? "three" : "blueprint"}') === false,
    "SceneRuntimeStatus must not derive renderMode from preferred sceneRenderMode only",
  );
});

test("constructor flow: submit success keeps model/configuration and does not reset store state", () => {
  const submitHookSource = readFileSync(new URL("./hooks/useConstructorSubmit.ts", import.meta.url), "utf8").replace(/\r\n/g, "\n");

  assert(
    submitHookSource.includes("if (result.ok) {\n      setSubmitStatus(\"success\");"),
    "useConstructorSubmit should keep an explicit success branch",
  );
  assert(
    submitHookSource.includes("onDraftSave();\n      return;"),
    "Successful submit should save draft state and return without reset side effects",
  );
  assert(
    submitHookSource.includes("useConstructorStore.getState().reset()") === false,
    "Submit success must not reset constructor store",
  );
  assert(
    submitHookSource.includes(".reset();") === false,
    "Submit success path must not call a reset helper",
  );
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

test("constructor flow: switching WebGL fallback mode does not mutate committed constructor domain state", () => {
  const store = useConstructorStore.getState();
  store.reset();
  store.setWidth(2050);
  store.setHeight(2500);
  store.setDepth(650);
  store.setSections(3);
  store.setCompartments(2);
  store.setMaterial("graphite");
  store.setFacadeMaterial("mdf-egger-r010-seryy-grafitovyy-ms");
  store.setHandleless(true);

  const before = createSnapshot();
  store.setSceneRenderMode("svg");
  store.setSceneViewMode("front");
  const after = createSnapshot();

  assert(after.width === before.width, "Fallback render mode must not mutate width");
  assert(after.height === before.height, "Fallback render mode must not mutate height");
  assert(after.depth === before.depth, "Fallback render mode must not mutate depth");
  assert(after.sections === before.sections, "Fallback render mode must not mutate sections");
  assert(after.compartments === before.compartments, "Fallback render mode must not mutate compartments");
  assert(after.material === before.material, "Fallback render mode must not mutate body material");
  assert(after.handleless === before.handleless, "Fallback render mode must not mutate style state");
});

test("constructor flow: three runtime retry path only touches runtime UI state", () => {
  const pageSource = readFileSync(new URL("../Constructor3DPage.tsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const retryMatch = pageSource.match(
    /const retryThreeScene = useCallback\(\(reduced = false\) => \{([\s\S]*?)\}, \[setSceneRenderMode\]\);/,
  );

  assert(retryMatch, "Constructor3DPage should define retryThreeScene recovery callback");
  const retryBody = retryMatch![1];
  assert(retryBody.includes("setForceReduced3D"), "Retry should optionally switch reduced 3D quality");
  assert(retryBody.includes('setSceneRenderMode("three")'), "Retry should re-enable three render mode");
  assert(retryBody.includes("setThreeFailureReason(null)"), "Retry should clear failure reason");
  assert(retryBody.includes("setThreeFailed(false)"), "Retry should clear failure flag");
  assert(retryBody.includes("setThreeRecoveryAttempt"), "Retry should bump recovery remount key");
  assert(!retryBody.includes("setWidth"), "Retry must not mutate width");
  assert(!retryBody.includes("setMaterial"), "Retry must not mutate material");
  assert(!retryBody.includes("canonicalState"), "Retry must not touch committed canonical state");
});

test("constructor flow: three runtime failure handlers do not mutate committed constructor domain state", () => {
  const pageSource = readFileSync(new URL("../Constructor3DPage.tsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const errorMatch = pageSource.match(
    /const handleThreeRuntimeError = useCallback\(\s*\(reason\?: ThreeRuntimeFailureReason\) => \{([\s\S]*?)\},\s*\[\],\s*\);/,
  );
  const readyMatch = pageSource.match(
    /const handleThreeReady = useCallback\(\(\) => \{([\s\S]*?)\}, \[\]\);/,
  );

  assert(errorMatch, "Constructor3DPage should define handleThreeRuntimeError");
  assert(readyMatch, "Constructor3DPage should define handleThreeReady");
  const errorBody = errorMatch![1];
  const readyBody = readyMatch![1];
  assert(errorBody.includes("setThreeFailed(true)"), "Runtime error should mark three as failed");
  assert(errorBody.includes("setThreeFailureReason"), "Runtime error should record failure reason");
  assert(!errorBody.includes("setWidth"), "Runtime error must not mutate width");
  assert(!errorBody.includes("setSections"), "Runtime error must not mutate sections");
  assert(readyBody.includes("setThreeFailed(false)"), "Ready should clear runtime failure");
  assert(!readyBody.includes("setMaterial"), "Ready must not mutate material");

  const store = useConstructorStore.getState();
  store.reset();
  store.setWidth(1980);
  store.setSections(4);
  store.setMaterial("graphite");
  const before = createSnapshot();
  store.setSceneRenderMode("three");
  const after = createSnapshot();
  assert(after.width === before.width, "Three render mode preference must not mutate width");
  assert(after.sections === before.sections, "Three render mode preference must not mutate sections");
  assert(after.material === before.material, "Three render mode preference must not mutate material");
});

test("constructor flow: checkout snapshot creates production-safe order payload", () => {
  prepareSubmitReadyState();
  const snapshot = createSnapshot();
  const payload = buildOrderPayloadFromConstructor(snapshot, quote, {
    source: "constructor-flow-smoke",
  });

  assert(payload.customer.name === snapshot.contact.name, "Order payload should include committed customer name");
  assert(payload.customer.phone === snapshot.contact.phone, "Order payload should include committed customer phone");
  assert(payload.customer.email === snapshot.contact.email, "Order payload should include committed customer email");
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
  prepareSubmitReadyState();
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

test("constructor flow: reset returns to initial wizard state", () => {
  useConstructorStore.getState().reset();
  const state = useConstructorStore.getState();

  assert(state.step === "sizes", "Reset should return to sizes");
  assert(state.width === 1800, "Reset should restore initial width");
  assert(state.height === 2400, "Reset should restore initial height");
  assert(state.depth === 600, "Reset should restore initial depth");
  assert(state.contact.email === "", "Reset should clear contact email");
  assert(state.deliveryAddress === "", "Reset should clear delivery address");
  assert(state.consent === false, "Reset should clear consent");
  assert(state.deliveryEnabled === false, "Reset should clear delivery toggle");
  assert(state.assemblyEnabled === false, "Reset should clear assembly toggle");
});
