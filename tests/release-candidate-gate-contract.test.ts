import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  NON_CLOSURE_BLOCKERS,
  RELEASE_CANDIDATE_COMMANDS,
  buildReleaseCandidatePlan,
  summarizeReleaseCandidateResults,
} from "../scripts/check-release-candidate-local.mjs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("release candidate gate includes required commands", () => {
  const required = [
    "npm test",
    "npm run typecheck",
    "npm run typecheck:api",
    "npm run build",
    "npm run test:release-e2e",
    "npm run check:release-security",
    "npm run verify:live:dry-run",
  ];
  for (const command of required) {
    assert.ok(RELEASE_CANDIDATE_COMMANDS.includes(command));
  }
});

test("release candidate gate reports non-closure blockers", () => {
  const plan = buildReleaseCandidatePlan();
  assert.equal(plan.closureClaimed, false);
  assert.equal(plan.releaseReady, false);
  assert.ok(plan.blockers.some((item) => /Visual QA/i.test(item)));
  assert.ok(plan.blockers.some((item) => /GitHub QA/i.test(item)));
  assert.deepEqual(plan.blockers, NON_CLOSURE_BLOCKERS);
});

test("release candidate gate does not claim release readiness from local checks alone", () => {
  const summary = summarizeReleaseCandidateResults([
    { command: "npm test", ok: true, status: 0, stdout: "", stderr: "" },
    { command: "npm run build", ok: true, status: 0, stdout: "", stderr: "" },
  ]);
  assert.equal(summary.releaseReady, false);
  assert.equal(summary.closureClaimed, false);
});

test("release candidate gate handles failed commands clearly", () => {
  const summary = summarizeReleaseCandidateResults([
    { command: "npm test", ok: true, status: 0, stdout: "", stderr: "" },
    { command: "npm run build", ok: false, status: 1, stdout: "", stderr: "failed" },
  ]);
  assert.equal(summary.failed, 1);
  assert.deepEqual(summary.failedCommands, ["npm run build"]);
});

const SOURCE = readFileSync("scripts/check-release-candidate-local.mjs", "utf8");

test("release candidate gate composes boundary and live dry-run checks", () => {
  assert.match(SOURCE, /test:customer-platform-mvp-boundary-contract/);
  assert.match(SOURCE, /test:operations-mvp-boundary-contract/);
  assert.match(SOURCE, /verify:live:dry-run/);
  assert.match(SOURCE, /process\.exit\(1\)/);
});

console.log("\n5 passed");
