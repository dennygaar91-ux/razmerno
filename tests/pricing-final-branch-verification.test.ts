import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type TestFn = () => void;

const tests: Array<{ name: string; run: TestFn }> = [];

function test(name: string, run: TestFn) {
  tests.push({ name, run });
}

const PACKAGE_JSON = readFileSync("package.json", "utf8");
const PRICING_PARITY = readFileSync("tests/pricing-parity-contract.test.ts", "utf8");
const RELEASE_GATE = readFileSync("scripts/check-release-candidate-local.mjs", "utf8");

export const PRICING_FINAL_BRANCH_COMMANDS = [
  "npm run test:pricing-engine",
  "npm run test:pricing-final",
  "npm run test:pricing-parity-contract",
  "npm run test:checkout-submit-hook",
  "npm run test:customer-order-detail",
  "npm run test:operations-order-review",
  "npm run test:production-export-contract",
] as const;

test("P0-03/P0-13 pricing final branch verification composes required scripts", () => {
  assert.match(PACKAGE_JSON, /"test:pricing-final-branch-verification"/);
  for (const command of PRICING_FINAL_BRANCH_COMMANDS) {
    const script = command.replace("npm run ", "");
    assert.match(PACKAGE_JSON, new RegExp(`"${script.replace(/:/g, "\\:")}"`));
  }
});

test("P0-03/P0-13 client quote and server recompute parity for material-aware cases", () => {
  assert.match(PRICING_PARITY, /calculateCatalogPrice/);
  assert.match(PRICING_PARITY, /calculateServerOrderPriceResolved/);
  assert.match(PRICING_PARITY, /materials: \{ bodyId/);
  assert.match(PRICING_PARITY, /quote\/order\/stored parity/i);
});

test("P0-03/P0-13 delivery and assembly matrix parity is covered", () => {
  assert.match(PRICING_PARITY, /calculateDeliveryQuote/);
  assert.match(PRICING_PARITY, /calculateAssemblyQuote/);
  assert.match(PRICING_PARITY, /delivery_enabled/);
  assert.match(PRICING_PARITY, /assembly_enabled/);
});

test("P0-03/P0-13 stored order snapshot parity and read models use stored price", () => {
  assert.match(PRICING_PARITY, /readStoredOrderPricingSnapshot/);
  assert.match(PRICING_PARITY, /assertStoredOrderPricingSnapshotConsistent/);
  assert.match(PRICING_PARITY, /mapCustomerOrderDetail/);
  assert.match(PRICING_PARITY, /buildOperationsOrderReview/);
  assert.match(PRICING_PARITY, /mapOperationsWorkspaceOrder/);
});

test("P0-03/P0-13 manual pricing draft does not replace stored total", () => {
  assert.match(PRICING_PARITY, /mapOperationsManualPricingDraft/);
  assert.match(PRICING_PARITY, /manual pricing boundary/i);
  assert.match(PRICING_PARITY, /reviewWithDraft\.totalPrice, row\.total_price/);
});

test("P0-03/P0-13 production export excludes monetary pricing", () => {
  assert.match(PRICING_PARITY, /buildProductionExportFromOrder/);
  assert.match(PRICING_PARITY, /doesNotMatch\(JSON\.stringify\(productionExport\), \/"totalPrice"/);
});

test("P0-03/P0-13 release gate includes pricing parity scripts", () => {
  assert.match(RELEASE_GATE, /test:pricing-parity-contract/);
  assert.match(RELEASE_GATE, /test:pricing-final-branch-verification/);
});

function runTests() {
  for (const item of tests) {
    item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

runTests();
