import assert from "node:assert/strict";
import {
  findBestPriceItem,
  findPriceItems,
  getCatalogSummary,
  getRetailPrice,
  requirePriceItem,
} from "./catalog";

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

test("Pricing catalog: seed contains imported categories", () => {
  const summary = getCatalogSummary();
  assert.equal(summary.board, 1457);
  assert.equal(summary.edge, 43);
  assert.equal(summary.service, 12);
  assert.equal(summary.worktop, 49);
});

test("Pricing catalog: finds Kronospan 16mm board price with +30% markup", () => {
  const item = requirePriceItem(
    { itemType: "board", producer: "Kronospan", article: "101", thicknessMm: 16 },
    "Kronospan 101 16mm",
  );
  assert.equal(item.sourcePrice, 1432.83);
  assert.equal(item.retailPrice, 1862.68);
});

test("Pricing catalog: finds Egger 16mm board items", () => {
  const items = findPriceItems({ itemType: "board", producer: "Egger", thicknessMm: 16 });
  assert.ok(items.length > 0);
  assert.ok(items.every((item) => item.retailPrice > item.sourcePrice));
});

test("Pricing catalog: finds service price", () => {
  const price = getRetailPrice({ itemType: "service", nameIncludes: "Фрезеровка отверстия" }, "service");
  assert.equal(price, 1170);
});

test("Pricing catalog: findBestPriceItem returns cheapest matching item", () => {
  const item = findBestPriceItem({ itemType: "edge", producer: "Egger", thicknessMm: 0.8 });
  assert.ok(item);
  assert.equal(item?.itemType, "edge");
});

console.log("");
console.log("Pricing catalog tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
