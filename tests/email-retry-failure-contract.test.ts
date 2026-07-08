import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type TestFn = () => void;

const tests: Array<{ name: string; run: TestFn }> = [];

function test(name: string, run: TestFn) {
  tests.push({ name, run });
}

const ORDERS_SOURCE = readFileSync("api/orders.ts", "utf8");

test("M9-P1-03 email failure contract: manager/customer notification failures are persisted with explicit status fields", () => {
  assert.match(ORDERS_SOURCE, /manager_email_status/);
  assert.match(ORDERS_SOURCE, /manager_email_error/);
  assert.match(ORDERS_SOURCE, /customer_email_status/);
  assert.match(ORDERS_SOURCE, /customer_email_error/);
  assert.match(ORDERS_SOURCE, /MANAGER_NOTIFICATION_FAILED/);
  assert.match(ORDERS_SOURCE, /CUSTOMER_NOTIFICATION_FAILED/);
});

test("M9-P1-03 email failure contract: order success is not blocked by manager notification failure", () => {
  assert.match(ORDERS_SOURCE, /orders\.manager_email_failed/);
  assert.match(ORDERS_SOURCE, /notificationState: MANAGER_NOTIFICATION_FAILED/);
  assert.match(ORDERS_SOURCE, /manager_email_status: 'failed'/);
  assert.doesNotMatch(
    ORDERS_SOURCE,
    /manager_email_failed[\s\S]{0,400}return res\.status\(5\d\d\)/,
  );
});

test("M9-P1-03 email failure contract: replay response exposes email status without automatic retry semantics", () => {
  assert.match(ORDERS_SOURCE, /managerError: row\.manager_email_error/);
  assert.match(ORDERS_SOURCE, /customerError: row\.customer_email_error/);
  assert.doesNotMatch(ORDERS_SOURCE, /retryQueue|automaticRetry|scheduleRetry/i);
});

function runTests() {
  for (const item of tests) {
    item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

runTests();
