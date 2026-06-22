import assert from "node:assert/strict";
import { buildCabinetGeometry, fromConfigState } from "./index.js";
import type { ConfigState } from "../../configurator/context.js";

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

test("Layout geometry: shelves are built in selected compartment", () => {
  const state: ConfigState = {
    type: "wardrobe",
    width: 1200,
    height: 2100,
    depth: 600,
    sections: 2,
    filling: { shelves: 3, drawers: 0, hangingRod: false },
    layout: {
      sections: [
        {
          id: "section-1",
          widthMm: 600,
          compartments: [
            { id: "section-1-compartment-1", kind: "empty", heightMm: 1050, shelves: 0, drawers: 0, hasRod: false },
            { id: "section-1-compartment-2", kind: "shelves", heightMm: 1050, shelves: 3, drawers: 0, hasRod: false },
          ],
        },
        {
          id: "section-2",
          widthMm: 600,
          compartments: [
            { id: "section-2-compartment-1", kind: "empty", heightMm: 2100, shelves: 0, drawers: 0, hasRod: false },
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
  const shelves = model.panels.filter((panel) => panel.role === "shelf");

  assert.equal(shelves.length, 3);
  assert.ok(shelves.every((panel) => panel.name.startsWith("Полка C1.2")));
});

console.log("");
console.log("Layout geometry tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
