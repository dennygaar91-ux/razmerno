import assert from "node:assert/strict";
import { calculateCatalogPrice } from "./engine";

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

test("Pricing breakdown: exposes extended rows", () => {
  const price = calculateCatalogPrice({
    type: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sections: 2,
    filling: { shelves: 4, drawers: 2, hangingRod: true },
    facadeStyleMultiplier: 1.15,
    hardwareLevel: "comfort",
  });

  assert.ok(price.materials > 0);
  assert.ok(price.edgeBanding > 0);
  assert.ok(price.services > 0);
  assert.ok(price.body > 0);
  assert.ok(price.facades > 0);
  assert.ok(price.total > price.materials);
});

console.log("");
console.log("Pricing breakdown tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
