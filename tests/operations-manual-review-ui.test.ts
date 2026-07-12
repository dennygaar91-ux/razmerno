import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { mapOperationsReviewToAdminDetailSummary } from "../src/shared/operations/mapOperationsReviewToAdminDetailSummary";
import {
  getOperationsApproveButtonLabel,
  getOperationsDecisionApprovedMessage,
  getOperationsDecisionIneligibleMessage,
  getOperationsManualReviewTitle,
  getOperationsRejectButtonLabel,
} from "../src/shared/operations/reviewTypes";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const sampleReview = {
  orderId: "RZ-20260705-1001",
  status: "new",
  domainStatus: "Проверка",
  reviewDecisionAllowed: true,
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
  approvalActionsImplemented: true,
  manualPricingDraft: null,
  latestDecisionAudit: null,
  decisionHistory: [],
  changeRequests: [],
  paymentState: "not_applicable" as const,
  paymentConfirmationAllowed: false,
  orderCompletionAllowed: false,
};

test("operations change requests section renders on manual review screen", () => {
  const view = readFileSync("src/operations/OperationsManualReviewView.tsx", "utf8");
  const section = readFileSync("src/operations/OperationsChangeRequestsSection.tsx", "utf8");
  assert.match(view, /OperationsChangeRequestsSection/);
  assert.match(section, /getOperationsChangeRequestsSectionTitle/);
  assert.match(section, /getOperationsChangeRequestsEmptyMessage/);
  assert.match(section, /data-testid="operations-change-requests-empty"/);
  assert.doesNotMatch(section, /createClient|supabase/i);
});

test("operations change request decision actions are wired through API section", () => {
  const section = readFileSync("src/operations/OperationsChangeRequestsSection.tsx", "utf8");
  assert.match(section, /submitOperationsChangeRequestDecision/);
  assert.match(section, /data-testid="operations-change-request-actions"/);
  assert.match(section, /getOperationsChangeRequestResolvedButtonLabel/);
  assert.doesNotMatch(section, /createClient|supabase/i);
});

test("operations change request decision API client uses operations endpoint", () => {
  const api = readFileSync("src/shared/operations/operationsChangeRequestDecisionApi.ts", "utf8");
  assert.match(api, /\/api\/operations\/change-request-decision/);
  assert.match(api, /Authorization/);
});

test("operations manual review view exists and uses approval summary", () => {
  const view = readFileSync("src/operations/OperationsManualReviewView.tsx", "utf8");
  assert.match(view, /OperationsManualReviewView/);
  assert.match(view, /Approval summary/);
  assert.match(view, /AdminOrderDetailPage/);
  assert.match(view, /OperationsOrderDecisionSection/);
});

test("manual review approve and reject actions are wired through API section", () => {
  const section = readFileSync("src/operations/OperationsOrderDecisionSection.tsx", "utf8");
  assert.match(section, /getOperationsApproveButtonLabel/);
  assert.match(section, /getOperationsRejectButtonLabel/);
  assert.match(section, /submitOperationsOrderDecision/);
  assert.match(section, /data-status="success"/);
  assert.match(section, /data-status="error"/);
  assert.doesNotMatch(section, /latestDecisionAudit/);
  assert.doesNotMatch(section, /createClient|supabase/i);
});

test("operations decision history section renders on manual review screen", () => {
  const view = readFileSync("src/operations/OperationsManualReviewView.tsx", "utf8");
  const history = readFileSync("src/operations/OperationsOrderDecisionHistorySection.tsx", "utf8");
  assert.match(view, /OperationsOrderDecisionHistorySection/);
  assert.match(history, /getOperationsDecisionHistoryTitle/);
  assert.match(history, /getOperationsDecisionHistoryEmptyMessage/);
  assert.match(history, /entry\.reason/);
  assert.doesNotMatch(history, /createClient|supabase/i);
});

