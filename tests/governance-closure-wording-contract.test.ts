import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { buildLocalFinalState } from "../scripts/generate-local-final-state.mjs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

const GOVERNANCE = "docs/planning/local-vs-formal-closure-governance.md";
const BACKLOG = "docs/planning/current-backlog.md";
const ACCEPTED = "docs/planning/accepted-backlog-decisions-v1.md";
const RPES_RECON = "docs/planning/rpes-local-formal-reconciliation.md";
const CHECK_SCRIPT = "scripts/check-governance-closure-wording.mjs";

test("governance closure governance doc exists with required statuses", () => {
  assert.equal(existsSync(GOVERNANCE), true);
  const text = readFileSync(GOVERNANCE, "utf8");
  for (const status of [
    "Closed — Local",
    "Closed — Formal",
    "Verified — Local",
    "Verified — Live",
    "Deferred by User",
    "Formal Pending",
  ]) {
    assert.match(text, new RegExp(status.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("backlog contains Package 13 local and formal status blocks", () => {
  const backlog = readFileSync(BACKLOG, "utf8");
  assert.match(backlog, /Package 13/);
  assert.match(backlog, /Local status:/);
  assert.match(backlog, /Formal status:/);
  assert.match(backlog, /P0-03[\s\S]{0,800}Closed — Local/i);
  assert.match(backlog, /P1-27[\s\S]{0,1200}Closed — Local/i);
});

test("accepted decisions include §19 governance hierarchy", () => {
  const accepted = readFileSync(ACCEPTED, "utf8");
  assert.match(accepted, /## 19\. Governance Source Hierarchy/);
  assert.match(accepted, /local-vs-formal-closure-governance\.md/);
  assert.match(accepted, /Closed — Local/);
  assert.match(accepted, /Closed — Formal/);
});

test("RPES local formal reconciliation doc exists", () => {
  assert.equal(existsSync(RPES_RECON), true);
  const text = readFileSync(RPES_RECON, "utf8");
  assert.match(text, /Approval View vs Manual Review/);
  assert.match(text, /D-13/);
});

test("check-governance-closure-wording script passes", () => {
  assert.equal(existsSync(CHECK_SCRIPT), true);
  const result = spawnSync(process.execPath, [CHECK_SCRIPT], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
  }
  assert.equal(result.status, 0);
});

test("governance doc forbids equating Closed — Local with release readiness", () => {
  const text = readFileSync(GOVERNANCE, "utf8");
  assert.match(text, /Closed — Local[\s\S]{0,500}Release readiness/i);
  assert.match(text, /not release readiness|is not:/i);
  assert.doesNotMatch(text, /Closed — Local means release-ready/i);
});

test("backlog keeps D-13 deferred and does not claim visual closure", () => {
  const backlog = readFileSync(BACKLOG, "utf8");
  const pkg13 = backlog.match(/### Package 13[\s\S]*?(?=### |$)/)?.[0] ?? backlog;
  assert.match(pkg13, /D-13[\s\S]{0,200}Deferred by User/i);
  assert.doesNotMatch(pkg13, /D-13[\s\S]{0,120}Closed — Formal/i);
});

test("local final state required wording includes formal pending and local-not-formal distinction", () => {
  const state = buildLocalFinalState();
  assert.ok(state.requiredWording.some((phrase) => /Closed — Local is not Closed — Formal/i.test(phrase)));
  assert.ok(state.requiredWording.some((phrase) => /order_status_events RLS is Verified — Live/i.test(phrase)));
  assert.ok(state.evidenceTracks.some((track) => /governance local vs formal closure/i.test(track.track)));
});
