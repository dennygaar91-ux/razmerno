import assert from "node:assert/strict";
import { makeCompatibleLayout } from "../context";
import { summarizeLayoutFilling, setCompartmentKind } from "./compartments";

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

test("Layout state: compatible layout mirrors legacy filling", () => {
  const layout = makeCompatibleLayout({
    type: "wardrobe",
    width: 1800,
    height: 2400,
    depth: 600,
    sections: 2,
    filling: { shelves: 4, drawers: 2, hangingRod: true },
  });
  const filling = summarizeLayoutFilling(layout);

  assert.equal(layout.sections.length, 2);
  assert.equal(filling.shelves, 4);
  assert.equal(filling.drawers, 2);
  assert.equal(filling.hangingRod, true);
});

test("Layout state: compartment edits can update filling summary", () => {
  let layout = makeCompatibleLayout({
    type: "wardrobe",
    width: 1200,
    height: 2100,
    depth: 600,
    sections: 2,
    filling: { shelves: 0, drawers: 0, hangingRod: false },
  });

  layout = setCompartmentKind(layout, "section-2", "section-2-compartment-1", "rod");
  const filling = summarizeLayoutFilling(layout);

  assert.equal(filling.hangingRod, true);
  assert.equal(filling.drawers, 0);
});

console.log("");
console.log("Layout state tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
