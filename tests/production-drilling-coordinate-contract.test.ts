import assert from "node:assert/strict";

import { DRILL_SPEC, drilling } from "../src/constructor/geometry/drilling";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage";
import { makeValidOrder } from "./fixtures/order-contract-fixture";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

test("P2-07 drilling helper emits panel-local numeric coordinates with technologist check by default", () => {
  const operation = drilling({
    panelId: "panel-side-left",
    purpose: "confirmat",
    xMm: 8,
    yMm: 100,
    zMm: 300,
    diameterMm: DRILL_SPEC.confirmat.diameterMm,
    depthMm: DRILL_SPEC.confirmat.depthMm,
    side: "right",
  });

  assert.equal(operation.panelId, "panel-side-left");
  assert.equal(operation.xMm, 8);
  assert.equal(operation.yMm, 100);
  assert.equal(operation.zMm, 300);
  assert.equal(operation.diameterMm, 7);
  assert.equal(operation.depthMm, 50);
  assert.equal(operation.requiresTechnologistCheck, true);
});

test("P2-07 production export drilling operations expose deterministic coordinate fields", () => {
  const exportPack = buildProductionExportFromPayload(
    makeValidOrder({
      consent: {
        personalData: true,
        privacyVersion: "2026-05-24",
        acceptedAt: "2026-06-23T18:00:00.000Z",
      },
    }),
  );

  assert.ok(exportPack.productionModel.drilling.length > 0);
  for (const operation of exportPack.productionModel.drilling) {
    assert.ok(operation.panelId, "drilling must reference panelId");
    assert.ok(Number.isFinite(operation.xMm), "drilling xMm must be numeric");
    assert.ok(Number.isFinite(operation.yMm), "drilling yMm must be numeric");
    assert.ok(Number.isFinite(operation.zMm), "drilling zMm must be numeric");
    assert.ok(operation.diameterMm > 0, "drilling diameter must be positive");
    assert.ok(operation.depthMm > 0, "drilling depth must be positive");
    assert.ok(operation.side, "drilling must declare face side");
    assert.equal(typeof operation.requiresTechnologistCheck, "boolean");
  }
});

test("P2-07 drilling purposes in export use known MVP spec families", () => {
  const exportPack = buildProductionExportFromPayload(makeValidOrder());
  const purposes = new Set(exportPack.productionModel.drilling.map((item) => item.purpose));
  assert.ok(purposes.has("confirmat"));
  assert.ok(purposes.has("hinge-cup") || purposes.has("shelf-support") || purposes.has("drawer-slide"));
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
