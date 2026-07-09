import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  buildSupabaseRestUrl,
  normalizeSupabaseProjectUrl,
} from "../scripts/load-project-env.mjs";
import { normalizeSupabaseProjectUrl as normalizeApiSupabaseProjectUrl } from "../api/_shared/supabase-url";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

const ROOT = "https://gxfpgulkrpmlxfeuegpg.supabase.co";

for (const normalize of [
  { label: "scripts/load-project-env.mjs", fn: normalizeSupabaseProjectUrl },
  { label: "api/_shared/supabase-url.ts", fn: normalizeApiSupabaseProjectUrl },
]) {
  test(`${normalize.label} keeps canonical project root unchanged`, () => {
    assert.equal(normalize.fn(ROOT), ROOT);
  });

  test(`${normalize.label} removes trailing slash`, () => {
    assert.equal(normalize.fn(`${ROOT}/`), ROOT);
  });

  test(`${normalize.label} removes /rest/v1 suffix`, () => {
    assert.equal(normalize.fn(`${ROOT}/rest/v1`), ROOT);
    assert.equal(normalize.fn(`${ROOT}/rest/v1/`), ROOT);
  });

  test(`${normalize.label} rejects empty and invalid URLs safely`, () => {
    assert.equal(normalize.fn(undefined), null);
    assert.equal(normalize.fn("   "), null);
    assert.equal(normalize.fn("not-a-url"), null);
    assert.equal(normalize.fn("ftp://example.supabase.co"), null);
  });
}

test("buildSupabaseRestUrl appends /rest/v1 once after normalization", () => {
  const url = buildSupabaseRestUrl(`${ROOT}/rest/v1/`, "/rest/v1/order_status_events?select=id&limit=1");
  assert.equal(url, `${ROOT}/rest/v1/order_status_events?select=id&limit=1`);
  assert.doesNotMatch(url || "", /\/rest\/v1\/rest\/v1/);
});

test("normalization helpers do not embed secret-like JWT values", () => {
  const serialized = JSON.stringify({
    root: normalizeSupabaseProjectUrl(ROOT),
    rest: buildSupabaseRestUrl(ROOT, "/rest/v1/order_status_events"),
  });
  assert.doesNotMatch(serialized, /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
});

console.log("\n10 passed");
