import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  EXCLUDED_FROM_GATE,
  RELEASE_CANDIDATE_COMMANDS,
} from "../scripts/check-release-candidate-local.mjs";

const PACKAGE_JSON = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts: Record<string, string>;
};

const KEY_SCRIPTS = [
  "test:production-final-branch-verification",
  "test:pricing-final-branch-verification",
  "test:release-e2e",
  "verify:live:dry-run",
  "plan:live:rls-apply",
  "check:release-candidate-local",
  "check:release-security",
  "check:bundle-baseline",
  "test:observability-contract",
  "test:customer-platform-mvp-boundary-contract",
  "test:operations-mvp-boundary-contract",
  "test:email-retry-failure-contract",
  "report:d13-local-visual-review-package",
  "dev:ports:check",
  "dev:ports:clean",
] as const;

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("package script integration: key scripts exist once", () => {
  const names = Object.keys(PACKAGE_JSON.scripts);
  assert.equal(new Set(names).size, names.length);
  for (const script of KEY_SCRIPTS) {
    assert.ok(PACKAGE_JSON.scripts[script], `missing script ${script}`);
  }
});

test("package script integration: node script targets exist on disk", () => {
  const missing: string[] = [];
  for (const [name, command] of Object.entries(PACKAGE_JSON.scripts)) {
    const match = command.match(/node (?:--[^\s]+\s+)*((?:scripts|tests|src)\/[^\s&]+)/);
    if (!match) continue;
    const file = match[1];
    if (!existsSync(file)) missing.push(`${name} -> ${file}`);
  }
  assert.deepEqual(missing, []);
});

test("package script integration: release candidate gate references existing scripts only", () => {
  for (const command of RELEASE_CANDIDATE_COMMANDS) {
    const match = command.match(/^npm run ([^\s]+)$/);
    if (!match) continue;
    assert.ok(PACKAGE_JSON.scripts[match[1]], `RC gate missing script ${match[1]}`);
  }
});

test("package script integration: aggregate gate excludes D-13 visual closure scripts", () => {
  const serialized = JSON.stringify(RELEASE_CANDIDATE_COMMANDS);
  assert.doesNotMatch(serialized, /report:d13|capture:d13/i);
  assert.ok(EXCLUDED_FROM_GATE.some((item) => /D-13 visual/i.test(item)));
});

test("package script integration: live scripts are dry-run or plan-only by default", () => {
  const dryRun = readFileSync("scripts/verify-live-dry-run.mjs", "utf8");
  const plan = readFileSync("scripts/plan-live-rls-apply.mjs", "utf8");
  assert.match(dryRun, /liveMutationPerformed:\s*false/);
  assert.match(plan, /liveMutationPerformed:\s*false/);
  assert.match(plan, /process\.exit\(1\)/);
});

console.log("\n5 passed");
