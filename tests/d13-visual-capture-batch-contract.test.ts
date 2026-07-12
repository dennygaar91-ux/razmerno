import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type TestFn = () => void;

const tests: Array<{ name: string; run: TestFn }> = [];

function test(name: string, run: TestFn) {
  tests.push({ name, run });
}

const D13_SOURCE = readFileSync("scripts/d13-local-visual-qa-capture.mjs", "utf8");

const REQUIRED_BATCHES = {
  "marketing-static": ["landing", "measurements-info", "materials-page", "assembly-page"],
  "constructor-visual": [
    "constructor-3d-sizes",
    "constructor-3d-materials",
    "constructor-webgl-fallback",
    "constructor-checkout",
  ],
  "customer-data": ["customer-workspace"],
  "customer-workspace-only": ["customer-workspace"],
  "operations-data": [
    "operations-workspace",
    "operations-order-review-completed",
    "operations-order-review-queue",
  ],
} as const;

const FAILURE_CLASSES = [
  "runtime-unavailable",
  "api-health-failed",
  "route-unreachable",
  "dynamic-import-failed",
  "network-reset",
  "shot-timeout",
  "selector-timeout",
  "console-error",
] as const;

test("P2-20 D-13 capture exposes marketing-static and constructor-visual batches", () => {
  for (const [batch, shots] of Object.entries(REQUIRED_BATCHES)) {
    assert.match(D13_SOURCE, new RegExp(`'${batch}': \\[`));
    for (const shot of shots) {
      assert.match(D13_SOURCE, new RegExp(`slug: '${shot}'`));
    }
  }
});

test("P2-20 D-13 capture keeps Windows batch-only guard", () => {
  assert.match(D13_SOURCE, /D13_CAPTURE_BATCH or D13_SHOTS/);
  assert.match(D13_SOURCE, /D13_ALLOW_MONOLITHIC/);
  assert.match(D13_SOURCE, /Monolithic all-shots capture is disabled on Windows local dev/);
});

test("P2-20 D-13 capture guards stale D13_SHOTS against unrelated batches", () => {
  assert.match(D13_SOURCE, /Stale D13_SHOTS from another batch/);
  assert.match(D13_SOURCE, /intersected\.length > 0/);
});

test("P2-20 D-13 capture supports vite-preview runtime for static batches", () => {
  assert.match(D13_SOURCE, /D13_CAPTURE_RUNTIME/);
  assert.match(D13_SOURCE, /VITE_PREVIEW_BATCHES/);
  assert.match(D13_SOURCE, /marketing-static/);
  assert.match(D13_SOURCE, /constructor-visual/);
  assert.match(D13_SOURCE, /shotsNeedApiBackend/);
  assert.match(D13_SOURCE, /port === '4173'/);
});

test("P2-20 D-13 capture defines runtime preflight and failure classification", () => {
  for (const failureClass of FAILURE_CLASSES) {
    assert.match(D13_SOURCE, new RegExp(failureClass));
  }
  assert.match(D13_SOURCE, /preflightBaseUrl/);
  assert.match(D13_SOURCE, /preflightApiHealth/);
  assert.match(D13_SOURCE, /preflightRoute/);
  assert.match(D13_SOURCE, /failureClass/);
  assert.match(D13_SOURCE, /isFatalFailureClass/);
  assert.match(D13_SOURCE, /runtimeDead/);
});

test("P2-20 D-13 capture bounds preflight timeout", () => {
  assert.match(D13_SOURCE, /PREFLIGHT_TIMEOUT_MS/);
  assert.match(D13_SOURCE, /D13_PREFLIGHT_TIMEOUT_MS/);
  assert.match(D13_SOURCE, /fetchWithTimeout/);
  assert.match(D13_SOURCE, /preflight timeout/);
});

test("P2-20 D-13 capture defines webgl fallback and checkout wait selectors", () => {
  assert.match(D13_SOURCE, /constructor-webgl-fallback/);
  assert.match(D13_SOURCE, /rzm-3d-blueprint-fallback/);
  assert.match(D13_SOURCE, /constructor-checkout/);
  assert.match(D13_SOURCE, /rzm-3d-checkout/);
  assert.match(D13_SOURCE, /materials-step-panel/);
});

function runTests() {
  for (const item of tests) {
    item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

runTests();
