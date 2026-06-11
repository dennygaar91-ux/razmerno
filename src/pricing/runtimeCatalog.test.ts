import assert from "node:assert/strict";
import { fetchPriceItems } from "../../api/_shared/price-items-store";

type TestResult = { name: string; passed: boolean; error?: string };
const results: TestResult[] = [];

function test(name: string, fn: () => Promise<void> | void) {
  Promise.resolve()
    .then(fn)
    .then(() => results.push({ name, passed: true }))
    .catch((e) => results.push({ name, passed: false, error: e instanceof Error ? e.message : String(e) }));
}

test("Runtime price store: falls back to seed without env", async () => {
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  const result = await fetchPriceItems({ itemType: "board", producer: "Egger", thicknessMm: 16, limit: 10 });

  process.env.SUPABASE_URL = oldUrl;
  process.env.SUPABASE_SERVICE_ROLE_KEY = oldKey;

  assert.equal(result.source, "seed");
  assert.ok(result.items.length > 0);
  assert.ok(result.items.every((item) => item.itemType === "board"));
});

setTimeout(() => {
  console.log("");
  console.log("Runtime catalog tests:");
  for (const r of results) {
    console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
    if (!r.passed && r.error) console.log(`      ${r.error}`);
  }

  const failed = results.filter((r) => !r.passed).length;
  console.log("");
  console.log(`${results.length - failed}/${results.length} passed`);
  process.exit(failed > 0 ? 1 : 0);
}, 50);
