import assert from "node:assert/strict";
import {
  addCompartmentByHeight,
  addSectionByWidth,
  createLayoutModel,
  setCompartmentDrawers,
  setCompartmentKind,
  setCompartmentShelves,
  summarizeLayoutFilling,
} from "./compartments";
import { validateOrderLayout } from "../../../api/_shared/layout-validation";

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

test("Final layout smoke: advanced wardrobe flow stays valid", () => {
  let layout = createLayoutModel({
    type: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sectionCount: 2,
    compartmentsPerSection: 1,
  });

  layout = addSectionByWidth(layout, { width: 1800, height: 2400, depth: 600 });
  layout = addCompartmentByHeight(layout, "section-1", 2400);
  layout = setCompartmentShelves(layout, "section-1", "section-1-compartment-1", 3);
  layout = setCompartmentDrawers(layout, "section-2", "section-2-compartment-1", 4);
  layout = setCompartmentKind(layout, "section-3", "section-3-compartment-1", "rod");

  const filling = summarizeLayoutFilling(layout);

  assert.equal(layout.sections.length, 3);
  assert.equal(filling.shelves, 3);
  assert.equal(filling.drawers, 4);
  assert.equal(filling.hangingRod, true);
  assert.equal(validateOrderLayout(layout, { width: 1800, height: 2400, depth: 600 }), null);
});

test("Final layout smoke: invalid low compartment is rejected", () => {
  const layout = createLayoutModel({
    type: "wardrobe",
    dimensions: { width: 1200, height: 2100, depth: 600 },
    sectionCount: 2,
    compartmentsPerSection: 1,
  });

  layout.sections[0].compartments[0].heightMm = 100;

  assert.equal(
    validateOrderLayout(layout, { width: 1200, height: 2100, depth: 600 }),
    "Сумма высот отсеков не совпадает с высотой изделия",
  );
});

console.log("");
console.log("Final layout smoke tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
