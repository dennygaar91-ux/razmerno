import assert from "node:assert/strict";

import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage";
import { makeValidOrder } from "./fixtures/order-contract-fixture";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const FORBIDDEN_CONFIRMED_SKU_PATTERNS = [
  /\b\d{6,}\b/,
  /hettich[-_ ]?\d{4,}/i,
  /firmax[-_ ]?\d{4,}/i,
  /blum[-_ ]?\d+/i,
];

test("P2-08 production export hardware stays generic without confirmed supplier SKU articles", () => {
  const exportPack = buildProductionExportFromPayload(
    makeValidOrder({
      consent: {
        personalData: true,
        privacyVersion: "2026-05-24",
        acceptedAt: "2026-06-23T18:00:00.000Z",
      },
    }),
  );

  assert.ok(exportPack.productionModel.hardware.length > 0);
  for (const item of exportPack.productionModel.hardware) {
    assert.ok(item.type, "hardware type must be explicit");
    assert.ok(item.name, "hardware name must be present");
    assert.ok(item.vendor === "Firmax" || item.vendor === "Hettich", "vendor must be generic family label");
    const catalogFields = `${item.id}|${item.type}|${item.name}|${item.vendor}`;
    for (const pattern of FORBIDDEN_CONFIRMED_SKU_PATTERNS) {
      assert.doesNotMatch(catalogFields, pattern, `hardware ${item.id} must not claim confirmed supplier SKU`);
    }
    assert.equal("sku" in item, false, "v3 hardware must not expose sku field");
    assert.equal("article" in item, false, "v3 hardware must not expose article field");
  }
});

test("P2-08 hardware BOM uses internal generic naming, not fake catalog articles", () => {
  const exportPack = buildProductionExportFromPayload(makeValidOrder());
  const names = exportPack.productionModel.hardware.map((item) => item.name);
  assert.ok(names.some((name) => name.includes("Конфирмат") || name.includes("Петл") || name.includes("Направ")));
  assert.ok(names.every((name) => !name.match(/арт\.?\s*\d{5,}/i)));
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
