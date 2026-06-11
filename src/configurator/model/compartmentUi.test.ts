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

const countSource = fs.readFileSync("src/configurator/steps/CompartmentCountControl.tsx", "utf8");
const previewSource = fs.readFileSync("src/configurator/steps/LayoutPreview.tsx", "utf8");
const contextSource = fs.readFileSync("src/configurator/context.tsx", "utf8");

test("Compartment UI: has compartment count control", () => {
  assert.ok(countSource.includes("function CompartmentCountControl"));
  assert.ok(countSource.includes("Отсеки в секции"));
});

test("Compartment UI: has layout preview and compartment action", () => {
  assert.ok(previewSource.includes("function LayoutPreview"));
  assert.ok(contextSource.includes("SET_COMPARTMENT_KIND"));
  assert.ok(contextSource.includes("SET_LAYOUT"));
});

console.log("");
console.log("Compartment UI tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
