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

const state: ConfigState = {
  type: "wardrobe",
  width: 1800,
  height: 2400,
  depth: 600,
  sections: 3,
  filling: { shelves: 3, drawers: 3, hangingRod: true },
  layout: {
    sections: [
      {
        id: "section-1",
        widthMm: 600,
        compartments: [
          { id: "section-1-compartment-1", kind: "shelves", heightMm: 1200, shelves: 3, drawers: 0, hasRod: false },
          { id: "section-1-compartment-2", kind: "empty", heightMm: 1200, shelves: 0, drawers: 0, hasRod: false },
        ],
      },
      {
        id: "section-2",
        widthMm: 600,
        compartments: [
          { id: "section-2-compartment-1", kind: "drawers", heightMm: 1200, shelves: 0, drawers: 3, hasRod: false },
          { id: "section-2-compartment-2", kind: "empty", heightMm: 1200, shelves: 0, drawers: 0, hasRod: false },
        ],
      },
      {
        id: "section-3",
        widthMm: 600,
        compartments: [
          { id: "section-3-compartment-1", kind: "rod", heightMm: 1200, shelves: 0, drawers: 0, hasRod: true },
          { id: "section-3-compartment-2", kind: "empty", heightMm: 1200, shelves: 0, drawers: 0, hasRod: false },
        ],
      },
    ],
  },
  advancedLayout: true,
  selectedCompartmentId: "section-2-compartment-1",
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

test("Final three layout smoke: shelves, drawers and rod are layout-aware together", () => {
  const project = fromConfigState(state, "test");
  const model = buildCabinetGeometry(project);

  const shelves = model.panels.filter((panel) => panel.role === "shelf");
  const drawerFronts = model.panels.filter((panel) => panel.role === "drawer-front");
  const rods = model.hardware.filter((item) => item.type === "rod");

  assert.equal(shelves.length, 3);
  assert.equal(drawerFronts.length, 3);
  assert.equal(rods.length, 1);

  assert.ok(shelves.every((panel) => panel.name.startsWith("Полка C1.1")));
  assert.ok(drawerFronts.every((panel) => panel.name.startsWith("Фасад ящика 2.1")));
  assert.ok(rods[0].name.includes("C3.1"));
});

test("Final three layout smoke: repeated full layout builds are deterministic", () => {
  const project = fromConfigState(state, "test");
  const first = buildCabinetGeometry(project);
  const second = buildCabinetGeometry(project);

  assert.deepEqual(first.panels.map((panel) => panel.id), second.panels.map((panel) => panel.id));
  assert.deepEqual(first.hardware.map((item) => item.id), second.hardware.map((item) => item.id));
  assert.deepEqual(first.drilling.map((item) => item.id), second.drilling.map((item) => item.id));
});

console.log("");
console.log("Final Three/Layout smoke tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
