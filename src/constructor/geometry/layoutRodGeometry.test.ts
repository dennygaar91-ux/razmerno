import assert from "node:assert/strict";
import { buildCabinetGeometry, fromConfigState } from "./index";
import type { ConfigState } from "../../configurator/context";

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

test("Layout rod geometry: rod is placed in selected compartment", () => {
  const state: ConfigState = {
    type: "wardrobe",
    width: 1800,
    height: 2400,
    depth: 600,
    sections: 3,
    filling: { shelves: 0, drawers: 0, hangingRod: true },
    layout: {
      sections: [
        { id: "section-1", widthMm: 600, compartments: [{ id: "section-1-compartment-1", kind: "empty", heightMm: 2400, shelves: 0, drawers: 0, hasRod: false }] },
        { id: "section-2", widthMm: 600, compartments: [{ id: "section-2-compartment-1", kind: "rod", heightMm: 1200, shelves: 0, drawers: 0, hasRod: true }, { id: "section-2-compartment-2", kind: "empty", heightMm: 1200, shelves: 0, drawers: 0, hasRod: false }] },
        { id: "section-3", widthMm: 600, compartments: [{ id: "section-3-compartment-1", kind: "empty", heightMm: 2400, shelves: 0, drawers: 0, hasRod: false }] },
      ],
    },
    advancedLayout: true,
    selectedCompartmentId: null,
    bodyMaterialId: "white-matt",
    facadeMaterialId: "oak-natural",
  facadeMaterialKind: "ldsp",
    facadeStyleId: "regular",
    hardwareId: "base",
    activeStep: 1,
    highlightedPart: null,
    checkoutOpen: false,
    checkoutMode: "order",
    orderId: null,
    lastSubmittedAt: null,
  };

  const project = fromConfigState(state, "test");
  const model = buildCabinetGeometry(project);
  const rods = model.hardware.filter((item) => item.type === "rod");
  const holders = model.hardware.filter((item) => item.type === "rod-holder");

  assert.equal(rods.length, 1);
  assert.equal(holders.length, 2);
  assert.ok(rods[0].name.includes("C2.1"));
  assert.ok(rods[0].position.xMm > 600);
  assert.ok(rods[0].position.xMm < 1200);
});

console.log("");
console.log("Layout rod geometry tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
