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
const viewer = fs.readFileSync("src/configurator/three/ThreeViewer.tsx", "utf8");

test("Selected compartment highlight: component exists", () => {
  assert.ok(source.includes("export function SelectedCompartmentHighlight"));
  assert.ok(source.includes("selectedCompartmentId"));
});

test("Selected compartment highlight: uses translucent box and wireframe", () => {
  assert.ok(source.includes("opacity={0.08}"));
  assert.ok(source.includes("wireframe"));
});

test("Selected compartment highlight: mounted before plus markers", () => {
  assert.ok(viewer.includes("<SelectedCompartmentHighlight />"));
  assert.ok(viewer.indexOf("<SelectedCompartmentHighlight />") < viewer.indexOf("<ThreeLayoutMarkers />"));
});

test("Selected compartment highlight: highlight component depends on layout", () => {
  assert.ok(source.includes("state.layout.sections"));
});

console.log("");
console.log("Selected compartment highlight tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
