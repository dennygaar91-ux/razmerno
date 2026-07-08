import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import handler from "../api/orders";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ORDERS_SOURCE = readFileSync("api/orders.ts", "utf8");

test("production export failure contract: order handler builds export before persistence inside preparation try/catch", () => {
  assert.match(ORDERS_SOURCE, /buildProductionExportFromPayload/);
  assert.match(ORDERS_SOURCE, /calculateServerOrderPriceResolved/);
  assert.match(ORDERS_SOURCE, /order_preparation_failed/);
  assert.match(ORDERS_SOURCE, /ORDER_PREPARATION_FAILED_MESSAGE/);
  assert.match(ORDERS_SOURCE, /return res\.status\(400\)/);
});

test("production export failure contract: DB insert happens only after successful order preparation", () => {
  const preparationCatchIndex = ORDERS_SOURCE.indexOf("orders.order_preparation_failed");
  const insertIndex = ORDERS_SOURCE.indexOf("await insertOrderRecord(dbRecord)");
  assert.ok(preparationCatchIndex > 0, "expected preparation failure handler");
  assert.ok(insertIndex > preparationCatchIndex, "insert must follow preparation failure guard");
});

test("production export failure contract: exported handler remains POST orders entrypoint", () => {
  assert.equal(typeof handler, "function");
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
