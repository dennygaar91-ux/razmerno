import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  PROBE_PLAN_JSON,
  SAFETY_CONSTRAINTS,
  buildRlsReadonlyProbePlan,
  parseRlsReadonlyProbePlanArgs,
  writeRlsReadonlyProbePlanArtifacts,
} from "../scripts/plan-rls-readonly-probes.mjs";
import { ADDITIONAL_PLANNED_PROBE_TABLES } from "../scripts/generate-live-rls-runbook.mjs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("RLS readonly probe plan lists all planned tables as read-only planned-not-executed", () => {
  const plan = buildRlsReadonlyProbePlan({ args: parseRlsReadonlyProbePlanArgs([]) });
  assert.equal(plan.tables.length, ADDITIONAL_PLANNED_PROBE_TABLES.length);
  for (const table of plan.tables) {
    assert.equal(table.probeStatus, "planned-not-executed");
    assert.equal(table.readOnlyProbeSafe, true);
    assert.ok(table.recommendedRestPath.includes("select=id"));
    assert.deepEqual(table.mutationMethodsForbidden, ["POST", "PATCH", "PUT", "DELETE"]);
  }
});

test("RLS readonly probe plan forbids live mutation and closure claims", () => {
  const plan = buildRlsReadonlyProbePlan({ args: parseRlsReadonlyProbePlanArgs([]) });
  assert.equal(plan.liveMutationPerformed, false);
  assert.equal(plan.closureClaimed, false);
  assert.equal(plan.plannedProbesExecuted, false);
  assert.equal(plan.networkCallsPerformed, false);
  assert.equal(plan.executeAllowed, false);
  assert.match(plan.nonClosureReminder, /not closure evidence/i);
});

test("RLS readonly probe plan writes artifacts without secrets", () => {
  const plan = buildRlsReadonlyProbePlan({ args: parseRlsReadonlyProbePlanArgs([]) });
  const paths = writeRlsReadonlyProbePlanArtifacts(plan);
  assert.equal(existsSync(paths.jsonPath), true);
  assert.equal(existsSync(paths.mdPath), true);
  const json = readFileSync(paths.jsonPath!, "utf8");
  assert.match(json, /liveMutationPerformed": false/);
  assert.doesNotMatch(json, /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  assert.match(paths.jsonPath!, new RegExp(PROBE_PLAN_JSON.replace(".", "\\.")));
});

test("RLS readonly probe plan script rejects --execute", () => {
  const source = readFileSync("scripts/plan-rls-readonly-probes.mjs", "utf8");
  assert.match(source, /does not support --execute/);
  assert.match(source, /liveMutationPerformed:\s*false/);
  assert.ok(SAFETY_CONSTRAINTS.length >= 3);
});

console.log("\n4 passed");
