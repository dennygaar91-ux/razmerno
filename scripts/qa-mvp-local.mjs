import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptFile = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptFile);
const repoRoot = path.resolve(scriptDir, "..");
const npmExecPath = process.env.npm_execpath;

if (!npmExecPath) {
  console.error("npm_execpath is not available. Run qa:mvp-local through npm.");
  process.exit(1);
}

const steps = [
  "typecheck",
  "build",
  "check:constructor3d-architecture",
  "test:constructor-flow",
  "test:constructor-store",
  "test:constructor-payload",
  "test:constructor-three",
  "test:constructor-three-safety",
  "test:checkout-submit-hook",
  "test:admin-order-summary",
  "test:webgl-fallback-e2e",
  "test:mvp-release-verification-e2e",
];

for (const step of steps) {
  console.log(`\n=== ${step} ===`);

  const result = spawnSync(process.execPath, [npmExecPath, "run", step], {
    stdio: "inherit",
    env: process.env,
    cwd: repoRoot,
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\nMVP local QA pack passed.");
