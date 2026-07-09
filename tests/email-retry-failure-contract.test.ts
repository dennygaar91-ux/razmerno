import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type TestFn = () => void;

const tests: Array<{ name: string; run: TestFn }> = [];

function test(name: string, run: TestFn) {
  tests.push({ name, run });
}

const ORDERS_SOURCE = readFileSync("api/orders.ts", "utf8");
const CHECKOUT_SUBMIT_TEST = readFileSync("tests/checkout-submit-hook.test.ts", "utf8");
const CUSTOMER_NOTIFICATION_TYPES = readFileSync("api/_shared/customer-notification-types.ts", "utf8");
const CUSTOMER_ORDER_DETAIL_TYPES = readFileSync("api/_shared/customer-order-detail-types.ts", "utf8");
const OPERATIONS_REVIEW_TYPES = readFileSync("api/_shared/operations-order-review-types.ts", "utf8");
const OPERATIONS_WORKSPACE_TEST = readFileSync("tests/operations-workspace.test.ts", "utf8");
const OPERATIONS_REVIEW_TEST = readFileSync("tests/operations-order-review.test.ts", "utf8");

test("M9-P1-03 email failure contract: manager/customer notification failures are persisted with explicit status fields", () => {
  assert.match(ORDERS_SOURCE, /manager_email_status/);
  assert.match(ORDERS_SOURCE, /manager_email_error/);
  assert.match(ORDERS_SOURCE, /customer_email_status/);
  assert.match(ORDERS_SOURCE, /customer_email_error/);
  assert.match(ORDERS_SOURCE, /MANAGER_NOTIFICATION_FAILED/);
  assert.match(ORDERS_SOURCE, /CUSTOMER_NOTIFICATION_FAILED/);
});

test("M9-P1-03 customer email failure does not fail order creation", () => {
  assert.match(CHECKOUT_SUBMIT_TEST, /customer notification fails after manager notification/);
  assert.match(CHECKOUT_SUBMIT_TEST, /email\?\.customer, "failed"/);
  assert.match(CHECKOUT_SUBMIT_TEST, /statusCode, 200/);
  assert.doesNotMatch(
    ORDERS_SOURCE,
    /customer_email_failed[\s\S]{0,500}return res\.status\(5\d\d\)/,
  );
});

test("M9-P1-03 manager email failure does not fail customer success response", () => {
  assert.match(ORDERS_SOURCE, /orders\.manager_email_failed/);
  assert.match(ORDERS_SOURCE, /notificationState: MANAGER_NOTIFICATION_FAILED/);
  assert.match(ORDERS_SOURCE, /manager_email_status: 'failed'/);
  assert.match(CHECKOUT_SUBMIT_TEST, /manager notification fails/);
  assert.match(CHECKOUT_SUBMIT_TEST, /managerError, "manager_notification_failed"/);
  assert.doesNotMatch(
    ORDERS_SOURCE,
    /manager_email_failed[\s\S]{0,400}return res\.status\(5\d\d\)/,
  );
});

test("M9-P1-03 manager failure is persisted as retry-needed/manual-attention status for operations", () => {
  assert.match(OPERATIONS_REVIEW_TYPES, /managerEmailStatus/);
  assert.match(OPERATIONS_REVIEW_TYPES, /customerEmailStatus/);
  assert.match(OPERATIONS_WORKSPACE_TEST, /manager_email_status/);
  assert.match(OPERATIONS_REVIEW_TEST, /manager_email_status/);
  assert.match(ORDERS_SOURCE, /persistEmailPatch/);
});

test("M9-P1-03 no automatic retry queue is claimed or implemented", () => {
  assert.match(ORDERS_SOURCE, /managerError: row\.manager_email_error/);
  assert.match(ORDERS_SOURCE, /customerError: row\.customer_email_error/);
  assert.doesNotMatch(ORDERS_SOURCE, /retryQueue|automaticRetry|scheduleRetry|retry_count/i);
  assert.doesNotMatch(CHECKOUT_SUBMIT_TEST, /automaticRetry|retryQueue|scheduleRetry/i);
});

test("M9-P1-03 customer DTO does not expose internal SMTP/provider diagnostics", () => {
  for (const key of [
    "manager_email_status",
    "customer_email_status",
    "pricing_source_diagnostic",
  ]) {
    assert.match(CUSTOMER_NOTIFICATION_TYPES, new RegExp(key));
    assert.match(CUSTOMER_ORDER_DETAIL_TYPES, new RegExp(key));
  }
  assert.doesNotMatch(CUSTOMER_NOTIFICATION_TYPES, /SMTP|Resend API|smtpError/i);
  assert.doesNotMatch(CUSTOMER_ORDER_DETAIL_TYPES, /managerEmailStatus|customerEmailStatus/);
});

test("M9-P1-03 email failure logs remain PII-safe", () => {
  assert.match(ORDERS_SOURCE, /safeErrorMessage/);
  assert.match(ORDERS_SOURCE, /reason: MANAGER_NOTIFICATION_FAILED/);
  assert.match(ORDERS_SOURCE, /reason: CUSTOMER_NOTIFICATION_FAILED/);
  assert.match(CHECKOUT_SUBMIT_TEST, /notification failure logs must not contain customer PII/);
});

test("M9-P1-03 duplicate submit replay does not resend notifications", () => {
  assert.match(ORDERS_SOURCE, /orders\.idempotent_replay/);
  assert.match(ORDERS_SOURCE, /buildReplayResponse/);
  assert.match(CHECKOUT_SUBMIT_TEST, /idempotency replay with same key and same payload/);
  assert.match(CHECKOUT_SUBMIT_TEST, /without duplicate notifications/);
  assert.match(CHECKOUT_SUBMIT_TEST, /does not resend notifications/);
});

function runTests() {
  for (const item of tests) {
    item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

runTests();
