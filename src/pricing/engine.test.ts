import assert from "node:assert/strict";
import facadeStyles from "../config/facade-styles.json";
import hardwareItems from "../config/hardware.json";
import { calculateCatalogPrice, type CatalogPriceBreakdown } from "./engine";
import { calculatePrice as calculateFrontendPrice } from "../shared/lib/price";
import { buildConstructorMaterialPricingContext } from "./materialPricing";
import { calculateDeliveryQuote, validateDelivery } from "./delivery";
import { calculateAssemblyQuote } from "./assembly";
import { calculateServerPrice, withServerPrice } from "../../api/_shared/server-price";
import { toOrderDbInsert } from "../../api/_shared/order-db";
import type { OrderRequest } from "../../api/_shared/order-types";
import { buildCheckoutOrderPayload } from "../configurator/checkout/buildCheckoutOrderPayload";
import { initialState, makeCompatibleLayout, type ConfigState } from "../configurator/context";
import { pricingGoldenFixtures, pricingValidationFixtures, type PricingGoldenExpected, type PricingGoldenFixture } from "./pricingGoldenFixtures";

type TestResult = { name: string; passed: boolean; error?: string };
const results: TestResult[] = [];

type FacadeStyleConfig = { id: string; priceMultiplier: number };
type HardwareConfig = { id: string; basePrice: number; priceFactor: number };
type CatalogBodyProducer = "Kronospan" | "Egger" | "Eterno";
type CatalogFacadeProducer = CatalogBodyProducer | "AGT";
type CatalogFacadeKind = "ldsp" | "mdf";

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (e) {
    results.push({ name, passed: false, error: e instanceof Error ? e.message : String(e) });
  }
}

function findById<T extends { id: string }>(items: T[], id: string, label: string): T {
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error(`${label} not found: ${id}`);
  return item;
}

function calculateFrontendFixtureBasePrice(fixture: PricingGoldenFixture): CatalogPriceBreakdown {
  const materialPricingContext = buildConstructorMaterialPricingContext({
    bodyMaterialId: fixture.materials.bodyId,
    facadeMaterialId: fixture.materials.facadeId,
  });
  const facadeStyle = findById(facadeStyles as FacadeStyleConfig[], fixture.style.facadeStyleId, "facade style");
  const hardware = findById(hardwareItems as HardwareConfig[], fixture.style.hardwareId, "hardware");

  return calculateFrontendPrice({
    type: fixture.productType,
    dimensions: fixture.dimensions,
    sections: fixture.sections,
    filling: fixture.filling,
    bodyProducer: materialPricingContext.body.producer as CatalogBodyProducer | undefined,
    bodyArticle: materialPricingContext.body.article,
    bodyThicknessMm: materialPricingContext.body.thicknessMm,
    facadeProducer: materialPricingContext.facade.producer as CatalogFacadeProducer | undefined,
    facadeArticle: materialPricingContext.facade.article,
    facadeThicknessMm: materialPricingContext.facade.thicknessMm,
    facadeMaterialKind: materialPricingContext.facade.materialKind as CatalogFacadeKind | undefined,
    bodyPricePerLiter: 0,
    facadePricePerLiter: 0,
    facadeStyleMultiplier: facadeStyle.priceMultiplier,
    hardwareBasePrice: hardware.basePrice,
    hardwarePriceFactor: hardware.priceFactor,
  });
}

function buildFixtureState(fixture: PricingGoldenFixture): ConfigState {
  return {
    ...initialState,
    type: fixture.productType,
    width: fixture.dimensions.width,
    height: fixture.dimensions.height,
    depth: fixture.dimensions.depth,
    sections: fixture.sections,
    filling: fixture.filling,
    layout: makeCompatibleLayout({
      type: fixture.productType,
      width: fixture.dimensions.width,
      height: fixture.dimensions.height,
      depth: fixture.dimensions.depth,
      sections: fixture.sections,
      filling: fixture.filling,
    }),
    bodyMaterialId: fixture.materials.bodyId,
    facadeMaterialId: fixture.materials.facadeId,
    facadeMaterialKind: fixture.materials.facadeKind,
    facadeStyleId: fixture.style.facadeStyleId,
    hardwareId: fixture.style.hardwareId,
    checkoutMode: "order",
  };
}

function buildFixturePayload(fixture: PricingGoldenFixture): OrderRequest {
  const frontendPrice = calculateFrontendFixtureBasePrice(fixture);
  const deliveryQuote = calculateDeliveryQuote(fixture.delivery.enabled, fixture.delivery.address);
  const assemblyQuote = calculateAssemblyQuote(fixture.assembly.enabled, frontendPrice.total);
  const payload = buildCheckoutOrderPayload({
    state: buildFixtureState(fixture),
    price: frontendPrice,
    deliveryQuote,
    assemblyQuote,
    customer: {
      name: "Test Customer",
      phone: "+70000000000",
      email: "pricing-parity@example.test",
      comment: "",
      honeypot: "",
    },
    deliveryEnabled: fixture.delivery.enabled,
    deliveryAddress: fixture.delivery.address,
    assemblyEnabled: fixture.assembly.enabled,
    consentAccepted: true,
  });

  return { ...payload, source: payload.source ?? "order" };
}

