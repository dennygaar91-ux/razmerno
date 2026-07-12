import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  OPERATIONS_MANUAL_PRICING_DRAFT_STATUS,
  OPERATIONS_MANUAL_PRICING_DRAFT_FORBIDDEN_RESPONSE_KEYS,
} from "../api/_shared/operations-manual-pricing-draft-types";
import {
  OPERATIONS_MANUAL_PRICING_MAX_PRICE,
  OPERATIONS_MANUAL_PRICING_MIN_PRICE,
  OPERATIONS_MANUAL_PRICING_REASON_MAX_LENGTH,
} from "../api/_shared/operations-manual-pricing-draft-validation";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const MIGRATION_SQL = readFileSync("supabase/migrations/20260705_add_order_manual_pricing_drafts.sql", "utf8");
const REFERENCE_SQL = readFileSync("db/order-manual-pricing-drafts.sql", "utf8");
const STORE_SOURCE = readFileSync("api/_shared/operations-manual-pricing-drafts-store.ts", "utf8");
const WRITE_HANDLER_SOURCE = readFileSync("api/operations/manual-pricing-draft.ts", "utf8");
const DRAFT_SECTION_SOURCE = readFileSync("src/operations/OperationsManualPricingDraftSection.tsx", "utf8");
const DRAFT_API_SOURCE = readFileSync("src/shared/operations/operationsManualPricingDraftApi.ts", "utf8");

const REQUIRED_TABLE_COLUMNS = [
  "order_id text not null unique",
  "manual_total_price integer not null check (manual_total_price > 0)",
  "reason text",
  "status text not null default 'draft' check (status = 'draft')",
  "created_by text not null default 'admin'",
  "updated_by text not null default 'admin'",
  "created_at timestamptz not null default now()",
  "updated_at timestamptz not null default now()",
];

test("migration defines order_manual_pricing_drafts with expected draft-only columns", () => {
  assert.match(MIGRATION_SQL, /create table if not exists public\.order_manual_pricing_drafts/);
  for (const column of REQUIRED_TABLE_COLUMNS) {
    assert.match(MIGRATION_SQL, new RegExp(column.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("reference db SQL mirrors migration core table definition", () => {
  assert.match(REFERENCE_SQL, /create table if not exists public\.order_manual_pricing_drafts/);
  for (const column of REQUIRED_TABLE_COLUMNS) {
    assert.match(REFERENCE_SQL, new RegExp(column.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(REFERENCE_SQL, /20260705_add_order_manual_pricing_drafts\.sql/);
});

test("migration enables RLS with deny-all policy only", () => {
  assert.match(MIGRATION_SQL, /alter table public\.order_manual_pricing_drafts enable row level security/);
  assert.match(MIGRATION_SQL, /order_manual_pricing_drafts_deny_all/);
  assert.match(MIGRATION_SQL, /using \(false\)/);
  assert.match(MIGRATION_SQL, /with check \(false\)/);
  assert.doesNotMatch(MIGRATION_SQL, /using \(true\)/i);
  assert.doesNotMatch(MIGRATION_SQL, /to authenticated/i);
  assert.doesNotMatch(MIGRATION_SQL, /to anon/i);
});

test("reference db SQL enables RLS with deny-all policy only", () => {
  assert.match(REFERENCE_SQL, /alter table public\.order_manual_pricing_drafts enable row level security/);
  assert.match(REFERENCE_SQL, /order_manual_pricing_drafts_deny_all/);
  assert.match(REFERENCE_SQL, /using \(false\)/);
  assert.match(REFERENCE_SQL, /with check \(false\)/);
});

test("migration has upsert-safe unique order_id index", () => {
  assert.match(MIGRATION_SQL, /order_id text not null unique/);
  assert.match(MIGRATION_SQL, /order_manual_pricing_drafts_order_id_idx/);
});

test("API validation bounds align with migration price constraints", () => {
  assert.equal(OPERATIONS_MANUAL_PRICING_MIN_PRICE, 1);
  assert.ok(OPERATIONS_MANUAL_PRICING_MAX_PRICE >= OPERATIONS_MANUAL_PRICING_MIN_PRICE);
  assert.match(MIGRATION_SQL, /manual_total_price integer not null check \(manual_total_price > 0\)/);
  assert.equal(OPERATIONS_MANUAL_PRICING_DRAFT_STATUS, "draft");
  assert.match(MIGRATION_SQL, /check \(status = 'draft'\)/);
});

test("API reason max length is enforced server-side for live verification prep", () => {
  assert.equal(OPERATIONS_MANUAL_PRICING_REASON_MAX_LENGTH, 500);
  assert.match(REFERENCE_SQL, /reason text/);
});

test("draft store uses service role client and expected table/columns only", () => {
  assert.match(STORE_SOURCE, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(STORE_SOURCE, /\.from\('order_manual_pricing_drafts'\)/);
  assert.match(STORE_SOURCE, /manual_total_price/);
  assert.match(STORE_SOURCE, /updated_by/);
  assert.match(STORE_SOURCE, /created_by/);
  assert.doesNotMatch(STORE_SOURCE, /SUPABASE_ANON_KEY|anon key/i);
});

test("write API handler does not mutate order status or production workflow", () => {
  assert.match(WRITE_HANDLER_SOURCE, /upsertOperationsManualPricingDraft/);
  assert.match(WRITE_HANDLER_SOURCE, /getAdminOrderByOrderId/);
  assert.doesNotMatch(WRITE_HANDLER_SOURCE, /updateOrderStatus|production_export|total_price|payment/i);
});

test("frontend manual pricing draft uses API only without direct database access", () => {
  assert.match(DRAFT_SECTION_SOURCE, /saveOperationsManualPricingDraft/);
  assert.match(DRAFT_API_SOURCE, /\/api\/operations\/manual-pricing-draft/);
  assert.doesNotMatch(DRAFT_SECTION_SOURCE, /createClient|supabase|order_manual_pricing_drafts/i);
  assert.doesNotMatch(DRAFT_API_SOURCE, /createClient|supabase|order_manual_pricing_drafts/i);
});

test("safe DTO forbids raw PII production export and price breakdown keys", () => {
  assert.ok(OPERATIONS_MANUAL_PRICING_DRAFT_FORBIDDEN_RESPONSE_KEYS.includes("customer_name"));
  assert.ok(OPERATIONS_MANUAL_PRICING_DRAFT_FORBIDDEN_RESPONSE_KEYS.includes("production_export"));
  assert.ok(OPERATIONS_MANUAL_PRICING_DRAFT_FORBIDDEN_RESPONSE_KEYS.includes("price_breakdown"));
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
