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
const editorSource = fs.readFileSync("src/configurator/steps/SelectedCompartmentEditor.tsx", "utf8");

test("Compartment editor: selected compartment state exists", () => {
  assert.ok(contextSource.includes("selectedCompartmentId"));
  assert.ok(contextSource.includes("SET_SELECTED_COMPARTMENT"));
});

test("Compartment editor: explicit editor exists", () => {
  assert.ok(editorSource.includes("function SelectedCompartmentEditor"));
  assert.ok(editorSource.includes("Наполнение выбранного отсека"));
});

test("Compartment editor: explicit options exist", () => {
  assert.ok(editorSource.includes('kind: "empty"'));
  assert.ok(editorSource.includes('kind: "shelves"'));
  assert.ok(editorSource.includes('kind: "drawers"'));
  assert.ok(editorSource.includes('kind: "rod"'));
});

console.log("");
console.log("Compartment editor tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
