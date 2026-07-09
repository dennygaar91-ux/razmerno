import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  REQUIRED_ENV_KEYS,
  buildLiveDryRunPlan,
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
  const allowed = buildLiveDryRunPlan({
    args: parseLiveDryRunArgs(["--allow-mutation", "--allow-live-rls-probe"]),
  });
  assert.equal(blocked.mutationAllowed, false);
  assert.equal(allowed.mutationAllowed, true);
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
});

const SOURCE = readFileSync("scripts/verify-live-dry-run.mjs", "utf8");

test("live dry-run script does not claim closure or perform live mutation by default", () => {
  assert.match(SOURCE, /closureClaimed:\s*false/);
  assert.match(SOURCE, /liveMutationPerformed:\s*false/);
  assert.match(SOURCE, /dry-run only/i);
  for (const key of REQUIRED_ENV_KEYS) {
    assert.match(SOURCE, new RegExp(key));
  }
});

console.log("\n6 passed");
