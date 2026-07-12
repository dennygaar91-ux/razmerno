import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const MIGRATION_SQL = readFileSync(
  "supabase/migrations/20260708_enable_order_status_events_rls.sql",
  "utf8",
);
const REFERENCE_SQL = readFileSync("db/order-status-events.sql", "utf8");
const DECISION_STORE_SOURCE = readFileSync("api/_shared/operations-order-decision-store.ts", "utf8");
const PAYMENT_STORE_SOURCE = readFileSync("api/_shared/operations-payment-confirmation-store.ts", "utf8");
const COMPLETION_STORE_SOURCE = readFileSync("api/_shared/operations-order-completion-store.ts", "utf8");
const ADMIN_ORDERS_SOURCE = readFileSync("api/_shared/admin-orders.ts", "utf8");
const CUSTOMER_ORDER_DETAIL_TEST = readFileSync("tests/customer-order-detail.test.ts", "utf8");
const OPERATIONS_REVIEW_TEST = readFileSync("tests/operations-order-review.test.ts", "utf8");

const SERVICE_ROLE_STORE_SOURCES = [
  DECISION_STORE_SOURCE,
  PAYMENT_STORE_SOURCE,
  COMPLETION_STORE_SOURCE,
  ADMIN_ORDERS_SOURCE,
];

test("migration enables RLS on order_status_events", () => {
  assert.match(MIGRATION_SQL, /alter table public\.order_status_events enable row level security/);
});

test("migration is idempotent with stable policy name", () => {
  assert.match(MIGRATION_SQL, /Safe to run multiple times/i);
  assert.match(MIGRATION_SQL, /drop policy if exists order_status_events_deny_all/i);
  assert.match(MIGRATION_SQL, /create policy order_status_events_deny_all/);
  assert.equal((MIGRATION_SQL.match(/order_status_events_deny_all/g) ?? []).length, 2);
});

test("migration adds deny-all policy only (blocks anon and authenticated direct access)", () => {
  assert.match(MIGRATION_SQL, /order_status_events_deny_all/);
  assert.match(MIGRATION_SQL, /for all/);
  assert.match(MIGRATION_SQL, /using \(false\)/);
  assert.match(MIGRATION_SQL, /with check \(false\)/);
  assert.doesNotMatch(MIGRATION_SQL, /using \(true\)/i);
  assert.doesNotMatch(MIGRATION_SQL, /to authenticated/i);
  assert.doesNotMatch(MIGRATION_SQL, /to anon/i);
});

test("reference db SQL mirrors migration RLS deny-all policy", () => {
  assert.match(REFERENCE_SQL, /alter table public\.order_status_events enable row level security/);
  assert.match(REFERENCE_SQL, /order_status_events_deny_all/);
  assert.match(REFERENCE_SQL, /using \(false\)/);
  assert.match(REFERENCE_SQL, /with check \(false\)/);
  assert.match(REFERENCE_SQL, /20260708_enable_order_status_events_rls\.sql/);
});

test("all order_status_events writers use service role client", () => {
  for (const source of SERVICE_ROLE_STORE_SOURCES) {
    assert.match(source, /SUPABASE_SERVICE_ROLE_KEY/);
    assert.match(source, /order_status_events/);
    assert.doesNotMatch(source, /SUPABASE_ANON_KEY|anon key/i);
  }
});

test("frontend does not access order_status_events directly", () => {
  const customerOrderDetailCard = readFileSync("src/static-pages/account/CustomerOrderDetailCard.tsx", "utf8");
  const operationsReviewView = readFileSync("src/operations/OperationsManualReviewView.tsx", "utf8");
  const operationsDecisionHistory = readFileSync("src/operations/OperationsOrderDecisionHistorySection.tsx", "utf8");
  const operationsDecisionSection = readFileSync("src/operations/OperationsOrderDecisionSection.tsx", "utf8");

  for (const source of [
    customerOrderDetailCard,
    operationsReviewView,
    operationsDecisionHistory,
    operationsDecisionSection,
  ]) {
    assert.doesNotMatch(source, /order_status_events/i);
    assert.doesNotMatch(source, /createClient|supabase/i);
  }
});

test("customer order detail contract does not expose internal audit fields", () => {
  assert.match(CUSTOMER_ORDER_DETAIL_TEST, /doesNotMatch\(timeline, .*order_status_events/i);
});

test("operations review tests mock order_status_events through server API path", () => {
  assert.match(OPERATIONS_REVIEW_TEST, /order_status_events/);
  assert.match(OPERATIONS_REVIEW_TEST, /decisionHistory/);
  assert.match(OPERATIONS_REVIEW_TEST, /api\/operations\/order/);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
