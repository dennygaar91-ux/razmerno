import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCabinetGeometry, fromConfigState } from "./index.js";

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

const project = fromConfigState({
  type: "wardrobe",
  width: 1800,
  height: 2400,
  depth: 600,
  sections: 2,
  filling: { shelves: 4, drawers: 2, hangingRod: true },
  bodyMaterialId: "white-matt",
  facadeMaterialId: "oak-natural",
  facadeMaterialKind: "ldsp",
  facadeStyleId: "no-handle",
  hardwareId: "comfort",
  layout: { sections: [] },
  advancedLayout: false,
  selectedCompartmentId: null,
  activeStep: 0,
  highlightedPart: null,
  checkoutOpen: false,
  checkoutMode: "order",
  orderId: null,
  lastSubmittedAt: null,
}, "test");

test("Geometry build context: repeated builds have deterministic ids", () => {
  const first = buildCabinetGeometry(project);
  const second = buildCabinetGeometry(project);

  assert.deepEqual(first.panels.map((p) => p.id), second.panels.map((p) => p.id));
  assert.deepEqual(first.hardware.map((h) => h.id), second.hardware.map((h) => h.id));
  assert.deepEqual(first.drilling.map((d) => d.id), second.drilling.map((d) => d.id));
});

test("Geometry build context: no reset counter imports remain in main builder", () => {
  const source = fs.readFileSync("src/constructor/geometry/buildCabinetGeometry.ts", "utf8");
  assert.ok(!source.includes("resetPanelCounter"));
  assert.ok(!source.includes("resetDrillingCounter"));
  assert.ok(source.includes("createGeometryBuildContext"));
});

console.log("");
console.log("Geometry build context tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
