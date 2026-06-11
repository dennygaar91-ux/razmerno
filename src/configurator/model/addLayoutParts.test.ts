import assert from "node:assert/strict";
import {
  addCompartmentByHeight,
  addSectionByWidth,
  createLayoutModel,
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

test("Add layout parts: adds section and rebalances width", () => {
  let layout = createLayoutModel({
    type: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sectionCount: 2,
    compartmentsPerSection: 2,
  });

  layout = addSectionByWidth(layout, { width: 1800, height: 2400, depth: 600 });

  assert.equal(layout.sections.length, 3);
  assert.equal(layout.sections[0].widthMm, 600);
  assert.equal(layout.sections[2].compartments.length, 2);
});

test("Add layout parts: adds compartment by height", () => {
  let layout = createLayoutModel({
    type: "wardrobe",
    dimensions: { width: 1200, height: 2100, depth: 600 },
    sectionCount: 2,
    compartmentsPerSection: 1,
  });

  layout = addCompartmentByHeight(layout, "section-1", 2100);

  assert.equal(layout.sections[0].compartments.length, 2);
  assert.equal(layout.sections[0].compartments[0].heightMm, 1050);
});

test("Add layout parts: UI has plus controls", () => {
  const contextSource = fs.readFileSync("src/configurator/context.tsx", "utf8");
  const markersSource = fs.readFileSync("src/configurator/steps/LayoutPreview.tsx", "utf8");
  assert.ok(contextSource.includes("ADD_SECTION_BY_WIDTH"));
  assert.ok(contextSource.includes("ADD_COMPARTMENT_BY_HEIGHT"));
  assert.ok(markersSource.includes("+ Добавить секцию по ширине"));
  assert.ok(markersSource.includes("+ отсек"));
});

console.log("");
console.log("Add layout parts tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
