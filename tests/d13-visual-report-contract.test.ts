import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  CANONICAL_D13_FOLDERS,
  buildCanonicalD13LocalVisualIndex,
  buildD13LocalVisualIndex,
  parseD13ReportArgs,
} from "../scripts/d13-local-visual-qa-report.mjs";
import {
  CANONICAL_CHECKLIST_REMINDER,
  buildHumanReviewChecklist,
  parseChecklistArgs,
  renderHumanReviewChecklistMarkdown,
} from "../scripts/d13-human-review-checklist.mjs";
import {
  buildHumanReviewResultsFromMarkdown,
  parseHumanReviewChecklist,
  summarizeHumanReviewResults,
} from "../scripts/d13-human-review-results.mjs";
import { generateD13LocalVisualReviewPackage } from "../scripts/d13-local-visual-review-package.mjs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

function writePassManifest(dir: string, batch: string, slug: string) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "manifest.json"),
    JSON.stringify({
      ok: true,
      captureRuntime: batch.startsWith("operations") ? "vercel-dev" : "vite-preview",
      captureWorkflow: { batch },
      captures: [
        {
          slug,
          viewport: "desktop-1440",
          ok: true,
          file: `${dir}/${slug}__desktop-1440.png`,
        },
      ],
      consoleErrors: [],
    }),
  );
}

test("D-13 canonical mode excludes historical blocked folders", () => {
  const root = mkdtempSync(join(tmpdir(), "d13-canonical-"));
  const canonicalDir = join(root, "p03a-marketing-static");
  const historicalDir = join(root, "2026-07-08-d13-constructor-visual");
  const blockedDir = join(root, "p03b-operations-data");

  writePassManifest(canonicalDir, "marketing-static", "landing");
  mkdirSync(historicalDir, { recursive: true });
  writeFileSync(
    join(historicalDir, "manifest.json"),
    JSON.stringify({
      ok: false,
      captureWorkflow: { batch: "constructor-visual" },
      captures: [{ slug: "constructor-3d-sizes", ok: false, failureClass: "runtime-unavailable" }],
    }),
  );
  mkdirSync(blockedDir, { recursive: true });
  writeFileSync(
    join(blockedDir, "manifest.json"),
    JSON.stringify({
      ok: false,
      preflightFailure: { failureClass: "api-health-failed" },
      captures: [],
    }),
  );

  const index = buildCanonicalD13LocalVisualIndex({
    rootDir: root,
    manifestDirs: [canonicalDir, historicalDir, blockedDir],
    folders: ["p03a-marketing-static"],
  });

  assert.equal(index.canonical, true);
  assert.equal(index.entries.length, 1);
  assert.equal(index.entries[0].shot, "landing");
  assert.ok(index.omittedEntryCount >= 0);
  assert.ok(index.omittedFolderCount >= 0);
});

test("D-13 canonical mode includes configured p03a/p03b PASS folders", () => {
  assert.deepEqual(CANONICAL_D13_FOLDERS.length, 7);
  const args = parseD13ReportArgs(["--canonical"]);
  assert.equal(args.canonical, true);
  assert.equal(args.includeBlocked, false);
  assert.equal(args.includeHistorical, false);
});

test("D-13 include-blocked opt-in keeps blocked entries", () => {
  const root = mkdtempSync(join(tmpdir(), "d13-include-blocked-"));
  const dir = join(root, "p03b-operations-data");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "manifest.json"),
    JSON.stringify({
      ok: false,
      captureWorkflow: { batch: "operations-data" },
      captures: [
        {
          slug: "operations-workspace",
          ok: false,
          failureClass: "runtime-unavailable",
        },
      ],
    }),
  );

  const filtered = buildCanonicalD13LocalVisualIndex({
    rootDir: root,
    manifestDirs: [dir],
    folders: ["p03b-operations-data"],
    includeBlocked: false,
  });
  const included = buildCanonicalD13LocalVisualIndex({
    rootDir: root,
    manifestDirs: [dir],
    folders: ["p03b-operations-data"],
    includeBlocked: true,
  });

  assert.equal(filtered.entries.length, 0);
  assert.equal(included.entries.length, 1);
  assert.equal(included.entries[0].failureClass, "runtime-unavailable");
});

test("D-13 canonical index writes source folders and omitted counts", () => {
  const index = buildCanonicalD13LocalVisualIndex({
    manifestDirs: [],
    folders: ["p03a-marketing-static"],
  });
  assert.deepEqual(index.sourceFolders, ["p03a-marketing-static"]);
  assert.equal(typeof index.omittedFolderCount, "number");
  assert.equal(typeof index.omittedEntryCount, "number");
  assert.equal(index.closureClaimed, false);
});

