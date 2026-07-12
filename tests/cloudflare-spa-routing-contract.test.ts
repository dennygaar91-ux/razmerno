import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

const REDIRECTS_PATH = "public/_redirects";

test("cloudflare spa routing file exists", () => {
  const source = readFileSync(REDIRECTS_PATH, "utf8");
  assert.ok(source.trim().length > 0, `${REDIRECTS_PATH} must not be empty`);
});

test("cloudflare spa routing sends client routes to index.html", () => {
  const source = readFileSync(REDIRECTS_PATH, "utf8");
  assert.match(source, /\/\*[\s]+\/index\.html[\s]+200/);
});

test("cloudflare spa routing documents api precedence via pages functions", () => {
  const source = readFileSync(REDIRECTS_PATH, "utf8");
  assert.match(source, /Pages Functions/i);
  assert.doesNotMatch(source, /\/api\/\*[\s]+404\s*$/m, "invalid cloudflare redirect target");
});

test("vercel.json configurator rewrites remain for legacy host", () => {
  const vercel = readFileSync("vercel.json", "utf8");
  assert.match(vercel, /\/configurator/);
});

console.log("Cloudflare SPA routing contract tests passed.");
