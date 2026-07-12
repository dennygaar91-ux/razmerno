import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildCanonicalD13LocalVisualIndex } from "../scripts/d13-local-visual-qa-report.mjs";
import { generateD13LocalVisualReviewPackage } from "../scripts/d13-local-visual-review-package.mjs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("review package composes canonical index/checklist/results paths", () => {
  const root = mkdtempSync(join(tmpdir(), "d13-review-package-"));
  const dir = join(root, "p03a-marketing-static");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "landing__desktop-1440.png"), "png");
  writeFileSync(
    join(dir, "manifest.json"),
    JSON.stringify({
      ok: true,
      captureRuntime: "vite-preview",
      captureWorkflow: { batch: "marketing-static" },
      captures: [
        {
          slug: "landing",
          ok: true,
          viewport: "desktop-1440",
          file: join(dir, "landing__desktop-1440.png").replace(/\\/g, "/"),
        },
      ],
    }),
  );

  const index = buildCanonicalD13LocalVisualIndex({
    rootDir: root,
    manifestDirs: [dir],
    folders: ["p03a-marketing-static"],
  });
  index.entries[0].pngExists = true;

  const pkg = generateD13LocalVisualReviewPackage({ index });
  assert.match(pkg.indexPaths.jsonPath, /index\.canonical\.json$/);
  assert.match(pkg.indexPaths.mdPath, /index\.canonical\.md$/);
  assert.match(pkg.checklistPath, /human-review-checklist\.canonical\.md$/);
  assert.match(pkg.resultPaths.jsonPath, /human-review-results\.json$/);
});

test("review package excludes historical BLOCKED artifacts by default", () => {
  const root = mkdtempSync(join(tmpdir(), "d13-review-package-blocked-"));
  const blocked = join(root, "2026-07-08-d13-constructor-visual");
  mkdirSync(blocked, { recursive: true });
  writeFileSync(
    join(blocked, "manifest.json"),
    JSON.stringify({
      ok: false,
      captures: [{ slug: "constructor-3d-sizes", ok: false, failureClass: "runtime-unavailable" }],
    }),
  );

  const index = buildCanonicalD13LocalVisualIndex({
    rootDir: root,
    manifestDirs: [blocked],
    folders: ["p03a-marketing-static"],
  });
  assert.equal(index.entries.length, 0);
});

test("review package reports non-closure warning", () => {
  const pkg = generateD13LocalVisualReviewPackage({
    index: buildCanonicalD13LocalVisualIndex({ manifestDirs: [], folders: ["p03a-marketing-static"] }),
  });
  assert.match(pkg.nonClosureWarning, /does not claim human visual approval/i);
});

const SOURCE = readFileSync("scripts/d13-local-visual-review-package.mjs", "utf8");

test("review package command wires shared generators", () => {
  assert.match(SOURCE, /buildCanonicalD13LocalVisualIndex/);
  assert.match(SOURCE, /buildHumanReviewChecklist/);
  assert.match(SOURCE, /buildHumanReviewResultsFromMarkdown/);
  assert.match(SOURCE, /process\.exit\(1\)/);
});

console.log("\n4 passed");
