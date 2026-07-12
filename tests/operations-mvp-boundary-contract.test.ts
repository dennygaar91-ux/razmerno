import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type TestFn = () => void;

const tests: Array<{ name: string; run: TestFn }> = [];

function test(name: string, run: TestFn) {
  tests.push({ name, run });
}

const WORKSPACE_API = readFileSync("api/operations/workspace.ts", "utf8");
const ORDER_API = readFileSync("api/operations/order.ts", "utf8");
const MANUAL_PRICING_API = readFileSync("api/operations/manual-pricing-draft.ts", "utf8");
const PAYMENT_API = readFileSync("api/operations/payment-confirmation.ts", "utf8");
const COMPLETION_API = readFileSync("api/operations/order-completion.ts", "utf8");
const CHANGE_DECISION_API = readFileSync("api/operations/change-request-decision.ts", "utf8");
const ORDER_DECISION_API = readFileSync("api/operations/order-decision.ts", "utf8");
const REVIEW_TYPES = readFileSync("api/_shared/operations-order-review-types.ts", "utf8");
const CUSTOMER_ORDER_TYPES = readFileSync("api/_shared/customer-order-detail-types.ts", "utf8");
const MANUAL_PRICING_PREP = readFileSync("tests/operations-manual-pricing-migration-prep.test.ts", "utf8");
const PAYMENT_TEST = readFileSync("tests/operations-payment-confirmation.test.ts", "utf8");
const COMPLETION_DOMAIN = readFileSync("tests/order-completion-domain.test.ts", "utf8");
const RLS_PREP = readFileSync("tests/order-status-events-rls-migration-prep.test.ts", "utf8");
const DECISION_FLOW = readFileSync("tests/operations-decision-flow-contract.test.ts", "utf8");
const WORKSPACE_TEST = readFileSync("tests/operations-workspace.test.ts", "utf8");
const REVIEW_VIEW = readFileSync("src/operations/OperationsManualReviewView.tsx", "utf8");
const APP = readFileSync("src/App.tsx", "utf8");

test("P1-28 operations APIs require operations/admin authorization", () => {
  for (const source of [WORKSPACE_API, ORDER_API, MANUAL_PRICING_API, PAYMENT_API, COMPLETION_API, CHANGE_DECISION_API, ORDER_DECISION_API]) {
    assert.match(source, /validateAdminRequest/);
  }
  assert.match(WORKSPACE_TEST, /returns 401 without bearer token/);
});

test("P1-28 customer read models do not expose operations workspace data", () => {
  assert.doesNotMatch(CUSTOMER_ORDER_TYPES, /operations-workspace|OperationsWorkspace/);
  assert.doesNotMatch(readFileSync("api/customer/workspace.ts", "utf8"), /operations\/workspace/);
});

test("P1-28 operations-only notes and diagnostics do not leak into customer DTO", () => {
  assert.match(REVIEW_TYPES, /OPERATIONS_ORDER_REVIEW_FORBIDDEN_RESPONSE_KEYS/);
  assert.match(CUSTOMER_ORDER_TYPES, /CUSTOMER_ORDER_DETAIL_FORBIDDEN_RESPONSE_KEYS/);
  assert.doesNotMatch(CUSTOMER_ORDER_TYPES, /managerEmailStatus|decisionHistory/);
});

test("P1-28 manual pricing draft remains draft/server-side only", () => {
  assert.match(MANUAL_PRICING_PREP, /status = 'draft'/);
  assert.match(MANUAL_PRICING_PREP, /doesNotMatch\(WRITE_HANDLER_SOURCE, \/updateOrderStatus\|production_export\|total_price\|payment/i);
  assert.match(MANUAL_PRICING_API, /manual-pricing-draft/);
});

test("P1-28 payment confirmation only allowed in eligible statuses", () => {
  assert.match(PAYMENT_TEST, /wrong status rejected/);
  assert.match(REVIEW_TYPES, /isManualPaymentConfirmationAllowedForDomainStatus/);
  assert.match(REVIEW_VIEW, /OperationsPaymentConfirmationSection/);
});

test("P1-28 order completion only allowed in eligible statuses", () => {
  assert.match(COMPLETION_DOMAIN, /В работе allows order completion/);
  assert.match(COMPLETION_DOMAIN, /other statuses reject order completion/);
  assert.match(REVIEW_TYPES, /isOrderCompletionAllowedForDomainStatus/);
});

test("P1-28 status transition writes use server-owned audit/status event path", () => {
  assert.match(RLS_PREP, /order_status_events writers use service role client/);
  assert.match(DECISION_FLOW, /order_status_events/);
  assert.match(PAYMENT_API, /operations-payment-confirmation-store/);
  assert.match(COMPLETION_API, /operations-order-completion-store/);
});

test("P1-28 deferred Approval View is not falsely represented as completed MVP surface", () => {
  assert.match(REVIEW_VIEW, /getOperationsManualReviewTitle/);
  assert.doesNotMatch(APP, /ApprovalViewPage|ApprovalView/);
  assert.match(readFileSync("src/shared/operations/reviewTypes.ts", "utf8"), /Manual Review/);
  assert.doesNotMatch(readFileSync("src/shared/operations/reviewTypes.ts", "utf8"), /Approval View MVP complete/i);
});

test("deferred production v4 replacement and D-13 visual closure are not falsely claimed", () => {
  const productionBoundary = readFileSync("tests/production-json-v4-support-policy.test.ts", "utf8");
  const governance = readFileSync("tests/governance-closure-wording-contract.test.ts", "utf8");
  const backlog = readFileSync("docs/planning/current-backlog.md", "utf8");

  assert.match(productionBoundary, /v4 support policy layer is isolated from active v3 runtime export path/i);
  assert.match(governance, /D-13[\s\S]{0,200}Deferred by User/i);
  assert.match(backlog, /D-13[\s\S]{0,200}Deferred by User/i);
  assert.doesNotMatch(backlog, /D-13[\s\S]{0,120}Closed — Formal/i);
});

function runTests() {
  for (const item of tests) {
    item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

runTests();
