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

const markerSource = fs.readFileSync("src/configurator/three/ThreeLayoutMarkers.tsx", "utf8");
const viewerSource = fs.readFileSync("src/configurator/three/ThreeViewer.tsx", "utf8");
const cssSource = fs.readFileSync("src/index.css", "utf8");

test("Three layout markers: component exists and uses Html overlays", () => {
  assert.ok(markerSource.includes("export function ThreeLayoutMarkers"));
  assert.ok(markerSource.includes("Html"));
});

test("Three layout markers: dispatches layout add actions", () => {
  assert.ok(markerSource.includes("actions.addSectionByWidth"));
  assert.ok(markerSource.includes("actions.addCompartmentByHeight"));
});

test("Three layout markers: visible only in advanced mode", () => {
  assert.ok(markerSource.includes("!state.advancedLayout"));
});

test("Three layout markers: mounted in viewer and styled", () => {
  assert.ok(viewerSource.includes("<ThreeLayoutMarkers />"));
  assert.ok(cssSource.includes(".three-plus-marker"));
});

console.log("");
console.log("Three layout marker tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
