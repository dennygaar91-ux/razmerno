import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  buildLocalBranchSummary,
  renderLocalBranchSummaryMarkdown,
  writeLocalBranchSummaryArtifacts,
} from "../scripts/generate-local-branch-summary.mjs";

const PACKAGE_JSON = readFileSync("package.json", "utf8");

const FORBIDDEN_OUTPUT_PATTERNS = [
  /pre-pr/i,
  /\bPR-ready\b/i,
  /\bPR handoff\b/i,
  /Pull Request/i,
  /Recommended PR/i,
  /\bPR draft\b/i,
] as const;

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("local branch summary script exists and old PR-named script is removed", () => {
  assert.match(PACKAGE_JSON, /"report:local-branch-summary"/);
  assert.match(PACKAGE_JSON, /generate-local-branch-summary\.mjs/);
  assert.doesNotMatch(PACKAGE_JSON, /report:branch-pre-pr-summary/);
  assert.doesNotMatch(PACKAGE_JSON, /generate-branch-pre-pr-summary\.mjs/);
  assert.doesNotMatch(PACKAGE_JSON, /test:branch-pre-pr-summary-contract/);
});

test("local branch summary does not claim closure or release readiness", () => {
  const summary = buildLocalBranchSummary();
  assert.equal(summary.closureClaimed, false);
  assert.equal(summary.releaseReady, false);
  assert.equal(summary.localIntegrationReady, false);
  assert.equal(summary.localBranchSummary, true);
  assert.equal(summary.visualStatus.d13ClosureClaimed, false);
  assert.equal(summary.visualStatus.visualQaDeferred, true);
});

test("local branch summary includes live mutation false and local handoff structure", () => {
  const summary = buildLocalBranchSummary();
  assert.equal(summary.liveStatus.liveMutationPerformed, false);
  assert.equal(summary.liveStatus.vercelDeployPerformed, false);
  assert.ok(summary.branch);
  assert.ok(summary.head);
  assert.ok(summary.localSummaryTitle);
  assert.ok(summary.recommendedLocalNextSteps.length >= 3);
  assert.ok(summary.localHandoffSummary.length > 0);
});

test("local branch summary output avoids secrets and forbidden workflow wording", () => {
  const summary = buildLocalBranchSummary();
  const serialized = JSON.stringify(summary);
  assert.doesNotMatch(serialized, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(serialized, /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  const md = renderLocalBranchSummaryMarkdown(summary);
  assert.match(md, /Recommended Next Local Steps/i);
  assert.doesNotMatch(md, /Recommended PR/i);
  for (const pattern of FORBIDDEN_OUTPUT_PATTERNS) {
    assert.doesNotMatch(serialized, pattern);
    assert.doesNotMatch(md, pattern);
  }
});

test("local branch summary writes local artifact names under artifacts/branch only", () => {
  const summary = buildLocalBranchSummary();
  const paths = writeLocalBranchSummaryArtifacts(summary);
  assert.equal(existsSync(paths.jsonPath), true);
  assert.equal(existsSync(paths.mdPath), true);
  assert.match(paths.jsonPath, /artifacts[\\/]+branch[\\/]+local-branch-summary\.json$/);
  const json = readFileSync(paths.jsonPath, "utf8");
  assert.match(json, /localBranchSummary": true/);
  assert.match(json, /closureClaimed": false/);
});

const SOURCE = readFileSync("scripts/generate-local-branch-summary.mjs", "utf8");

test("local branch summary generator includes blockers and local next steps hooks", () => {
  assert.match(SOURCE, /NON_CLOSURE_BLOCKERS/);
  assert.match(SOURCE, /RECOMMENDED_LOCAL_NEXT_STEPS/);
  assert.match(SOURCE, /liveMutationPerformed:\s*false/);
  assert.doesNotMatch(SOURCE, /prDraft|pre-pr|PR-ready|Pull Request/i);
});

console.log("\n6 passed");
