import assert from "node:assert/strict";

import { normalizeSupabaseProjectUrl } from "../api/_shared/supabase-url";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

test("normalizeSupabaseProjectUrl strips /rest/v1 suffix and trailing slash", () => {
  assert.equal(
    normalizeSupabaseProjectUrl("https://example.supabase.co/rest/v1/"),
    "https://example.supabase.co",
  );
  assert.equal(
    normalizeSupabaseProjectUrl("https://example.supabase.co/rest/v1"),
    "https://example.supabase.co",
  );
  assert.equal(normalizeSupabaseProjectUrl("https://example.supabase.co/"), "https://example.supabase.co");
});

test("normalizeSupabaseProjectUrl keeps canonical project root unchanged", () => {
  assert.equal(normalizeSupabaseProjectUrl("https://example.supabase.co"), "https://example.supabase.co");
});

test("normalizeSupabaseProjectUrl returns null for empty input", () => {
  assert.equal(normalizeSupabaseProjectUrl(undefined), null);
  assert.equal(normalizeSupabaseProjectUrl("   "), null);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