function toGoldenExpected(price: CatalogPriceBreakdown): PricingGoldenExpected {
  return {
    body: price.body,
    facades: price.facades,
    filling: price.filling,
    hardware: price.hardware,
    production: price.production,
    materials: price.materials,
    edgeBanding: price.edgeBanding,
    services: price.services,
    delivery: price.delivery,
    assembly: price.assembly ?? 0,
    total: price.total,
    source: price.source === "production-panels" ? "catalog" : price.source,
  };
}

function assertGoldenMatches(fixture: PricingGoldenFixture, actual: PricingGoldenExpected) {
  try {
    assert.deepEqual(actual, fixture.expected);
  } catch (error) {
    throw new Error([
      `Golden fixture mismatch: ${fixture.id}`,
      `Expected: ${JSON.stringify(fixture.expected)}`,
      `Actual:   ${JSON.stringify(actual)}`,
    ].join("\n"), { cause: error });
  }
}

test("Pricing engine: wardrobe has non-zero catalog breakdown", () => {
  const price = calculateCatalogPrice({
    type: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sections: 2,
    filling: { shelves: 4, drawers: 0, hangingRod: true },
    facadeStyleMultiplier: 1.15,
    hardwareLevel: "comfort",
  });

  assert.ok(price.total > 0);
  assert.ok(price.materials > 0);
  assert.ok(price.edgeBanding > 0);
  assert.ok(price.services > 0);
  assert.equal(price.delivery, 0);
  assert.equal(price.source, "catalog");
});

test("Pricing engine: drawers increase total", () => {
  const base = calculateCatalogPrice({
    type: "dresser",
    dimensions: { width: 1200, height: 900, depth: 450 },
    sections: 2,
    filling: { shelves: 1, drawers: 0, hangingRod: false },
    facadeStyleMultiplier: 1,
    hardwareLevel: "base",
  });
  const withDrawers = calculateCatalogPrice({
    type: "dresser",
    dimensions: { width: 1200, height: 900, depth: 450 },
    sections: 2,
    filling: { shelves: 1, drawers: 4, hangingRod: false },
    facadeStyleMultiplier: 1,
    hardwareLevel: "base",
  });

  assert.ok(withDrawers.total > base.total);
});

for (const fixture of pricingGoldenFixtures) {
  test(`Pricing parity: ${fixture.id} frontend = backend = payload = stored = golden`, () => {
    const frontendPrice = calculateFrontendFixtureBasePrice(fixture);
    const deliveryQuote = calculateDeliveryQuote(fixture.delivery.enabled, fixture.delivery.address);
    const assemblyQuote = calculateAssemblyQuote(fixture.assembly.enabled, frontendPrice.total);
    const frontendTotal = frontendPrice.total + deliveryQuote.price + assemblyQuote.price;
    const payload = buildFixturePayload(fixture);
    const serverPrice = calculateServerPrice(payload);
    const pricedPayload = withServerPrice({ ...payload, totalPrice: 1, priceBreakdown: { ...payload.priceBreakdown, total: 1 } }, serverPrice);
    const storedOrder = toOrderDbInsert({
      orderId: `GOLDEN-${fixture.id}`,
      body: pricedPayload,
      userAgent: "pricing-parity-test",
      clientIp: null,
    });

    assert.equal(payload.totalPrice, frontendTotal, "payload total must equal frontend quote total");
    assert.equal(serverPrice.total, frontendTotal, "backend total must equal frontend quote total");
    assert.equal(pricedPayload.totalPrice, serverPrice.total, "server-priced payload must equal backend total");
    assert.equal(storedOrder.total_price, serverPrice.total, "stored order must equal backend total");
    assert.deepEqual(pricedPayload.priceBreakdown, {
      body: serverPrice.body,
      facades: serverPrice.facades,
      filling: serverPrice.filling,
      hardware: serverPrice.hardware,
      production: serverPrice.production,
      delivery: serverPrice.delivery,
      assembly: serverPrice.assembly ?? 0,
      materials: serverPrice.materials,
      edgeBanding: serverPrice.edgeBanding,
      services: serverPrice.services,
    });
    assertGoldenMatches(fixture, toGoldenExpected(serverPrice));
  });
}

test("Pricing validation fixtures: delivery warning and error scenarios are deterministic", () => {
  for (const fixture of pricingValidationFixtures) {
    const quote = calculateDeliveryQuote(fixture.delivery.enabled, fixture.delivery.address);
    const validationError = validateDelivery(fixture.delivery.enabled, fixture.delivery.address);

    assert.equal(quote.price, fixture.expectedDeliveryPrice, fixture.id);
    assert.equal(quote.message, fixture.expectedDeliveryMessage, fixture.id);
    assert.equal(validationError, fixture.expectedValidationError, fixture.id);
  }
});

console.log("");
console.log("Pricing engine tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
