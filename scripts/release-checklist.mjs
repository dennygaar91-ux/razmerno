import { spawnSync } from "node:child_process";

const checks = [
  ["check:constructor-architecture", "Constructor architecture guard"],
  ["check:static-pages-architecture", "Static pages architecture guard"],
  ["check:no-static-html-pages", "No static HTML pages guard"],
  ["report:react-components", "React component inventory"],
  ["report:css-inventory", "CSS inventory"],
  ["test:constructor-flow", "Constructor flow smoke"],
  ["test:constructor-pii-order", "Constructor PII/order guard"],
  ["test:constructor-store", "Constructor store tests"],
  ["test:constructor-draft", "Constructor draft tests"],
  ["test:constructor-payload", "Constructor payload tests"],
  ["test:production-preview", "Production preview tests"],
  ["typecheck", "TypeScript typecheck"],
  ["build", "Production build"],
  ["check:no-server", "No legacy server guard"],
  ["check:normal-urls", "Normal URL guard"],
  ["check:root-docs", "Root docs cleanup guard"],
  ["check:legacy-runtime-imports", "Legacy runtime imports guard"],
  ["test:pricing-engine", "Pricing engine tests"],
  ["test:delivery", "Delivery tests"],
  ["test:pricing-final", "Final pricing smoke tests"],
];

const results = [];
const startedAt = Date.now();

console.log("Release checklist started");
console.log(`Checks: ${checks.length}`);
console.log("");

for (const [script, label] of checks) {
  const started = Date.now();
  console.log(`▶ ${label}`);
  console.log(`  npm run ${script}`);

  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  const durationMs = Date.now() - started;
  const ok = result.status === 0;

  results.push({
    script,
    label,
    ok,
    durationMs,
  });

  if (!ok) {
    console.error("");
    console.error(`✗ Release checklist failed on: ${script}`);
    console.error(`  ${label}`);
    process.exit(result.status ?? 1);
  }

  console.log(`✓ ${label} passed in ${(durationMs / 1000).toFixed(1)}s`);
  console.log("");
}

const totalMs = Date.now() - startedAt;

console.log("Release checklist passed");
console.log(`Total time: ${(totalMs / 1000).toFixed(1)}s`);
console.log("");
for (const item of results) {
  console.log(`✓ ${item.script} — ${(item.durationMs / 1000).toFixed(1)}s`);
}
