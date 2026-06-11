import assert from "node:assert/strict";
import { calculatePrice, type ConfigState, validate } from "../src/configurator/context";
import { fromConfigState, buildCabinetGeometry } from "../src/constructor/geometry";
import { validateCustomer } from "../src/shared/lib/order";
import manifest from "../src/config/manifest.json";

type TestResult = { name: string; passed: boolean; error?: string };
const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (error) {
    results.push({ name, passed: false, error: error instanceof Error ? error.message : String(error) });
  }
}

function state(overrides: Partial<ConfigState> = {}): ConfigState {
  return {
    type: "wardrobe",
    width: 1800,
    height: 2400,
    depth: 600,
    sections: 2,
    filling: { shelves: 4, drawers: 0, hangingRod: true },
    bodyMaterialId: "white-matt",
    facadeMaterialId: "oak-natural",
  facadeMaterialKind: "ldsp",
    facadeStyleId: "no-handle",
    hardwareId: "comfort",
    activeStep: 0,
    checkoutOpen: false,
    checkoutMode: "order",
    highlightedPart: null,
    orderId: null,
    ...overrides,
  };
}

function orderPayloadLike(s: ConfigState) {
  const price = calculatePrice(s);
  return {
    productType: s.type ?? "wardrobe",
    dimensions: { width: s.width, height: s.height, depth: s.depth },
    sections: s.sections,
    filling: s.filling,
    materials: { bodyId: s.bodyMaterialId, facadeId: s.facadeMaterialId },
    style: { facadeStyleId: s.facadeStyleId, hardwareId: s.hardwareId },
    priceBreakdown: {
      body: price.body,
      facades: price.facades,
      filling: price.filling,
      hardware: price.hardware,
      production: price.production,
      delivery: price.delivery,
    },
    totalPrice: price.total,
    customer: { name: "Иван", phone: "+7 999 123-45-67", email: "test@example.com" },
    consent: { personalData: true, privacyVersion: "2026-05-24", acceptedAt: "2026-05-25T00:00:00.000Z" },
    configVersion: manifest.configVersion,
    source: "order",
  };
}

test("E2E smoke: wardrobe state builds production model and price", () => {
  const s = state();
  const project = fromConfigState(s, manifest.configVersion);
  const model = buildCabinetGeometry(project);
  const price = calculatePrice(s);

  assert.equal(project.productType, "wardrobe");
  assert.equal(model.schema, "razmerno.production-model.v3");
  assert.ok(model.panels.length > 0);
  assert.ok(model.totals.panelCount > 0);
  assert.ok(price.total > 0);
  assert.equal(model.meta.configVersion, manifest.configVersion);
});

test("E2E smoke: switching facade style keeps hardware level as client choice", () => {
  const noHandleBase = fromConfigState(state({ facadeStyleId: "no-handle", hardwareId: "base" }), "test");
  assert.equal(noHandleBase.structure.openingMode, "push-to-open");
  assert.equal(noHandleBase.structure.hardwareMode, "base");

  const regularComfort = fromConfigState(state({ facadeStyleId: "regular", hardwareId: "comfort" }), "test");
  assert.equal(regularComfort.structure.openingMode, "handle-soft-close");
  assert.equal(regularComfort.structure.hardwareMode, "comfort");
});

test("E2E smoke: order payload keeps dimensions, style and configVersion", () => {
  const s = state({ width: 2000, height: 2300, depth: 580, sections: 3, facadeStyleId: "regular", hardwareId: "base" });
  const payload = orderPayloadLike(s);

  assert.equal(payload.productType, "wardrobe");
  assert.deepEqual(payload.dimensions, { width: 2000, height: 2300, depth: 580 });
  assert.equal(payload.style.facadeStyleId, "regular");
  assert.equal(payload.style.hardwareId, "base");
  assert.equal(payload.configVersion, manifest.configVersion);
  assert.ok(payload.totalPrice > 0);
});

test("E2E smoke: customer validation blocks bad form states", () => {
  const invalid = validateCustomer({ name: "A", phone: "123", email: "bad" });
  assert.equal(invalid.name, "Укажите имя");
  assert.equal(invalid.phone, "Укажите российский номер в формате +7");
  assert.equal(invalid.email, "Email указан с ошибкой");

  const valid = validateCustomer({ name: "Анна", phone: "+7 999 123-45-67", email: "anna@example.ru" });
  assert.deepEqual(valid, {});
});

test("E2E smoke: constructor validation rejects too narrow section", () => {
  const s = state({ width: 1200, sections: 5 });
  const messages = validate(s);
  assert.ok(messages.some((m) => m.kind === "error" && m.field === "sections"));
});

console.log("");
console.log("UI/E2E smoke tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}
const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
