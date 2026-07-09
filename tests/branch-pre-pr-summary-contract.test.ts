import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  buildPrePrSummary,
  renderPrePrSummaryMarkdown,
  writePrePrSummaryArtifacts,
} from "../scripts/generate-branch-pre-pr-summary.mjs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("pre-pr summary does not claim closure or release readiness", () => {
  const summary = buildPrePrSummary();
  assert.equal(summary.closureClaimed, false);
  assert.equal(summary.releaseReady, false);
  assert.equal(summary.visualStatus.d13ClosureClaimed, false);
  assert.equal(summary.visualStatus.visualQaDeferred, true);
});

test("pre-pr summary includes live mutation false and PR-ready structure", () => {
  const summary = buildPrePrSummary();
  assert.equal(summary.liveStatus.liveMutationPerformed, false);
  assert.equal(summary.liveStatus.vercelDeployPerformed, false);
  assert.ok(summary.branch);
  assert.ok(summary.head);
  assert.ok(summary.prDraft.title);
  assert.ok(summary.prDraft.body.includes("Test plan"));
});

test("pre-pr summary avoids secrets and does not list generated artifacts as committed", () => {
  const summary = buildPrePrSummary();
  const serialized = JSON.stringify(summary);
  assert.doesNotMatch(serialized, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(serialized, /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  assert.doesNotMatch(serialized, /"committedArtifacts"/);
  const md = renderPrePrSummaryMarkdown(summary);
  assert.match(md, /visual QA: deferred/i);
  assert.match(md, /live mutation: no/i);
});

test("pre-pr summary writes artifacts under artifacts/branch only", () => {
  const summary = buildPrePrSummary();
  const paths = writePrePrSummaryArtifacts(summary);
  assert.equal(existsSync(paths.jsonPath), true);
  assert.equal(existsSync(paths.mdPath), true);
  assert.match(paths.jsonPath, /artifacts[\\/]+branch[\\/]+pre-pr-summary\.json$/);
  const json = readFileSync(paths.jsonPath, "utf8");
  assert.match(json, /closureClaimed": false/);
});

const SOURCE = readFileSync("scripts/generate-branch-pre-pr-summary.mjs", "utf8");

test("pre-pr summary generator includes blockers and script inventory hooks", () => {
  assert.match(SOURCE, /NON_CLOSURE_BLOCKERS/);
  assert.match(SOURCE, /listBranchScripts/);
  assert.match(SOURCE, /liveMutationPerformed:\s*false/);
});

console.log("\n5 passed");
