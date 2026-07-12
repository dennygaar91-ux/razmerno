import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

function normalizeSql(sql: string): string {
  return sql
    .replace(/--.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function assertDenyAllRls(sql: string, table: string, policy: string) {
  const normalized = normalizeSql(sql);
  assert.match(normalized, new RegExp(`alter table public\\.${table} enable row level security`));
  assert.match(normalized, new RegExp(`drop policy if exists ${policy}`));
  assert.match(normalized, new RegExp(`create policy ${policy}`));
  assert.match(normalized, /for all/);
  assert.match(normalized, /using \(false\)/);
  assert.match(normalized, /with check \(false\)/);
  assert.doesNotMatch(normalized, /using \(true\)/);
  assert.doesNotMatch(normalized, /to authenticated/);
  assert.doesNotMatch(normalized, /to anon/);
}

const TABLE_DRIFT_CONTRACTS = [
  {
    table: "profiles",
    migration: "supabase/migrations/20260623_add_customer_profiles.sql",
    policy: "profiles_deny_all",
  },
  {
    table: "constructor_projects",
    migration: "supabase/migrations/20260703_add_constructor_projects.sql",
    policy: "constructor_projects_deny_all",
  },
  {
    table: "order_change_requests",
    migration: "supabase/migrations/20260703_add_order_change_requests.sql",
    policy: "order_change_requests_deny_all",
  },
  {
    table: "order_notifications",
    migration: "supabase/migrations/20260703_add_order_notifications.sql",
    policy: "order_notifications_deny_all",
  },
  {
    table: "order_manual_pricing_drafts",
    migration: "supabase/migrations/20260705_add_order_manual_pricing_drafts.sql",
    policy: "order_manual_pricing_drafts_deny_all",
  },
] as const;

const ORDER_STATUS_EVENTS = {
  migration: "supabase/migrations/20260708_enable_order_status_events_rls.sql",
  reference: "db/order-status-events.sql",
  policy: "order_status_events_deny_all",
  table: "order_status_events",
} as const;

const ORDERS_REFERENCE = {
  reference: "db/orders.sql",
  policy: '"orders_no_public_access"',
  table: "orders",
} as const;

for (const contract of TABLE_DRIFT_CONTRACTS) {
  test(`migration/reference drift: ${contract.table} migration exists with deny-all RLS`, () => {
    assert.equal(existsSync(contract.migration), true, `missing migration ${contract.migration}`);
    const migrationSql = readFileSync(contract.migration, "utf8");
    assertDenyAllRls(migrationSql, contract.table, contract.policy);
  });
}

test("migration/reference drift: order_status_events migration mirrors reference SQL policy", () => {
  assert.equal(existsSync(ORDER_STATUS_EVENTS.migration), true);
  assert.equal(existsSync(ORDER_STATUS_EVENTS.reference), true);

  const migrationSql = readFileSync(ORDER_STATUS_EVENTS.migration, "utf8");
  const referenceSql = readFileSync(ORDER_STATUS_EVENTS.reference, "utf8");

  assertDenyAllRls(migrationSql, ORDER_STATUS_EVENTS.table, ORDER_STATUS_EVENTS.policy);
  assertDenyAllRls(referenceSql, ORDER_STATUS_EVENTS.table, ORDER_STATUS_EVENTS.policy);

  const migrationNormalized = normalizeSql(migrationSql);
  const referenceNormalized = normalizeSql(referenceSql);
  assert.match(migrationNormalized, /order_status_events_deny_all/);
  assert.match(referenceNormalized, /order_status_events_deny_all/);
});

test("migration/reference drift: orders reference SQL keeps deny-all RLS", () => {
  assert.equal(existsSync(ORDERS_REFERENCE.reference), true);
  const referenceSql = readFileSync(ORDERS_REFERENCE.reference, "utf8");
  assertDenyAllRls(referenceSql, ORDERS_REFERENCE.table, ORDERS_REFERENCE.policy);
});

test("migration/reference drift: protected tables have migration or reference SQL on disk", () => {
  const requiredPaths = [
    ...TABLE_DRIFT_CONTRACTS.map((item) => item.migration),
    ORDER_STATUS_EVENTS.migration,
    ORDER_STATUS_EVENTS.reference,
    ORDERS_REFERENCE.reference,
  ];
  for (const path of requiredPaths) {
    assert.equal(existsSync(path), true, `missing SQL source ${path}`);
  }
});

test("migration/reference drift contract performs no live DB calls", () => {
  const source = readFileSync("tests/migration-reference-sql-drift-contract.test.ts", "utf8");
  assert.doesNotMatch(source, /from ['"]@supabase\/supabase-js['"]/);
  assert.doesNotMatch(source, /from ['"]pg['"]/);
  assert.match(source, /readFileSync/);
});

test("migration/reference drift contract does not print secrets", () => {
  const serialized = JSON.stringify(TABLE_DRIFT_CONTRACTS);
  assert.doesNotMatch(serialized, /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  assert.doesNotMatch(serialized, /service_role_key/i);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
