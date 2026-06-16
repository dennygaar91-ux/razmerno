import { spawnSync } from "node:child_process";
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

console.log("");
console.log("Pricing engine tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);

if (failed > 0) {
  process.exit(1);
}

const parityResult = spawnSync(process.execPath, ["--no-warnings", "--import", "tsx", "tests/pricing-parity.test.ts"], {
  stdio: "inherit",
});

process.exit(parityResult.status ?? 1);
