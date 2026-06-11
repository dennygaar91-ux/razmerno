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

test("Layout drawers geometry: drawer fronts are built in selected section/compartment", () => {
  const state: ConfigState = {
    type: "wardrobe",
    width: 1800,
    height: 2400,
    depth: 600,
    sections: 3,
    filling: { shelves: 0, drawers: 4, hangingRod: false },
    layout: {
      sections: [
        {
          id: "section-1",
          widthMm: 600,
          compartments: [
            { id: "section-1-compartment-1", kind: "empty", heightMm: 2400, shelves: 0, drawers: 0, hasRod: false },
          ],
        },
        {
          id: "section-2",
          widthMm: 600,
          compartments: [
            { id: "section-2-compartment-1", kind: "drawers", heightMm: 1200, shelves: 0, drawers: 4, hasRod: false },
            { id: "section-2-compartment-2", kind: "empty", heightMm: 1200, shelves: 0, drawers: 0, hasRod: false },
          ],
        },
        {
          id: "section-3",
          widthMm: 600,
          compartments: [
            { id: "section-3-compartment-1", kind: "empty", heightMm: 2400, shelves: 0, drawers: 0, hasRod: false },
          ],
        },
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
  const fronts = model.panels.filter((panel) => panel.role === "drawer-front");

  assert.equal(fronts.length, 4);
  assert.ok(fronts.every((panel) => panel.name.startsWith("Фасад ящика 2.1")));
  assert.ok(fronts.every((panel) => panel.basis.userProperties.sectionIndex === 2));
  assert.ok(fronts.every((panel) => panel.basis.userProperties.compartmentIndex === 1));
});

console.log("");
console.log("Layout drawers geometry tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