test("operations workspace routes queue to manual review view", () => {
  const page = readFileSync("src/operations/OperationsWorkspacePage.tsx", "utf8");
  assert.match(page, /OperationsManualReviewView/);
  assert.match(page, /useOperationsOrderReview/);
  assert.match(page, /onDecisionApplied/);
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

test("operations order decision API client uses operations order-decision endpoint", () => {
  const api = readFileSync("src/shared/operations/operationsOrderDecisionApi.ts", "utf8");
  assert.match(api, /\/api\/operations\/order-decision/);
  assert.match(api, /Authorization/);
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

test("manual review decision labels exist", () => {
  assert.equal(getOperationsManualReviewTitle(), "Manual Review");
  assert.equal(getOperationsApproveButtonLabel(), "Одобрить");
  assert.equal(getOperationsRejectButtonLabel(), "Отклонить");
  assert.match(getOperationsDecisionApprovedMessage(), /одобрен/i);
});

test("decision controls stay active when order is in review state", () => {
  const section = readFileSync("src/operations/OperationsOrderDecisionSection.tsx", "utf8");
  assert.match(section, /review\.reviewDecisionAllowed/);
  assert.match(section, /data-testid="operations-decision-actions"/);
  assert.match(section, /getOperationsApproveButtonLabel/);
  assert.match(section, /submitOperationsOrderDecision/);
});

test("decision controls become read-only when order is no longer in review state", () => {
  const section = readFileSync("src/operations/OperationsOrderDecisionSection.tsx", "utf8");
  const readonlyBlock = section.slice(
    section.indexOf("if (!review.reviewDecisionAllowed)"),
    section.indexOf("const canAct = actionState"),
  );
  assert.match(section, /data-testid="operations-decision-readonly"/);
  assert.match(readonlyBlock, /getOperationsDecisionIneligibleMessage/);
  assert.doesNotMatch(readonlyBlock, /getOperationsApproveButtonLabel/);
  assert.doesNotMatch(readonlyBlock, /submitOperationsOrderDecision/);
  assert.equal(getOperationsDecisionIneligibleMessage("Оплата"), "Решение уже принято");
  assert.equal(getOperationsDecisionIneligibleMessage("Отмена"), "Решение уже принято");
  assert.equal(getOperationsDecisionIneligibleMessage("Черновик"), "Действия недоступны для текущего статуса");
});

test("decision history remains visible regardless of decision eligibility", () => {
  const view = readFileSync("src/operations/OperationsManualReviewView.tsx", "utf8");
  assert.match(view, /OperationsOrderDecisionHistorySection/);
  const historyIndex = view.indexOf("OperationsOrderDecisionHistorySection");
  const decisionIndex = view.indexOf("OperationsOrderDecisionSection");
  assert.ok(historyIndex > -1 && decisionIndex > -1);
  assert.ok(historyIndex > decisionIndex, "history section should render after decision section");
});

test("operations payment confirmation section renders on manual review screen", () => {
  const view = readFileSync("src/operations/OperationsManualReviewView.tsx", "utf8");
  const section = readFileSync("src/operations/OperationsPaymentConfirmationSection.tsx", "utf8");
  assert.match(view, /OperationsPaymentConfirmationSection/);
  assert.match(section, /getOperationsPaymentConfirmationTitle/);
  assert.match(section, /submitOperationsPaymentConfirmation/);
  assert.match(section, /data-testid="operations-payment-confirmation"/);
  assert.match(section, /review\.paymentConfirmationAllowed/);
  assert.doesNotMatch(section, /createClient|supabase/i);
});

test("payment confirmation section is read-only outside Оплата", () => {
  const section = readFileSync("src/operations/OperationsPaymentConfirmationSection.tsx", "utf8");
  assert.match(section, /data-testid="operations-payment-confirmation-readonly"/);
  assert.match(section, /getOperationsPaymentConfirmationIneligibleMessage/);
});

test("operations payment confirmation API client uses operations endpoint", () => {
  const api = readFileSync("src/shared/operations/operationsPaymentConfirmationApi.ts", "utf8");
  assert.match(api, /\/api\/operations\/payment-confirmation/);
  assert.match(api, /Authorization/);
  assert.doesNotMatch(api, /createClient|supabase/i);
});

test("operations order completion section renders on manual review screen", () => {
  const view = readFileSync("src/operations/OperationsManualReviewView.tsx", "utf8");
  const section = readFileSync("src/operations/OperationsOrderCompletionSection.tsx", "utf8");
  assert.match(view, /OperationsOrderCompletionSection/);
  assert.match(section, /getOperationsOrderCompletionTitle/);
  assert.match(section, /submitOperationsOrderCompletion/);
  assert.match(section, /data-testid="operations-order-completion"/);
  assert.match(section, /review\.orderCompletionAllowed/);
  assert.doesNotMatch(section, /createClient|supabase/i);
});

test("order completion section is read-only outside В работе", () => {
  const section = readFileSync("src/operations/OperationsOrderCompletionSection.tsx", "utf8");
  assert.match(section, /data-testid="operations-order-completion-readonly"/);
  assert.match(section, /getOperationsOrderCompletionIneligibleMessage/);
});

test("operations order completion API client uses operations endpoint", () => {
  const api = readFileSync("src/shared/operations/operationsOrderCompletionApi.ts", "utf8");
  assert.match(api, /\/api\/operations\/order-completion/);
  assert.match(api, /Authorization/);
  assert.doesNotMatch(api, /createClient|supabase/i);
});

test("backend decision conflict protection remains in API tests", () => {
  const apiTest = readFileSync("tests/operations-order-decision.test.ts", "utf8");
  assert.match(apiTest, /409 when order is not in review state/);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
