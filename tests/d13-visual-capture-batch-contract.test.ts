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
    "constructor-webgl-fallback",
    "constructor-checkout",
  ],
  "customer-data": ["customer-workspace"],
  "operations-data": [
    "operations-workspace",
    "operations-order-review-completed",
    "operations-order-review-queue",
  ],
} as const;

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

test("P2-20 D-13 capture defines webgl fallback and checkout wait selectors", () => {
  assert.match(D13_SOURCE, /constructor-webgl-fallback/);
  assert.match(D13_SOURCE, /rzm-3d-blueprint-fallback/);
  assert.match(D13_SOURCE, /constructor-checkout/);
  assert.match(D13_SOURCE, /rzm-3d-checkout/);
});

function runTests() {
  for (const item of tests) {
    item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

runTests();
