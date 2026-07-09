import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  LIVE_RLS_APPROVAL_ENV_KEY,
  LIVE_RLS_APPROVAL_PHRASE,
  RLS_MIGRATION_FILE,
} from "../scripts/plan-live-rls-apply.mjs";
import {
  RUNBOOK_TARGET_TABLE,
  buildLiveRlsRunbook,
  parseLiveRlsRunbookArgs,
  writeLiveRlsRunbookArtifacts,
} from "../scripts/generate-live-rls-runbook.mjs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("live RLS runbook includes purpose target table migration files and SQL preview", () => {
  const runbook = buildLiveRlsRunbook({ args: parseLiveRlsRunbookArgs([]) });
  assert.match(runbook.purpose, /order_status_events/i);
  assert.equal(runbook.targetTable, RUNBOOK_TARGET_TABLE);
  assert.ok(runbook.migrationFiles.includes(RLS_MIGRATION_FILE));
  assert.match(runbook.sqlPreview, /enable row level security/i);
  assert.match(runbook.sqlPreview, /order_status_events_deny_all/);
});

test("live RLS runbook includes preflight backup manual apply verification rollback and safety sections", () => {
  const runbook = buildLiveRlsRunbook({ args: parseLiveRlsRunbookArgs([]) });
  assert.ok(runbook.preflightChecklist.length >= 3);
  assert.ok(runbook.backupRecommendations.length >= 2);
  assert.ok(runbook.manualApplyOptions.length >= 2);
  assert.ok(runbook.manualApplySteps.length >= 3);
  assert.ok(runbook.verificationQueries.length >= 2);
  assert.ok(runbook.rollbackSteps.length >= 2);
  assert.ok(runbook.safetyConstraints.length >= 3);
});

test("live RLS runbook documents approval phrase and non-closure status", () => {
  const runbook = buildLiveRlsRunbook({ args: parseLiveRlsRunbookArgs([]) });
  assert.equal(runbook.liveMutationPerformed, false);
  assert.equal(runbook.closureClaimed, false);
  assert.equal(runbook.requiresExplicitApproval, true);
  assert.equal(runbook.approvalEnvKey, LIVE_RLS_APPROVAL_ENV_KEY);
  assert.equal(runbook.approvalPhraseRequired, LIVE_RLS_APPROVAL_PHRASE);
  assert.match(runbook.nonClosureReminder, /not closure evidence|does not apply migrations/i);
});

test("live RLS runbook writes artifacts without secrets", () => {
  const runbook = buildLiveRlsRunbook({ args: parseLiveRlsRunbookArgs([]) });
  const paths = writeLiveRlsRunbookArtifacts(runbook);
  assert.equal(existsSync(paths.jsonPath), true);
  assert.equal(existsSync(paths.mdPath), true);
  const json = readFileSync(paths.jsonPath, "utf8");
  assert.match(json, /liveMutationPerformed": false/);
  assert.doesNotMatch(json, /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
});

const SOURCE = readFileSync("scripts/generate-live-rls-runbook.mjs", "utf8");

test("live RLS runbook generator avoids deploy merge push and automatic apply wording", () => {
  assert.match(SOURCE, /liveMutationPerformed:\s*false/);
  assert.match(SOURCE, /closureClaimed:\s*false/);
  assert.doesNotMatch(SOURCE, /git push|gh pr create|vercel deploy/i);
});

console.log("\n5 passed");
