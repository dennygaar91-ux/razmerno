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
const fillingSource = fs.readFileSync("src/configurator/steps/FillingStep.tsx", "utf8");
const toggleSource = fs.readFileSync("src/configurator/steps/AdvancedLayoutToggle.tsx", "utf8");

test("Advanced layout: state and action exist", () => {
  assert.ok(contextSource.includes("advancedLayout: boolean"));
  assert.ok(contextSource.includes("SET_ADVANCED_LAYOUT"));
});

test("Advanced layout: UI toggle exists", () => {
  assert.ok(toggleSource.includes("export function AdvancedLayoutToggle"));
  assert.ok(toggleSource.includes("Точная настройка"));
});

test("Advanced layout: compartment editing gated by advanced mode", () => {
  assert.ok(toggleSource.includes("state.advancedLayout &&"));
  assert.ok(fillingSource.includes("state.advancedLayout && <CompartmentCountControl />"));
});

console.log("");
console.log("Advanced layout tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
