import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type TestFn = () => void;

const tests: Array<{ name: string; run: TestFn }> = [];

function test(name: string, run: TestFn) {
  tests.push({ name, run });
}

const ACCOUNT_CABINET = readFileSync("src/static-pages/account/CustomerAccountCabinet.tsx", "utf8");
const ORDER_DETAIL_CARD = readFileSync("src/static-pages/account/CustomerOrderDetailCard.tsx", "utf8");
const ORDER_DETAIL_TYPES = readFileSync("api/_shared/customer-order-detail-types.ts", "utf8");
const ORDER_DETAIL_TEST = readFileSync("tests/customer-order-detail.test.ts", "utf8");
const PROFILE_EDIT_TEST = readFileSync("tests/customer-profile-edit.test.ts", "utf8");
const NOTIFICATIONS_TEST = readFileSync("tests/customer-notifications.test.ts", "utf8");
const CHANGE_REQUEST_CONTRACT = readFileSync("tests/customer-change-request-contract.test.ts", "utf8");
const PRICING_PARITY = readFileSync("tests/pricing-parity-contract.test.ts", "utf8");
const CUSTOMER_ORDER_API = readFileSync("api/customer/order.ts", "utf8");
const PROFILE_SECTION = readFileSync("src/static-pages/account/CustomerProfileSection.tsx", "utf8");

test("P1-27 customer account does not expose deferred cancellation request MVP feature", () => {
  assert.doesNotMatch(ACCOUNT_CABINET, /Отменить заявку/i);
  assert.doesNotMatch(ORDER_DETAIL_CARD, /Отменить заявку/i);
  assert.match(ORDER_DETAIL_TEST, /doesNotMatch\(card, \/Отменить/i);
});

test("P1-27 email-code profile edit is not presented as finished MVP flow", () => {
  assert.doesNotMatch(PROFILE_SECTION, /email.code|email-code|код подтверждения/i);
  assert.match(PROFILE_EDIT_TEST, /rejects email changes/);
  assert.match(PROFILE_SECTION, /patchCustomerProfile/);
});

test("P1-27 customer order detail uses server-owned safe read model", () => {
  assert.match(ORDER_DETAIL_TYPES, /mapCustomerOrderStatus/);
  assert.match(ORDER_DETAIL_TYPES, /CUSTOMER_ORDER_DETAIL_FORBIDDEN_RESPONSE_KEYS/);
  assert.match(ORDER_DETAIL_TEST, /safe fields only/);
  assert.match(CUSTOMER_ORDER_API, /mapCustomerOrderDetail/);
});

test("P1-27 customer DTO does not expose operations-only notes or manual pricing diagnostics", () => {
  const forbiddenKeysInContract = [
    "pricing_source_diagnostic",
    "pricingSourceDiagnostic",
    "manager_email_status",
    "auditEvents",
  ];
  for (const key of forbiddenKeysInContract) {
    assert.match(ORDER_DETAIL_TYPES, new RegExp(key));
    assert.doesNotMatch(ORDER_DETAIL_CARD, new RegExp(key));
  }
  for (const key of ["manualPricingDraft", "decisionHistory", "managerEmailStatus"]) {
    assert.doesNotMatch(ORDER_DETAIL_TYPES, new RegExp(key));
    assert.doesNotMatch(ORDER_DETAIL_CARD, new RegExp(key));
  }
});

test("P1-27 customer notifications remain customer-safe only", () => {
  assert.match(NOTIFICATIONS_TEST, /safe read model fields/);
  assert.match(NOTIFICATIONS_TEST, /excludes forbidden fields/);
  assert.match(NOTIFICATIONS_TEST, /filters by authenticated user ownership/);
});

test("P1-27 customer cannot access another customer order via API contract", () => {
  assert.match(ORDER_DETAIL_TEST, /returns 404 for foreign order/);
  assert.match(CHANGE_REQUEST_CONTRACT, /non-owner cannot submit change request/);
});

test("P1-27 deferred customer final price / Approval View is not falsely claimed as implemented", () => {
  assert.doesNotMatch(ACCOUNT_CABINET, /Approval View|approval view|финальная цена подтверждена/i);
  assert.doesNotMatch(ORDER_DETAIL_CARD, /Approval View|approval view/i);
  assert.match(PRICING_PARITY, /parity/);
  assert.match(CHANGE_REQUEST_CONTRACT, /totalPriceMutations/);
});

test("D-15/D-16/D-07 deferred MVP features are not exposed as finished flows", () => {
  const backlog = readFileSync("docs/planning/current-backlog.md", "utf8");
  const operationsBoundary = readFileSync("tests/operations-mvp-boundary-contract.test.ts", "utf8");

  assert.match(backlog, /D-15[\s\S]{0,300}Deferred|deferred/i);
  assert.match(backlog, /D-16[\s\S]{0,300}Deferred|deferred/i);
  assert.match(backlog, /D-07[\s\S]{0,300}Deferred|deferred/i);
  assert.doesNotMatch(ORDER_DETAIL_CARD, /код подтверждения email|email-code verification complete/i);
  assert.match(operationsBoundary, /deferred Approval View/i);
});

function runTests() {
  for (const item of tests) {
    item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

runTests();
