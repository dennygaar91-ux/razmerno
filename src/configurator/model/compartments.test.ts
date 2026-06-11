import assert from "node:assert/strict";
import {
  COMPARTMENT_RULES,
  createLayoutModel,
  legacyFillingToLayout,
  setCompartmentKind,
  summarizeLayoutFilling,
  validateLayout,
} from "./compartments";

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

test("Compartment model: creates equal sections and compartments", () => {
  const layout = createLayoutModel({
    type: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sectionCount: 3,
    compartmentsPerSection: 2,
  });

  assert.equal(layout.sections.length, 3);
  assert.equal(layout.sections[0].widthMm, 600);
  assert.equal(layout.sections[0].compartments.length, 2);
  assert.equal(layout.sections[0].compartments[0].heightMm, 1200);
});

test("Compartment model: legacy filling migrates without losing counts", () => {
  const layout = legacyFillingToLayout({
    type: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sectionCount: 2,
    filling: { shelves: 5, drawers: 3, hangingRod: true },
  });

  const filling = summarizeLayoutFilling(layout);
  assert.equal(filling.shelves, 5);
  assert.equal(filling.drawers, 3);
  assert.equal(filling.hangingRod, true);
});

test("Compartment model: rod sets default height rule", () => {
  let layout = createLayoutModel({
    type: "wardrobe",
    dimensions: { width: 900, height: 900, depth: 600 },
    sectionCount: 1,
    compartmentsPerSection: 1,
  });

  layout = setCompartmentKind(layout, "section-1", "section-1-compartment-1", "rod");
  const compartment = layout.sections[0].compartments[0];

  assert.equal(compartment.kind, "rod");
  assert.equal(compartment.heightMm, COMPARTMENT_RULES.rodDefaultHeightMm);
  assert.equal(validateLayout(layout).length, 0);
});

test("Compartment model: nightstand is limited to one section", () => {
  const layout = createLayoutModel({
    type: "nightstand",
    dimensions: { width: 500, height: 550, depth: 400 },
    sectionCount: 4,
    compartmentsPerSection: 1,
  });

  assert.equal(layout.sections.length, 1);
});

console.log("");
console.log("Compartment model tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
