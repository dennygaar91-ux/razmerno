import assert from "node:assert/strict";
import { calculateCatalogPrice } from "./engine";
import { calculateDeliveryQuote } from "./delivery";
import { getCatalogSummary } from "./catalog";

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

test("Final pricing smoke: catalog has enough imported data", () => {
  const summary = getCatalogSummary();
  assert.ok(summary.board >= 1400);
  assert.ok(summary.edge >= 40);
  assert.ok(summary.service >= 10);
});

test("Final pricing smoke: wardrobe with delivery returns realistic total", () => {
  const base = calculateCatalogPrice({
    type: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sections: 2,
    filling: { shelves: 4, drawers: 2, hangingRod: true },
    facadeStyleMultiplier: 1.15,
    hardwareLevel: "comfort",
  });
  const delivery = calculateDeliveryQuote(true, "Москва, ул. Ленина 1");
  const total = base.total + delivery.price;

  assert.ok(base.total > 25000);
  assert.ok(base.total < 250000);
  assert.equal(delivery.price, 6000);
  assert.equal(total, base.total + 6000);
});

test("Final pricing smoke: no delivery keeps delivery zero", () => {
  const base = calculateCatalogPrice({
    type: "nightstand",
    dimensions: { width: 500, height: 550, depth: 400 },
    sections: 1,
    filling: { shelves: 1, drawers: 2, hangingRod: false },
    facadeStyleMultiplier: 1,
    hardwareLevel: "base",
  });
  assert.equal(base.delivery, 0);
  assert.ok(base.total > 0);
});

console.log("");
console.log("Final pricing smoke tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
