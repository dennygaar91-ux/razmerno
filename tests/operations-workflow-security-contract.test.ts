import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type TestFn = () => void | Promise<void>;

const tests: Array<{ name: string; run: TestFn }> = [];

function test(name: string, run: TestFn) {
  tests.push({ name, run });
}

const OPERATIONS_WORKSPACE = readFileSync("tests/operations-workspace.test.ts", "utf8");
const OPERATIONS_REVIEW = readFileSync("tests/operations-order-review.test.ts", "utf8");
const OPERATIONS_DECISION = readFileSync("tests/operations-order-decision.test.ts", "utf8");
const OPERATIONS_CHANGE = readFileSync("tests/operations-change-request-decision.test.ts", "utf8");
const MANUAL_PRICING = readFileSync("tests/operations-manual-pricing-migration-prep.test.ts", "utf8");

test("M9-P1-02 operations APIs return 401 without bearer token", () => {
  assert.match(OPERATIONS_WORKSPACE, /returns 401 without bearer token/);
  assert.match(OPERATIONS_REVIEW, /returns 401 without bearer token/);
  assert.match(OPERATIONS_DECISION, /returns 401 without bearer token/);
  assert.match(OPERATIONS_CHANGE, /returns 401 without bearer token/);
});

test("M9-P1-02 operations APIs reject malformed expired and wrong-key auth", () => {
  assert.match(OPERATIONS_WORKSPACE, /returns 401 for malformed Authorization header/);
  assert.match(OPERATIONS_WORKSPACE, /returns 401 for wrong X-Admin-Key/);
  assert.match(OPERATIONS_WORKSPACE, /returns 401 for expired admin session token/);
  assert.match(OPERATIONS_WORKSPACE, /returns 401 for customer access token/);
});

test("M9-P1-02 operations auth rejection responses do not leak secrets", () => {
  assert.match(OPERATIONS_WORKSPACE, /doesNotMatch\(JSON\.stringify\(result\.body\), \/stack\|secret\|ADMIN_API_KEY\/i\)/);
});

test("M9-P1-02 safe DTO contract forbids raw PII and production export leakage", () => {
  assert.match(MANUAL_PRICING, /forbids raw PII production export/);
});

test("M9-P1-02 operations auth uses admin session guard in API layer", () => {
  const workspaceApi = readFileSync("api/operations/workspace.ts", "utf8");
  const orderApi = readFileSync("api/operations/order.ts", "utf8");
  assert.match(workspaceApi, /validateAdminRequest/);
  assert.match(orderApi, /validateAdminRequest/);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
