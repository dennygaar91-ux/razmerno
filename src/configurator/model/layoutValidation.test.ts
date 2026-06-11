import assert from "node:assert/strict";
import { validateOrderLayout } from "../../../api/_shared/layout-validation";
import { createLayoutModel, setCompartmentKind } from "./compartments";

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

test("Layout validation: accepts valid generated layout", () => {
  const layout = createLayoutModel({
    type: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sectionCount: 2,
    compartmentsPerSection: 2,
  });

  assert.equal(validateOrderLayout(layout, { width: 1800, height: 2400, depth: 600 }), null);
});

test("Layout validation: rejects rod lower than 1200", () => {
  let layout = createLayoutModel({
    type: "wardrobe",
    dimensions: { width: 800, height: 900, depth: 600 },
    sectionCount: 1,
    compartmentsPerSection: 1,
  });

  layout = setCompartmentKind(layout, "section-1", "section-1-compartment-1", "rod");
  layout.sections[0].compartments[0].heightMm = 900;

  assert.equal(validateOrderLayout(layout, { width: 800, height: 900, depth: 600 }), "Отсек со штангой должен быть не ниже 1200 мм");
});

test("Layout validation: rejects height mismatch", () => {
  const layout = createLayoutModel({
    type: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sectionCount: 2,
    compartmentsPerSection: 2,
  });
  layout.sections[0].compartments[0].heightMm = 100;

  assert.equal(validateOrderLayout(layout, { width: 1800, height: 2400, depth: 600 }), "Сумма высот отсеков не совпадает с высотой изделия");
});

console.log("");
console.log("Layout validation tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
