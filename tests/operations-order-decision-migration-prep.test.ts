import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const MIGRATION_SQL = readFileSync("supabase/migrations/20260707_add_order_status_event_reason.sql", "utf8");
const REFERENCE_SQL = readFileSync("db/order-status-events.sql", "utf8");
const STORE_SOURCE = readFileSync("api/_shared/operations-order-decision-store.ts", "utf8");

test("migration adds nullable reason column to order_status_events idempotently", () => {
  assert.match(MIGRATION_SQL, /alter table if exists public\.order_status_events/);
  assert.match(MIGRATION_SQL, /add column if not exists reason text/);
});

test("reference db SQL mirrors migration reason column", () => {
  assert.match(REFERENCE_SQL, /add column if not exists reason text/);
  assert.match(REFERENCE_SQL, /20260707_add_order_status_event_reason\.sql/);
});

test("migration does not add permissive RLS policies", () => {
  assert.doesNotMatch(MIGRATION_SQL, /create policy/i);
  assert.doesNotMatch(MIGRATION_SQL, /using \(true\)/i);
  assert.doesNotMatch(MIGRATION_SQL, /to authenticated/i);
  assert.doesNotMatch(MIGRATION_SQL, /to anon/i);
});

test("decision store persists reason into order_status_events insert", () => {
  assert.match(STORE_SOURCE, /order_status_events/);
  assert.match(STORE_SOURCE, /reason: auditReason/);
});

test("frontend decision section does not access Supabase directly", () => {
  const section = readFileSync("src/operations/OperationsOrderDecisionSection.tsx", "utf8");
  assert.doesNotMatch(section, /createClient|supabase/i);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
