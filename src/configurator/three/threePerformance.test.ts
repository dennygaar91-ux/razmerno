import assert from "node:assert/strict";
import fs from "node:fs";

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

const source = fs.readFileSync("src/configurator/three/ThreeViewer.tsx", "utf8");

test("Three performance: Canvas uses demand frameloop", () => {
  assert.ok(source.includes('frameloop="demand"'));
});

test("Three performance: shadow map is reduced to 512", () => {
  assert.ok(source.includes("shadow-mapSize-width={512}"));
  assert.ok(source.includes("shadow-mapSize-height={512}"));
});

test("Three performance: contact shadows resolution is reduced", () => {
  assert.ok(source.includes("resolution={256}"));
});

test("Three performance: shadows can be disabled on mobile", () => {
  assert.ok(source.includes("shadowsEnabled"));
  assert.ok(source.includes("matchMedia"));
});

console.log("");
console.log("Three performance tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
