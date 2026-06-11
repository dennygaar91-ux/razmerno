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

const contextSource = fs.readFileSync("src/configurator/context.tsx", "utf8");

test("Provider-store sync: ConfigProvider lazy-loads the Zustand bridge", () => {
  assert.ok(contextSource.includes('import("./store/configStoreBridge")'));
  assert.ok(!contextSource.includes('import("./store/configStore")'));
});

test("Provider-store sync: dispatch writes to reducer and store", () => {
  assert.ok(contextSource.includes("baseDispatch(action)"));
  assert.ok(contextSource.includes("dispatchToConfigStore(action)"));
});

test("Provider-store sync: provider state is mirrored to store", () => {
  assert.ok(contextSource.includes("mirrorConfigStateToStore(state)"));
  assert.ok(contextSource.includes("useEffect"));
});

console.log("");
console.log("Provider-store sync tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
