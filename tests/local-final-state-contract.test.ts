import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  FINAL_STATE_JSON,
  REQUIRED_WORDING,
  buildLocalFinalState,
  renderLocalFinalStateMarkdown,
  writeLocalFinalStateArtifacts,
} from "../scripts/generate-local-final-state.mjs";

const FORBIDDEN_PATTERNS = [
  /backlog closed/i,
  /release ready/i,
  /D-13 closed/i,
  /formal closure complete/i,
  /git push/i,
  /gh pr create/i,
  /vercel deploy/i,
] as const;

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("local final state does not claim release readiness or backlog closure", () => {
  const state = buildLocalFinalState();
  assert.equal(state.closureClaimed, false);
  assert.equal(state.releaseReady, false);
  assert.equal(state.backlogChanged, false);
  for (const phrase of REQUIRED_WORDING) {
    assert.ok(state.requiredWording.includes(phrase));
  }
});

test("local final state states visual QA deferred and RLS live verification separately", () => {
  const state = buildLocalFinalState();
  assert.equal(state.visualStatus.visualQaDeferred, true);
  assert.equal(state.visualStatus.d13ClosureClaimed, false);
  assert.equal(state.rlsLiveVerification.liveVerifiedNotFormalClosure, true);
  assert.match(state.requiredWording.join(" "), /Visual QA remains deferred by user/i);
  assert.match(state.requiredWording.join(" "), /Closed — Local is not Closed — Formal/i);
  assert.match(state.requiredWording.join(" "), /order_status_events RLS is Verified — Live/i);
});

test("local final state does not recommend PR push merge deploy by default", () => {
  const state = buildLocalFinalState();
  const serialized = JSON.stringify(state);
  const md = renderLocalFinalStateMarkdown(state);
  for (const pattern of FORBIDDEN_PATTERNS) {
    assert.doesNotMatch(serialized, pattern);
    assert.doesNotMatch(md, pattern);
  }
  assert.match(serialized, /Do not push, merge, or deploy unless the user explicitly chooses/i);
});

test("local final state has no secrets and writes under artifacts/branch only", () => {
  const state = buildLocalFinalState();
  const paths = writeLocalFinalStateArtifacts(state);
  assert.equal(existsSync(paths.jsonPath), true);
  assert.equal(existsSync(paths.mdPath), true);
  assert.match(paths.jsonPath, new RegExp(`artifacts[\\\\/]branch[\\\\/]${FINAL_STATE_JSON}$`));
  const json = readFileSync(paths.jsonPath, "utf8");
  assert.doesNotMatch(json, /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  assert.doesNotMatch(json, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(json, /localConsolidationEvidence": true/);
});

const SOURCE = readFileSync("scripts/generate-local-final-state.mjs", "utf8");

test("local final state generator includes evidence tracks and non-closure wording", () => {
  assert.match(SOURCE, /local consolidation evidence, not backlog closure/i);
  assert.match(SOURCE, /No release readiness is claimed/i);
  assert.match(SOURCE, /EVIDENCE_TRACKS/);
  assert.match(SOURCE, /closureClaimed:\s*false/);
});

console.log("\n5 passed");
