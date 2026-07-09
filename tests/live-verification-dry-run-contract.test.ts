import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  LIVE_RLS_APPROVAL_ENV_KEY,
  LIVE_RLS_APPROVAL_PHRASE,
} from "../scripts/plan-live-rls-apply.mjs";
import {
  REQUIRED_ENV_KEYS,
  buildLiveDryRunPlan,
  classifyHealthResult,
  isSafeRecipientEmail,
  parseLiveDryRunArgs,
  validateHealthPayload,
  validateSupabaseUrlShape,
} from "../scripts/verify-live-dry-run.mjs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("live dry-run refuses mutation unless explicit flag is passed", () => {
  const blocked = buildLiveDryRunPlan({ args: parseLiveDryRunArgs([]) });
  const rlsFlagWithoutApproval = buildLiveDryRunPlan({
    args: parseLiveDryRunArgs(["--allow-live-rls-probe"]),
  });
  const mutationFlagOnly = buildLiveDryRunPlan({
    args: parseLiveDryRunArgs(["--allow-mutation"]),
  });
  assert.equal(blocked.mutationAllowed, false);
  assert.equal(rlsFlagWithoutApproval.mutationAllowed, false);
  assert.equal(mutationFlagOnly.mutationAllowed, true);
  assert.match(
    blocked.steps.find((step) => step.id === "order-submit-live")?.status || "",
    /blocked-requires-explicit-approval/,
  );
});

test("live dry-run reports env presence without secret values", () => {
  const previous = { ...process.env };
  process.env.SUPABASE_URL = "https://abc.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-value";
  process.env.ADMIN_API_KEY = "secret-admin";
  process.env.SMOKE_BASE_URL = "http://localhost:3004";

  const plan = buildLiveDryRunPlan({ args: parseLiveDryRunArgs([]) });
  const serialized = JSON.stringify(plan);
  assert.doesNotMatch(serialized, /secret-value/);
  assert.doesNotMatch(serialized, /secret-admin/);
  assert.equal(plan.envPresence.every((item) => "present" in item && !("value" in item)), true);

  process.env = previous;
});

test("live dry-run validates health payload and supabase URL shape", () => {
  assert.equal(
    validateHealthPayload({
      ok: true,
      service: "razmerno-api",
      missing: [],
      checks: [],
    }).ok,
    true,
  );
  assert.equal(validateSupabaseUrlShape("https://abc.supabase.co").ok, true);
  assert.equal(validateSupabaseUrlShape("not-a-url").ok, false);
  assert.equal(classifyHealthResult({ skipped: true }).classification, "not-configured");
  assert.equal(
    classifyHealthResult({ skipped: false, ok: false, error: "fetch failed" }).classification,
    "environment-not-running",
  );
});

test("live dry-run enforces safe recipient constraints", () => {
  assert.equal(isSafeRecipientEmail("manager@example.test"), true);
  assert.equal(isSafeRecipientEmail("real.customer@gmail.com"), false);
});

test("live dry-run lists RLS probe as blocked without approval flag", () => {
  const plan = buildLiveDryRunPlan({ args: parseLiveDryRunArgs([]) });
  const rls = plan.steps.find((step) => step.id === "rls-live-probe");
  assert.equal(rls?.status, "blocked-requires-explicit-approval");
  assert.equal(rls?.requiresFlag, "--allow-live-rls-probe");
  const migration = plan.steps.find((step) => step.id === "live-migration-apply");
  const email = plan.steps.find((step) => step.id === "live-email-send");
  assert.equal(migration?.status, "blocked-requires-explicit-approval");
  assert.equal(email?.status, "blocked-requires-explicit-approval");
});

test("live dry-run CLI refuses --allow-live-rls-probe without exact approval phrase", () => {
  const previous = process.env[LIVE_RLS_APPROVAL_ENV_KEY];
  delete process.env[LIVE_RLS_APPROVAL_ENV_KEY];
  let exitCode = 0;
  try {
    execFileSync("node", ["scripts/verify-live-dry-run.mjs", "--allow-live-rls-probe"], {
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

test("live dry-run allows approval-gated RLS probe planning only with exact phrase", () => {
  const previous = process.env[LIVE_RLS_APPROVAL_ENV_KEY];
  process.env[LIVE_RLS_APPROVAL_ENV_KEY] = LIVE_RLS_APPROVAL_PHRASE;
  const plan = buildLiveDryRunPlan({
    args: parseLiveDryRunArgs(["--allow-live-rls-probe"]),
  });
  assert.equal(plan.mutationAllowed, true);
  assert.equal(
    plan.steps.find((step) => step.id === "rls-live-probe")?.status,
    "would-run-with-explicit-flag",
  );
  if (previous === undefined) delete process.env[LIVE_RLS_APPROVAL_ENV_KEY];
  else process.env[LIVE_RLS_APPROVAL_ENV_KEY] = previous;
});

const SOURCE = readFileSync("scripts/verify-live-dry-run.mjs", "utf8");

test("live dry-run script does not claim closure or perform live mutation by default", () => {
  assert.match(SOURCE, /closureClaimed:\s*false/);
  assert.match(SOURCE, /liveMutationPerformed:\s*false/);
  assert.match(SOURCE, /dry-run only/i);
  assert.match(SOURCE, /LIVE_RLS_APPROVAL_PHRASE/);
  for (const key of REQUIRED_ENV_KEYS) {
    assert.match(SOURCE, new RegExp(key));
  }
});

console.log("\n9 passed");
