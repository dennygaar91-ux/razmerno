import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type TestFn = () => void;

const tests: Array<{ name: string; run: TestFn }> = [];

function test(name: string, run: TestFn) {
  tests.push({ name, run });
}

const PACKAGE_JSON = readFileSync("package.json", "utf8");
const PRODUCTION_EXPORT_TEST = readFileSync("tests/production-export.test.ts", "utf8");
const RELEASE_GATE = readFileSync("scripts/check-release-candidate-local.mjs", "utf8");

export const PRODUCTION_FINAL_BRANCH_COMMANDS = [
  "npm run test:production-snapshots",
  "npm run test:production-export-contract",
  "npm run test:production-hdf-thickness-contract",
  "npm run test:production-edge-banding-contract",
  "npm run test:production-drilling-coordinate-contract",
  "npm run test:production-hardware-catalog-contract",
  "npm run test:production-basis-boundary-contract",
  "npm run test:production-export-failure-contract",
] as const;

const V3_GOLDEN_CASE_PATTERNS = [
  /manufacturing specification: baseline wardrobe/i,
  /manufacturing specification: handleless wardrobe/i,
  /manufacturing specification: mixed drawers shelves rod/i,
  /manufacturing specification: material-aware body and facade materials/i,
  /manufacturing specification: compact single-section wardrobe/i,
  /manufacturing specification: triple-section wide wardrobe/i,
  /manufacturing document: baseline wardrobe markdown/i,
  /manufacturing document: handleless wardrobe/i,
  /manufacturing document: mixed blocked case/i,
  /manufacturing document: material-aware case/i,
] as const;

test("P1-11A/B production final branch verification composes required scripts", () => {
  assert.match(PACKAGE_JSON, /"test:production-final-branch-verification"/);
  for (const command of PRODUCTION_FINAL_BRANCH_COMMANDS) {
    const script = command.replace("npm run ", "");
    assert.match(PACKAGE_JSON, new RegExp(`"${script.replace(/:/g, "\\:")}"`));
  }
});

test("P1-11B active production path is v3, not legacy v2", () => {
  assert.match(PRODUCTION_EXPORT_TEST, /razmerno\.production-model\.v3/);
  assert.doesNotMatch(PRODUCTION_EXPORT_TEST, /razmerno\.production-model\.v2/);
});

test("P1-11B at least six v3 golden manufacturing cases exist", () => {
  let matched = 0;
  for (const pattern of V3_GOLDEN_CASE_PATTERNS) {
    if (pattern.test(PRODUCTION_EXPORT_TEST)) matched += 1;
  }
  assert.ok(matched >= 6, `expected >=6 v3 golden cases, got ${matched}`);
});

test("P1-11B active runtime export path is v3 and v4 replacement remains deferred", () => {
  const activeRuntimeSource = readFileSync("src/constructor/geometry/buildCabinetGeometry.ts", "utf8");
  const rpesRecon = readFileSync("docs/planning/rpes-local-formal-reconciliation.md", "utf8");

  assert.match(activeRuntimeSource, /razmerno\.production-model\.v3/);
  assert.match(rpesRecon, /branch runs v3 export/i);
  assert.match(rpesRecon, /Production v4[\s\S]{0,300}v3|v4 replaces v3/i);
  assert.doesNotMatch(PRODUCTION_EXPORT_TEST, /razmerno\.production-model\.v2/);
});

test("P1-11B snapshots cover panels edgeBanding hardware drilling warnings validation Basis", () => {
  assert.match(PRODUCTION_EXPORT_TEST, /cutList/);
  assert.match(PRODUCTION_EXPORT_TEST, /edgeBanding/);
  assert.match(PRODUCTION_EXPORT_TEST, /hardware/);
  assert.match(PRODUCTION_EXPORT_TEST, /drillingAndOperations/);
  assert.match(PRODUCTION_EXPORT_TEST, /validation/);
  assert.match(PRODUCTION_EXPORT_TEST, /basisChecklist|basisActions/i);
});

test("P1-11B HDF edge hardware Basis and failure contracts are wired", () => {
  assert.match(PACKAGE_JSON, /test:production-hdf-thickness-contract/);
  assert.match(PACKAGE_JSON, /test:production-edge-banding-contract/);
  assert.match(PACKAGE_JSON, /test:production-hardware-catalog-contract/);
  assert.match(PACKAGE_JSON, /test:production-basis-boundary-contract/);
  assert.match(PACKAGE_JSON, /test:production-export-failure-contract/);
});

test("P1-11B release gate includes production verification scripts", () => {
  assert.match(RELEASE_GATE, /test:production-export-contract/);
  assert.match(RELEASE_GATE, /test:production-final-branch-verification/);
});

function runTests() {
  for (const item of tests) {
    item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

runTests();
