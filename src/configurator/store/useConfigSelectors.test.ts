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

const source = fs.readFileSync("src/configurator/store/useConfigSelectors.ts", "utf8");

test("Zustand bridge: selector hooks are exported", () => {
  assert.ok(source.includes("useConfigStateSelector"));
  assert.ok(source.includes("useConfigDispatchSelector"));
  assert.ok(source.includes("useConfigPriceSelector"));
  assert.ok(source.includes("useConfigValidationSelector"));
  assert.ok(source.includes("useConfigMaterialsSelector"));
});

test("Zustand bridge: hooks use Zustand store selectors", () => {
  assert.ok(source.includes("useConfigStore(selectConfigState)"));
  assert.ok(source.includes("useConfigStore(selectDispatch)"));
});

test("Zustand bridge: derived selectors are memoized", () => {
  assert.ok(source.includes("useMemo"));
  assert.ok(source.includes("selectPrice"));
  assert.ok(source.includes("selectValidation"));
});

console.log("");
console.log("Zustand bridge tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
