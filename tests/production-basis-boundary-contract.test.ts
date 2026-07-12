import assert from "node:assert/strict";

import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage";
import { makeValidOrder } from "./fixtures/order-contract-fixture";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const FORBIDDEN_BASIS_AUTO_B3D_CLAIMS = [
  "document:create-b3d",
  '"documentType":"b3d"',
  "create-b3d",
  "автоматической генерации .b3d",
  "автоматической генерации",
] as const;

test("Basis boundary: production export status is manual-json-ready only", () => {
  const exportPack = buildProductionExportFromPayload(makeValidOrder());
  assert.equal(exportPack.basis.status, "manual-json-ready");
  assert.ok(exportPack.basis.plan.length > 0);
});

test("Basis boundary: export JSON does not claim automatic B3D generation", () => {
  const serialized = JSON.stringify(buildProductionExportFromPayload(makeValidOrder()));
  assert.doesNotMatch(serialized, /create-b3d|"documentType":"b3d"/);
  for (const forbidden of FORBIDDEN_BASIS_AUTO_B3D_CLAIMS) {
    if (forbidden === "create-b3d" || forbidden === '"documentType":"b3d"') continue;
    assert.ok(!serialized.includes(forbidden), `forbidden basis claim: ${forbidden}`);
  }
});

test("Basis boundary: basis plan steps remain manual export actions only", () => {
  const exportPack = buildProductionExportFromPayload(makeValidOrder());
  for (const step of exportPack.basis.plan) {
    assert.notEqual(step.action, "create-b3d");
    assert.doesNotMatch(JSON.stringify(step.payload ?? {}), /"documentType":"b3d"/);
  }
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
