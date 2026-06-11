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

const source = fs.readFileSync("src/configurator/three/SelectedCompartmentHighlight.tsx", "utf8");

test("SelectedCompartmentHighlight migration: reads state via Zustand selector", () => {
  assert.ok(source.includes("useConfigStateSelector"));
  assert.ok(source.includes("const state = useConfigStateSelector()"));
});

test("SelectedCompartmentHighlight migration: no longer imports useConfig", () => {
  assert.ok(!source.includes('useConfig } from "../context"'));
});

test("SelectedCompartmentHighlight migration: selected compartment logic is preserved", () => {
  assert.ok(source.includes("selectedCompartmentId"));
  assert.ok(source.includes("state.layout.sections"));
  assert.ok(source.includes("wireframe"));
});

console.log("");
console.log("SelectedCompartmentHighlight Zustand read migration tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
