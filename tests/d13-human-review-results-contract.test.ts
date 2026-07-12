import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildHumanReviewResultsFromMarkdown,
  parseHumanReviewChecklist,
  parseReviewStatus,
  summarizeHumanReviewResults,
} from "../scripts/d13-human-review-results.mjs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("human review parser treats unchecked checklist as safe default", () => {
  const markdown = [
    "### landing",
    "- review status: [ ] unchecked / [ ] pass / [ ] issue / [ ] blocked",
    "- severity: none / P0 / P1 / P2 / P3",
    "- reviewer notes:",
  ].join("\n");
  const results = buildHumanReviewResultsFromMarkdown(markdown);
  assert.equal(results.summary.unchecked, 1);
  assert.equal(results.closureEligible, false);
  assert.equal(results.d13Closed, false);
});

test("human review parser counts explicit pass/issue/blocked statuses", () => {
  assert.equal(parseReviewStatus("- review status: [x] pass"), "pass");
  assert.equal(parseReviewStatus("- review status: [x] issue"), "issue");
  assert.equal(parseReviewStatus("- review status: [x] blocked"), "blocked");

  const results = summarizeHumanReviewResults(
    parseHumanReviewChecklist([
      "### a",
      "- review status: [x] pass",
      "- severity: none",
      "### b",
      "- review status: [x] issue",
      "- severity: P2",
      "### c",
      "- review status: [x] blocked",
      "- severity: P0",
    ].join("\n")),
  );

  assert.equal(results.summary.pass, 1);
  assert.equal(results.summary.issue, 1);
  assert.equal(results.summary.blocked, 1);
  assert.equal(results.summary.P0, 1);
  assert.equal(results.summary.P2, 1);
});

test("human review parser refuses local-only D-13 closure even when all pass", () => {
  const results = summarizeHumanReviewResults(
    parseHumanReviewChecklist([
      "### landing",
      "- review status: [x] pass",
      "- severity: none",
      "### checkout",
      "- review status: [x] pass",
      "- severity: none",
    ].join("\n")),
  );

  assert.equal(results.summary.pass, 2);
  assert.equal(results.closureEligible, false);
  assert.equal(results.d13Closed, false);
});

test("human review parser allows closureEligible only with explicit external gates", () => {
  const shots = parseHumanReviewChecklist([
    "### landing",
    "- review status: [x] pass",
    "- severity: none",
  ].join("\n"));

  const blocked = summarizeHumanReviewResults(shots);
  const eligible = summarizeHumanReviewResults(shots, {
    remotePreviewVisualQa: true,
    humanApprovalMetadata: true,
    mainGithubQa: true,
  });

  assert.equal(blocked.closureEligible, false);
  assert.equal(eligible.closureEligible, true);
  assert.equal(eligible.d13Closed, false);
});

const SOURCE = readFileSync("scripts/d13-human-review-results.mjs", "utf8");

test("human review results script does not claim D-13 closed from checklist alone", () => {
  assert.match(SOURCE, /d13Closed:\s*false/);
  assert.match(SOURCE, /closureClaimed:\s*false/);
  assert.match(SOURCE, /do not close D-13/i);
});

console.log("\n5 passed");
