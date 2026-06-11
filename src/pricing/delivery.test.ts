import assert from "node:assert/strict";
import { calculateDeliveryQuote, validateDelivery } from "./delivery";

type TestResult = { name: string; passed: boolean; error?: string };
const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (e) {
    results.push({ name, passed: false, error: e instanceof Error ? e.message : String(e) });
  }
}

test("Delivery: disabled has zero price", () => {
  const quote = calculateDeliveryQuote(false, "");
  assert.equal(quote.price, 0);
});

test("Delivery: MKAD address costs 6000", () => {
  const quote = calculateDeliveryQuote(true, "Москва, Тверская 1");
  assert.equal(quote.zone, "mkad");
  assert.equal(quote.price, 6000);
});

test("Delivery: outside MKAD adds 50 rub/km", () => {
  const quote = calculateDeliveryQuote(true, "Московская область, Химки, за МКАД 20 км");
  assert.equal(quote.zone, "outside_mkad");
  assert.equal(quote.distanceKm, 20);
  assert.equal(quote.price, 7000);
});

test("Delivery: outside MKAD requires distance", () => {
  assert.equal(validateDelivery(true, "Московская область, Химки"), "Для доставки за МКАД укажите расстояние от МКАД в километрах");
});

test("Delivery: enabled address is required", () => {
  assert.equal(validateDelivery(true, ""), "Укажите адрес доставки");
  assert.equal(validateDelivery(false, ""), null);
});

console.log("");
console.log("Delivery tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