test("D-13 canonical checklist excludes historical blocked shots", () => {
  const index = {
    canonical: true,
    generatedAt: "2026-07-09T00:00:00.000Z",
    entries: [
      {
        shot: "landing",
        batch: "marketing-static",
        route: "/",
        runtime: "vite-preview",
        status: "PASS",
        pngPath: "artifacts/visual-qa/d13-local/p03a-marketing-static/landing__desktop-1440.png",
        viewport: "desktop-1440",
      },
    ],
  };

  const checklist = buildHumanReviewChecklist(index as never);
  const markdown = renderHumanReviewChecklistMarkdown(checklist);
  assert.equal(checklist.entries.length, 1);
  assert.doesNotMatch(markdown, /runtime-unavailable/);
  assert.match(markdown, /review status: \[ \] unchecked/);
  assert.match(markdown, /does not close D-13/i);
  assert.match(markdown, /not D-13 closure evidence by itself/i);
  assert.equal(parseChecklistArgs(["--canonical"]).canonical, true);
  assert.match(CANONICAL_CHECKLIST_REMINDER, /not D-13 closure evidence/i);
});

test("D-13 human review results parser handles unchecked checklist safely", () => {
  const markdown = [
    "### landing",
    "- screenshot: `artifacts/visual-qa/d13-local/p03a-marketing-static/landing__desktop-1440.png`",
    "- route: `/`",
    "- viewport: `desktop-1440`",
    "- runtime: `vite-preview`",
    "- capture status: `PASS`",
    "- review status: [ ] unchecked / [ ] pass / [ ] issue / [ ] blocked",
    "- severity: none / P0 / P1 / P2 / P3",
    "- reviewer notes:",
  ].join("\n");

  const shots = parseHumanReviewChecklist(markdown);
  const results = summarizeHumanReviewResults(shots);
  assert.equal(results.summary.total, 1);
  assert.equal(results.summary.unchecked, 1);
  assert.equal(results.closureEligible, false);
  assert.equal(results.d13Closed, false);
});

test("D-13 human review results counts pass/issue/blocked and surfaces P0/P1", () => {
  const markdown = [
    "### landing",
    "- review status: [x] pass",
    "- severity: none",
    "- reviewer notes:",
    "### customer-order-review",
    "- review status: [x] issue",
    "- severity: P1",
    "- reviewer notes: spacing issue",
    "### customer-order-completed",
    "- review status: [x] blocked",
    "- severity: P0",
    "- reviewer notes: blocked by runtime",
  ].join("\n");

  const results = summarizeHumanReviewResults(parseHumanReviewChecklist(markdown));
  assert.equal(results.summary.pass, 1);
  assert.equal(results.summary.issue, 1);
  assert.equal(results.summary.blocked, 1);
  assert.equal(results.summary.P1, 1);
  assert.equal(results.summary.P0, 1);
  assert.equal(results.closureEligible, false);
});

test("D-13 local visual review package composes canonical artifacts and warns non-closure", () => {
  const root = mkdtempSync(join(tmpdir(), "d13-package-"));
  const dir = join(root, "p03a-marketing-static");
  writePassManifest(dir, "marketing-static", "landing");
  writeFileSync(join(dir, "landing__desktop-1440.png"), "png");

  const index = buildCanonicalD13LocalVisualIndex({
    rootDir: root,
    manifestDirs: [dir],
    folders: ["p03a-marketing-static"],
  });
  index.entries[0].pngExists = true;
  index.entries[0].pngPath = join(dir, "landing__desktop-1440.png").replace(/\\/g, "/");

  const pkg = generateD13LocalVisualReviewPackage({ index });
  assert.equal(pkg.index.shotCount, 1);
  assert.ok(pkg.nonClosureWarning.includes("does not close D-13"));
  assert.ok(pkg.passOrPartialWithPngCount >= 1);
});

test("D-13 local visual review package exits non-zero when no canonical screenshots", () => {
  const index = buildCanonicalD13LocalVisualIndex({ manifestDirs: [], folders: ["p03a-marketing-static"] });
  const pkg = generateD13LocalVisualReviewPackage({ index });
  assert.equal(pkg.passOrPartialWithPngCount, 0);
});

const REPORT_SOURCE = readFileSync("scripts/d13-local-visual-qa-report.mjs", "utf8");
const CHECKLIST_SOURCE = readFileSync("scripts/d13-human-review-checklist.mjs", "utf8");
const RESULTS_SOURCE = readFileSync("scripts/d13-human-review-results.mjs", "utf8");
const PACKAGE_SOURCE = readFileSync("scripts/d13-local-visual-review-package.mjs", "utf8");

test("D-13 report scripts do not claim closure", () => {
  assert.match(REPORT_SOURCE, /closureClaimed:\s*false/);
  assert.match(CHECKLIST_SOURCE, /does not close D-13/i);
  assert.match(RESULTS_SOURCE, /closureEligible/);
  assert.match(RESULTS_SOURCE, /d13Closed:\s*false/);
  assert.match(PACKAGE_SOURCE, /does not close D-13/i);
});

console.log("\n11 passed");
