import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const TABLE_CONTRACTS = [
  {
    table: "profiles",
    migration: "supabase/migrations/20260623_add_customer_profiles.sql",
    policy: "profiles_deny_all",
    store: "api/_shared/customer-profiles.ts",
  },
  {
    table: "constructor_projects",
    migration: "supabase/migrations/20260703_add_constructor_projects.sql",
    policy: "constructor_projects_deny_all",
    store: "api/_shared/constructor-projects-store.ts",
  },
  {
    table: "order_change_requests",
    migration: "supabase/migrations/20260703_add_order_change_requests.sql",
    policy: "order_change_requests_deny_all",
    store: "api/_shared/customer-change-requests-store.ts",
  },
  {
    table: "order_notifications",
    migration: "supabase/migrations/20260703_add_order_notifications.sql",
    policy: "order_notifications_deny_all",
    store: "api/_shared/customer-notifications-store.ts",
  },
  {
    table: "order_manual_pricing_drafts",
    migration: "supabase/migrations/20260705_add_order_manual_pricing_drafts.sql",
    policy: "order_manual_pricing_drafts_deny_all",
    store: "api/_shared/operations-manual-pricing-drafts-store.ts",
  },
] as const;

const ORDERS_REFERENCE_SQL = readFileSync("db/orders.sql", "utf8");
const ORDER_STATUS_EVENTS_PREP = readFileSync("tests/order-status-events-rls-migration-prep.test.ts", "utf8");
const CUSTOMER_ORDER_DETAIL_CARD = readFileSync("src/static-pages/account/CustomerOrderDetailCard.tsx", "utf8");
const CUSTOMER_ACCOUNT_CABINET = readFileSync("src/static-pages/account/CustomerAccountCabinet.tsx", "utf8");
const CUSTOMER_WORKSPACE = readFileSync("api/customer/workspace.ts", "utf8");

function assertDenyAllRls(sql: string, table: string, policy: string) {
  assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
  assert.match(sql, new RegExp(`drop policy if exists ${policy}`));
  assert.match(sql, new RegExp(`create policy ${policy}`));
  assert.match(sql, /for all/);
  assert.match(sql, /using \(false\)/);
  assert.match(sql, /with check \(false\)/);
  assert.doesNotMatch(sql, /using \(true\)/i);
  assert.doesNotMatch(sql, /to authenticated/i);
  assert.doesNotMatch(sql, /to anon/i);
}

for (const contract of TABLE_CONTRACTS) {
  const migrationSql = readFileSync(contract.migration, "utf8");
  const storeSource = readFileSync(contract.store, "utf8");

  test(`${contract.table}: migration enables deny-all RLS`, () => {
    assertDenyAllRls(migrationSql, contract.table, contract.policy);
  });

  test(`${contract.table}: server store uses service role client`, () => {
    assert.match(storeSource, /SUPABASE_SERVICE_ROLE_KEY/);
    assert.match(storeSource, new RegExp(contract.table));
    assert.doesNotMatch(storeSource, /SUPABASE_ANON_KEY|anon key/i);
  });
}

test("orders reference SQL enables deny-all RLS for orders table", () => {
  assert.match(ORDERS_REFERENCE_SQL, /alter table public\.orders enable row level security/);
  assert.match(ORDERS_REFERENCE_SQL, /drop policy if exists "orders_no_public_access"/);
  assert.match(ORDERS_REFERENCE_SQL, /create policy "orders_no_public_access"/);
  assert.match(ORDERS_REFERENCE_SQL, /for all/);
  assert.match(ORDERS_REFERENCE_SQL, /using \(false\)/);
  assert.match(ORDERS_REFERENCE_SQL, /with check \(false\)/);
});

test("customer-facing frontend does not query protected Supabase tables directly", () => {
  const protectedTablePatterns = [
    /order_change_requests/i,
    /order_notifications/i,
    /order_manual_pricing_drafts/i,
    /order_status_events/i,
    /constructor_projects/i,
    /\.from\(['"]profiles['"]\)/i,
    /\.from\(['"]orders['"]\)/i,
    /rest\/v1\/orders/i,
  ];

  for (const source of [CUSTOMER_ORDER_DETAIL_CARD, CUSTOMER_ACCOUNT_CABINET]) {
    for (const pattern of protectedTablePatterns) {
      assert.doesNotMatch(source, pattern);
    }
    assert.doesNotMatch(source, /createClient|supabase/i);
  }
});

test("customer workspace API uses server-owned read model without direct protected table access in UI", () => {
  assert.match(CUSTOMER_WORKSPACE, /authorizeCustomerApi/);
  assert.doesNotMatch(CUSTOMER_ACCOUNT_CABINET, /order_manual_pricing_drafts|order_status_events/i);
});

test("order_status_events RLS static contract remains wired separately", () => {
  assert.match(ORDER_STATUS_EVENTS_PREP, /order_status_events_deny_all/);
  assert.match(ORDER_STATUS_EVENTS_PREP, /all order_status_events writers use service role client/);
});

test("static contract pack does not print secrets", () => {
  const serialized = JSON.stringify(TABLE_CONTRACTS);
  assert.doesNotMatch(serialized, /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  assert.doesNotMatch(serialized, /SUPABASE_SERVICE_ROLE_KEY=|service_role_key/i);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
