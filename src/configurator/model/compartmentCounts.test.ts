import assert from "node:assert/strict";
import {
  createLayoutModel,
  setCompartmentShelves,
  setCompartmentDrawers,
  summarizeLayoutFilling,
} from "./compartments";
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

test("Compartment counts: shelves setter updates summary", () => {
  let layout = createLayoutModel({
    type: "wardrobe",
    dimensions: { width: 1200, height: 2100, depth: 600 },
    sectionCount: 2,
    compartmentsPerSection: 2,
  });

  layout = setCompartmentShelves(layout, "section-1", "section-1-compartment-1", 3);
  const filling = summarizeLayoutFilling(layout);

  assert.equal(filling.shelves, 3);
  assert.equal(filling.drawers, 0);
});

test("Compartment counts: drawers setter updates summary", () => {
  let layout = createLayoutModel({
    type: "wardrobe",
    dimensions: { width: 1200, height: 2100, depth: 600 },
    sectionCount: 2,
    compartmentsPerSection: 2,
  });

  layout = setCompartmentDrawers(layout, "section-2", "section-2-compartment-2", 4);
  const filling = summarizeLayoutFilling(layout);

  assert.equal(filling.drawers, 4);
  assert.equal(filling.shelves, 0);
});

test("Compartment counts: UI contains MiniCounter and actions", () => {
  const counterSource = fs.readFileSync("src/configurator/steps/MiniCounter.tsx", "utf8");
  const contextSource = fs.readFileSync("src/configurator/context.tsx", "utf8");
  assert.ok(counterSource.includes("function MiniCounter"));
  assert.ok(contextSource.includes("SET_COMPARTMENT_SHELVES"));
  assert.ok(contextSource.includes("SET_COMPARTMENT_DRAWERS"));
});

console.log("");
console.log("Compartment count tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
