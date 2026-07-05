import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getOperationsManualPricingDraftDescription,
  getOperationsManualPricingDraftTitle,
  getOperationsManualPricingSaveButtonLabel,
  getOperationsManualPricingSavedMessage,
} from "../src/shared/operations/reviewTypes";
import {
  isManualDraftPriceInputValid,
  parseManualDraftPriceInput,
} from "../src/shared/operations/operationsManualPricingDraftApi";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

test("manual pricing draft section renders on operations manual review screen", () => {
  const reviewView = readFileSync("src/operations/OperationsManualReviewView.tsx", "utf8");
  const draftSection = readFileSync("src/operations/OperationsManualPricingDraftSection.tsx", "utf8");

  assert.match(reviewView, /OperationsManualPricingDraftSection/);
  assert.match(reviewView, /accessToken/);
  assert.match(reviewView, /onDraftSaved/);
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
  assert.match(draftSection, /review\.manualPricingDraft/);
  assert.doesNotMatch(draftSection, /price_breakdown|production_export|customer_name/i);
  assert.doesNotMatch(draftSection, /createClient|supabase/i);
});

test("manual pricing save button is enabled only for valid draft value", () => {
  const draftSection = readFileSync("src/operations/OperationsManualPricingDraftSection.tsx", "utf8");

  assert.match(draftSection, /getOperationsManualPricingSaveButtonLabel/);
  assert.match(draftSection, /isManualDraftPriceInputValid/);
  assert.match(draftSection, /disabled=\{!canSave\}/);
  assert.match(draftSection, /saveOperationsManualPricingDraft/);
  assert.doesNotMatch(draftSection, /getOperationsManualPricingSaveNotImplementedMessage/);
  assert.doesNotMatch(draftSection, /aria-disabled="true"/);
});

test("manual pricing draft save calls API only and shows success/error states", () => {
  const draftSection = readFileSync("src/operations/OperationsManualPricingDraftSection.tsx", "utf8");
  const draftApi = readFileSync("src/shared/operations/operationsManualPricingDraftApi.ts", "utf8");

  assert.match(draftSection, /handleSave/);
  assert.match(draftSection, /saveState/);
  assert.match(draftSection, /getOperationsManualPricingSavedMessage/);
  assert.match(draftSection, /getOperationsManualPricingSaveErrorMessage/);
  assert.match(draftApi, /\/api\/operations\/manual-pricing-draft/);
  assert.match(draftApi, /Authorization/);
  assert.doesNotMatch(draftApi, /createClient|supabase/i);
});

test("manual pricing draft client validation accepts positive integer prices only", () => {
  assert.equal(parseManualDraftPriceInput("123000"), 123000);
  assert.equal(parseManualDraftPriceInput("123 000"), 123000);
  assert.equal(isManualDraftPriceInputValid("1"), true);
  assert.equal(isManualDraftPriceInputValid(""), false);
  assert.equal(isManualDraftPriceInputValid("0"), false);
  assert.equal(isManualDraftPriceInputValid("abc"), false);
  assert.equal(isManualDraftPriceInputValid("123.5"), false);
});

test("operations review API remains read-only while manual pricing draft has dedicated write API", () => {
  const reviewApi = readFileSync("src/shared/operations/operationsReviewApi.ts", "utf8");
  const draftApi = readFileSync("src/shared/operations/operationsManualPricingDraftApi.ts", "utf8");

  assert.match(reviewApi, /method: "GET"/);
  assert.doesNotMatch(reviewApi, /POST|PATCH|PUT|DELETE/i);
  assert.match(draftApi, /method: "POST"/);
});

test("manual pricing draft labels and messages exist", () => {
  assert.equal(getOperationsManualPricingDraftTitle(), "Manual pricing draft");
  assert.match(getOperationsManualPricingDraftDescription(), /не финальная customer-facing цена/);
  assert.equal(getOperationsManualPricingSaveButtonLabel(), "Сохранить ручную цену");
  assert.match(getOperationsManualPricingSavedMessage(), /operations draft/);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
