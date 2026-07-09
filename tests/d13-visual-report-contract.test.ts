import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  buildD13LocalVisualIndex,
} from "../scripts/d13-local-visual-qa-report.mjs";
import {
  buildHumanReviewChecklist,
  renderHumanReviewChecklistMarkdown,
} from "../scripts/d13-human-review-checklist.mjs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("D-13 index reads multiple manifest folders and preserves failureClass", () => {
  const root = mkdtempSync(join(tmpdir(), "d13-index-"));
  const passDir = join(root, "p03a-marketing-static");
  const failDir = join(root, "p03b-blocked");
  mkdirSync(passDir, { recursive: true });
  mkdirSync(failDir, { recursive: true });

  writeFileSync(
    join(passDir, "manifest.json"),
    JSON.stringify({
      ok: true,
      captureRuntime: "vite-preview",
      captureWorkflow: { batch: "marketing-static" },
      captures: [
        {
          slug: "landing",
          viewport: "desktop-1440",
          ok: true,
          file: "artifacts/visual-qa/d13-local/p03a-marketing-static/landing__desktop-1440.png",
        },
      ],
      consoleErrors: [],
    }),
  );

  writeFileSync(
    join(failDir, "manifest.json"),
    JSON.stringify({
      ok: false,
      captureRuntime: "vercel-dev",
      captureWorkflow: { batch: "customer-data", explicit: ["customer-order-review"] },
      preflightFailure: { failureClass: "api-health-failed", detail: "HTTP 502" },
      captures: [],
      consoleErrors: [],
    }),
  );

  const index = buildD13LocalVisualIndex({
    rootDir: root,
    manifestDirs: [passDir, failDir],
  });

  const passEntry = index.entries.find((item) => item.shot === "landing");
  const failEntry = index.entries.find((item) => item.failureClass === "api-health-failed");

  assert.equal(index.entries.length, 2);
  assert.equal(passEntry?.status, "PASS");
  assert.equal(passEntry?.needsHumanReview, true);
  assert.equal(index.closureClaimed, false);
  assert.equal(failEntry?.status, "BLOCKED");
  assert.equal(failEntry?.failureClass, "api-health-failed");
});

test("D-13 index handles missing PNG safely", () => {
  const root = mkdtempSync(join(tmpdir(), "d13-missing-png-"));
  const dir = join(root, "sample");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "manifest.json"),
    JSON.stringify({
      ok: true,
      captureRuntime: "vercel-dev",
      captureWorkflow: { batch: "customer-data" },
      captures: [
        {
          slug: "customer-workspace",
          viewport: "desktop-1440",
          ok: true,
          file: "artifacts/visual-qa/d13-local/sample/missing.png",
        },
      ],
    }),
  );

  const index = buildD13LocalVisualIndex({
    rootDir: root,
    manifestDirs: [dir],
  });
  assert.equal(index.entries[0].pngExists, false);
  assert.equal(index.entries[0].needsHumanReview, true);
});

test("D-13 human checklist contains all indexed shots with review placeholders", () => {
  const index = {
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
      {
        shot: "customer-order-review",
        batch: "customer-order-review",
        route: "/account/order/uuid",
        runtime: "vercel-dev",
        status: "PASS",
        pngPath: "artifacts/visual-qa/d13-local/p03b-customer-order-review/customer-order-review__desktop-1440.png",
        viewport: "desktop-1440",
      },
    ],
  };

  const checklist = buildHumanReviewChecklist(index as never);
  const markdown = renderHumanReviewChecklistMarkdown(checklist);

  assert.equal(checklist.entries.length, 2);
  assert.match(markdown, /review status: \[ \] unchecked/);
  assert.match(markdown, /severity: none \/ P0 \/ P1 \/ P2 \/ P3/);
  assert.match(markdown, /does not close D-13/i);
  assert.match(markdown, /landing/);
  assert.match(markdown, /customer-order-review/);
});

const REPORT_SOURCE = readFileSync("scripts/d13-local-visual-qa-report.mjs", "utf8");
const CHECKLIST_SOURCE = readFileSync("scripts/d13-human-review-checklist.mjs", "utf8");

test("D-13 report scripts do not claim closure", () => {
  assert.match(REPORT_SOURCE, /closureClaimed:\s*false/);
  assert.match(CHECKLIST_SOURCE, /does not close D-13/i);
  assert.match(CHECKLIST_SOURCE, /needsHumanReview:\s*true/);
});

console.log("\n5 passed");
