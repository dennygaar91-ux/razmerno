import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { mapOperationsReviewToAdminDetailSummary } from "../src/shared/operations/mapOperationsReviewToAdminDetailSummary";
import {
  getOperationsApprovalActionsNotImplementedMessage,
  getOperationsManualReviewTitle,
} from "../src/shared/operations/reviewTypes";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const sampleReview = {
  orderId: "RZ-20260705-1001",
  status: "new",
  createdAt: "2026-07-05T10:00:00.000Z",
  updatedAt: "2026-07-05T11:30:00.000Z",
  customerNameMasked: "И•••",
  phoneMasked: "+7 *** ***-67",
  emailMasked: "i***@example.com",
  productSummary: "Шкаф 1800×2400×600",
  productType: "Шкаф",
  dimensionsSummary: "1800×2400×600 мм",
  materialsSummary: "not available in current admin payload",
  totalPrice: 86400,
  totalPriceLabel: "86 400 ₽",
  pricingLabel: "final server snapshot",
  pricingSource: "supabase",
  pricingSnapshotSummary: "persisted total/delivery/assembly from stored order snapshot",
  priceBreakdownSummary: "stored breakdown keys: body, facades",
  deliverySummary: "1 500 ₽ · адрес скрыт",
  assemblySummary: "7 980 ₽",
  assemblyBasePriceSummary: "79 800 ₽",
  managerEmailStatus: "sent",
  customerEmailStatus: "pending",
  productionReviewStatus: "requires-review",
  basisStatus: "manual review required",
  validationErrorsCount: 1,
  validationWarningsCount: 2,
  approvalActionsImplemented: false as const,
};

test("operations manual review view exists and uses approval summary", () => {
  const view = readFileSync("src/operations/OperationsManualReviewView.tsx", "utf8");
  assert.match(view, /OperationsManualReviewView/);
  assert.match(view, /Approval summary/);
  assert.match(view, /AdminOrderDetailPage/);
  assert.match(view, /getOperationsApprovalActionsNotImplementedMessage/);
});

test("manual review actions are disabled placeholders only", () => {
  const view = readFileSync("src/operations/OperationsManualReviewView.tsx", "utf8");
  assert.match(view, /Одобрить/);
  assert.match(view, /Отклонить/);
  assert.match(view, /Ручная корректировка цены/);
  assert.match(view, /disabled/);
  assert.match(view, /aria-disabled="true"/);
  assert.doesNotMatch(view, /updateOrderStatus|PATCH|approveChangeRequest/i);
});

test("operations workspace routes queue to manual review view", () => {
  const page = readFileSync("src/operations/OperationsWorkspacePage.tsx", "utf8");
  assert.match(page, /OperationsManualReviewView/);
  assert.match(page, /useOperationsOrderReview/);
  assert.match(page, /Review/);
  assert.doesNotMatch(page, /fetchAdminOrders|loadProductionDetail|summarizeOrderForAdmin/);
});

test("operations review API client sends Bearer token and uses operations order endpoint", () => {
  const api = readFileSync("src/shared/operations/operationsReviewApi.ts", "utf8");
  assert.match(api, /Authorization/);
  assert.match(api, /Bearer \$\{accessToken\}/);
  assert.match(api, /\/api\/operations\/order/);
  assert.doesNotMatch(api, /createClient|supabase/i);
});

test("operations review hook loads data through API only", () => {
  const hook = readFileSync("src/shared/operations/useOperationsOrderReview.ts", "utf8");
  assert.match(hook, /fetchOperationsOrderReview/);
  assert.doesNotMatch(hook, /createClient|supabase/i);
});

test("operations review maps to admin detail summary without raw pii fields", () => {
  const summary = mapOperationsReviewToAdminDetailSummary(sampleReview);
  assert.equal(summary.orderId, sampleReview.orderId);
  assert.equal(summary.customerNameMasked, sampleReview.customerNameMasked);
  assert.equal(summary.totalPrice, sampleReview.totalPriceLabel);
  const serialized = JSON.stringify(summary);
  assert.equal(serialized.includes("ivan.petrov@example.com"), false);
  assert.equal(serialized.includes("production_export"), false);
  assert.equal(serialized.includes("price_breakdown"), false);
});

test("manual review labels and not-implemented message exist", () => {
  assert.equal(getOperationsManualReviewTitle(), "Manual Review");
  assert.match(getOperationsApprovalActionsNotImplementedMessage(), /не реализованы/);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
