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

test("Deferred geometry: imports useDeferredValue", () => {
  assert.ok(source.includes("useDeferredValue"));
});

test("Deferred geometry: production model uses deferred state", () => {
  assert.ok(source.includes("const deferredState = useDeferredValue(state)"));
  assert.ok(source.includes("fromConfigState(deferredState"));
});

test("Deferred geometry: production model dependency is compact", () => {
  assert.ok(source.includes("}, [deferredState]);"));
  assert.ok(!source.includes("state.filling.shelves,"));
});

console.log("");
console.log("Deferred geometry tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
