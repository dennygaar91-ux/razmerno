import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { logEvent, safeErrorMessage } from "../api/_shared/logger";

type TestFn = () => void;

const tests: Array<{ name: string; run: TestFn }> = [];

function test(name: string, run: TestFn) {
  tests.push({ name, run });
}

const REQUEST_CONTEXT = readFileSync("api/_shared/request-context.ts", "utf8");
const ERRORS = readFileSync("api/_shared/errors.ts", "utf8");
const ORDERS = readFileSync("api/orders.ts", "utf8");

test("M9-P1-04 observability: request context exposes correlation id", () => {
  assert.match(REQUEST_CONTEXT, /requestId/);
  assert.match(ORDERS, /requestId/);
});

test("M9-P1-04 observability: API errors use safe customer-facing messages", () => {
  assert.match(ERRORS, /message/);
  assert.match(ORDERS, /ORDER_PREPARATION_FAILED_MESSAGE/);
  assert.match(ORDERS, /GENERIC_ORDER_SUBMIT_FAILED/);
});

test("M9-P1-04 observability: safeErrorMessage strips provider details", () => {
  const redacted = safeErrorMessage(new Error("smtp://secret-token@provider.test failed for user@secret.com"));
  assert.ok(!redacted.includes("secret-token"));
  assert.ok(!redacted.includes("user@secret.com"));
});

test("M9-P1-04 observability: structured logs include event name without raw email", () => {
  const lines: string[] = [];
  const original = console.info;
  console.info = ((value: string) => {
    lines.push(value);
  }) as typeof console.info;
  try {
    logEvent("info", "observability.contract", {
      requestId: "req-contract-01",
      orderId: "RZ-TEST-0001",
      email: "should-not-appear@example.com",
    });
    const serialized = lines.join("\n");
    assert.match(serialized, /observability\.contract/);
    assert.match(serialized, /req-contract-01/);
    assert.doesNotMatch(serialized, /should-not-appear@example.com/);
  } finally {
    console.info = original;
  }
});

function runTests() {
  for (const item of tests) {
    item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

runTests();
