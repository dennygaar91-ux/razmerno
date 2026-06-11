import assert from "node:assert/strict";
import { toOrderDbInsert } from "../../../api/_shared/order-db";
import { createLayoutModel } from "./compartments";

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

test("Layout payload: order DB insert preserves layout", () => {
  const layout = createLayoutModel({
    type: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sectionCount: 2,
    compartmentsPerSection: 2,
  });

  const row = toOrderDbInsert({
    orderId: "RZ-TEST",
    userAgent: null,
    clientIp: null,
    body: {
      productType: "wardrobe",
      dimensions: { width: 1800, height: 2400, depth: 600 },
      sections: 2,
      filling: { shelves: 4, drawers: 0, hangingRod: true },
      layout,
      materials: { bodyId: "white-matt", facadeId: "oak-natural" },
      style: { facadeStyleId: "no-handle", hardwareId: "comfort" },
      priceBreakdown: {},
      totalPrice: 1000,
      customer: { name: "Анна", phone: "+7 999 123-45-67", email: "anna@example.ru" },
      consent: { personalData: true },
    },
  });

  assert.equal(row.layout?.sections.length, 2);
  assert.equal(row.layout?.sections[0].compartments.length, 2);
});

console.log("");
console.log("Layout payload tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
