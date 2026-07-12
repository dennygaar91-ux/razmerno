import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  LIVE_RLS_APPROVAL_ENV_KEY,
  LIVE_RLS_APPROVAL_PHRASE,
  MANUAL_APPLY_STEPS,
  PREFLIGHT_CHECKS,
  RLS_MIGRATION_FILE,
  ROLLBACK_STEPS,
  VERIFICATION_QUERIES,
  buildLiveRlsApplyPlan,
  parseRlsApplyPlanArgs,
  validateLiveRlsApprovalPhrase,
  writeLiveRlsApplyPlanArtifacts,
} from "../scripts/plan-live-rls-apply.mjs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("live RLS apply plan identifies migration files and extracted SQL", () => {
  const plan = buildLiveRlsApplyPlan({ args: parseRlsApplyPlanArgs([]) });
  assert.equal(plan.liveMutationPerformed, false);
  assert.equal(plan.requiresExplicitApproval, true);
  assert.ok(plan.migrationFiles.includes(RLS_MIGRATION_FILE));
  assert.match(plan.extractedSql, /enable row level security/i);
  assert.match(plan.extractedSql, /order_status_events_deny_all/);
});

test("live RLS apply plan lists preflight manual rollback and verification steps", () => {
  const plan = buildLiveRlsApplyPlan({ args: parseRlsApplyPlanArgs([]) });
  assert.ok(plan.preflightChecks.length >= PREFLIGHT_CHECKS.length);
  assert.ok(plan.manualApplySteps.length >= MANUAL_APPLY_STEPS.length);
  assert.ok(plan.rollbackSteps.length >= ROLLBACK_STEPS.length);
  assert.ok(plan.verificationQueries.length >= VERIFICATION_QUERIES.length);
});

test("live RLS apply plan refuses --apply and avoids printing secrets", () => {
  const plan = buildLiveRlsApplyPlan({ args: parseRlsApplyPlanArgs(["--apply"]) });
  assert.equal(plan.applyFlagPassed, true);
  assert.match(plan.applyBlockedReason || "", /refused|approval phrase/i);
  const serialized = JSON.stringify(plan);
  assert.doesNotMatch(serialized, /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  assert.equal(plan.envPresence.every((item) => "present" in item && !("value" in item)), true);
});

test("live RLS apply plan accepts exact approval phrase only", () => {
  const previous = process.env[LIVE_RLS_APPROVAL_ENV_KEY];
  process.env[LIVE_RLS_APPROVAL_ENV_KEY] = "WRONG_PHRASE";
  assert.equal(validateLiveRlsApprovalPhrase().ok, false);
  process.env[LIVE_RLS_APPROVAL_ENV_KEY] = LIVE_RLS_APPROVAL_PHRASE;
  assert.equal(validateLiveRlsApprovalPhrase().ok, true);
  if (previous === undefined) delete process.env[LIVE_RLS_APPROVAL_ENV_KEY];
  else process.env[LIVE_RLS_APPROVAL_ENV_KEY] = previous;
});

test("live RLS apply plan CLI exits non-zero for --apply without approval phrase", () => {
  const previous = process.env[LIVE_RLS_APPROVAL_ENV_KEY];
  delete process.env[LIVE_RLS_APPROVAL_ENV_KEY];
  let exitCode = 0;
  try {
    execFileSync("node", ["scripts/plan-live-rls-apply.mjs", "--apply"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const execError = error as NodeJS.ErrnoException & { status?: number; stderr?: string };
    exitCode = execError.status ?? 1;
    assert.match(String(execError.stderr || ""), /refused|approval phrase/i);
  }
  assert.notEqual(exitCode, 0);
  if (previous === undefined) delete process.env[LIVE_RLS_APPROVAL_ENV_KEY];
  else process.env[LIVE_RLS_APPROVAL_ENV_KEY] = previous;
});

test("live RLS apply plan writes artifacts without committing them", () => {
  const plan = buildLiveRlsApplyPlan({ args: parseRlsApplyPlanArgs([]) });
  const paths = writeLiveRlsApplyPlanArtifacts(plan);
  assert.equal(existsSync(paths.jsonPath), true);
  assert.equal(existsSync(paths.mdPath), true);
  const json = readFileSync(paths.jsonPath, "utf8");
  assert.match(json, /liveMutationPerformed": false/);
});

const SOURCE = readFileSync("scripts/plan-live-rls-apply.mjs", "utf8");

test("live RLS apply plan generator documents explicit approval requirement", () => {
  assert.match(SOURCE, /requiresExplicitApproval:\s*true/);
  assert.match(SOURCE, /liveMutationPerformed:\s*false/);
  assert.match(SOURCE, /LIVE_RLS_APPROVAL_PHRASE/);
  assert.match(SOURCE, /process\.exit\(1\)/);
});

console.log("\n7 passed");
