import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getOperationsManualPricingDraftDescription,
  getOperationsManualPricingDraftTitle,
  getOperationsManualPricingSaveButtonLabel,
  getOperationsManualPricingSaveNotImplementedMessage,
} from "../src/shared/operations/reviewTypes";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

test("manual pricing draft section renders on operations manual review screen", () => {
  const reviewView = readFileSync("src/operations/OperationsManualReviewView.tsx", "utf8");
  const draftSection = readFileSync("src/operations/OperationsManualPricingDraftSection.tsx", "utf8");

  assert.match(reviewView, /OperationsManualPricingDraftSection/);
  assert.match(draftSection, /getOperationsManualPricingDraftTitle/);
  assert.match(draftSection, /review\.totalPriceLabel/);
  assert.match(draftSection, /review\.pricingLabel/);
  assert.match(draftSection, /review\.pricingSource/);
  assert.match(draftSection, /review\.pricingSnapshotSummary/);
  assert.match(draftSection, /review\.priceBreakdownSummary/);
});

test("manual pricing draft shows current safe pricing summary only", () => {
  const draftSection = readFileSync("src/operations/OperationsManualPricingDraftSection.tsx", "utf8");

  assert.match(draftSection, /review\.productSummary/);
  assert.match(draftSection, /review\.deliverySummary/);
  assert.match(draftSection, /review\.assemblySummary/);
  assert.doesNotMatch(draftSection, /price_breakdown|production_export|customer_name/i);
  assert.doesNotMatch(draftSection, /createClient|supabase/i);
});

test("manual pricing save action is disabled and not implemented", () => {
  const draftSection = readFileSync("src/operations/OperationsManualPricingDraftSection.tsx", "utf8");

  assert.match(draftSection, /getOperationsManualPricingSaveButtonLabel/);
  assert.match(draftSection, /getOperationsManualPricingSaveNotImplementedMessage/);
  assert.match(draftSection, /disabled/);
  assert.match(draftSection, /aria-disabled="true"/);
  assert.doesNotMatch(draftSection, /fetch\(|PATCH|POST|updateOrderStatus|saveManualPrice/i);
});

test("manual pricing draft input is local-only state", () => {
  const draftSection = readFileSync("src/operations/OperationsManualPricingDraftSection.tsx", "utf8");

  assert.match(draftSection, /useState/);
  assert.match(draftSection, /setDraftPrice/);
  assert.match(draftSection, /Локальный черновик/);
  assert.match(draftSection, /не сохранено/);
});

test("operations review API has no pricing write endpoint", () => {
  const reviewApi = readFileSync("src/shared/operations/operationsReviewApi.ts", "utf8");
  const operationsApi = readFileSync("src/shared/operations/operationsApi.ts", "utf8");

  assert.match(reviewApi, /method: "GET"/);
  assert.doesNotMatch(reviewApi, /POST|PATCH|PUT|DELETE/i);
  assert.doesNotMatch(operationsApi, /manual.*price|pricing.*write/i);
});

test("manual pricing draft labels and messages exist", () => {
  assert.equal(getOperationsManualPricingDraftTitle(), "Manual pricing draft");
  assert.match(getOperationsManualPricingDraftDescription(), /не сохраняется/);
  assert.equal(getOperationsManualPricingSaveButtonLabel(), "Сохранить ручную цену");
  assert.match(getOperationsManualPricingSaveNotImplementedMessage(), /не реализовано/);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
