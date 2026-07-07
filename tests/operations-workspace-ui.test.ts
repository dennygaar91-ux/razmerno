import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildOperationsOrderDetailPath,
  isOperationsRoute,
  parseOperationsRouteOrderId,
} from "../src/shared/operations/orderDetailRoutes";
import {
  getOperationsOrderStatusLabel,
  getOperationsWorkspaceEmptyMessage,
  getOperationsWorkspaceErrorMessage,
} from "../src/shared/operations/types";
import {
  OPERATIONS_DOMAIN_STATUS_FILTER_OPTIONS,
  countOperationsWorkspaceByDomainStatus,
  filterOperationsWorkspaceByDomainStatus,
  formatOperationsDomainStatusFilterLabel,
  getOperationsDomainStatusLabel,
  getOperationsWorkspaceFilteredEmptyMessage,
} from "../src/shared/operations/workspaceFilters";
import type { OperationsWorkspaceOrder } from "../src/shared/operations/types";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

test("operations workspace page route is registered in App", () => {
  const app = readFileSync("src/App.tsx", "utf8");
  assert.match(app, /OperationsWorkspacePage/);
  assert.match(app, /isOperations/);
  assert.match(app, /\/operations/);
});

test("operations queue section renders safe fields only", () => {
  const page = readFileSync("src/operations/OperationsWorkspacePage.tsx", "utf8");
  assert.match(page, /Очередь заявок/);
  assert.match(page, /customerNameMasked/);
  assert.match(page, /productSummary/);
  assert.match(page, /productionStatus/);
  assert.match(page, /formatOperationsDate\(order\.createdAt\)/);
  assert.match(page, /formatOperationsDate\(order\.updatedAt\)/);
  assert.match(page, /buildOperationsOrderDetailPath/);
  assert.doesNotMatch(page, /createClient|supabase|@supabase\/supabase-js/i);
  assert.doesNotMatch(page, /customer_name|customer_phone|customer_email|production_export|price_breakdown/i);
});

test("operations order detail reuses manual review view and review API", () => {
  const page = readFileSync("src/operations/OperationsWorkspacePage.tsx", "utf8");
  assert.match(page, /OperationsManualReviewView/);
  assert.match(page, /useOperationsOrderReview/);
  assert.doesNotMatch(page, /fetchAdminOrders/);
});

test("operations API client sends Bearer token to operations workspace endpoint", () => {
  const api = readFileSync("src/shared/operations/operationsApi.ts", "utf8");
  assert.match(api, /Authorization/);
  assert.match(api, /Bearer \$\{accessToken\}/);
  assert.match(api, /\/api\/operations\/workspace/);
  assert.doesNotMatch(api, /createClient|supabase/i);
});

test("operations hook loads workspace through API only", () => {
  const hook = readFileSync("src/shared/operations/useOperationsWorkspace.ts", "utf8");
  assert.match(hook, /fetchOperationsWorkspace/);
  assert.doesNotMatch(hook, /createClient|supabase/i);
});

test("operations order detail route helpers validate order id format", () => {
  assert.equal(parseOperationsRouteOrderId("/operations/orders/RZ-20260705-1001"), "RZ-20260705-1001");
  assert.equal(parseOperationsRouteOrderId("/operations/orders/invalid"), null);
  assert.equal(buildOperationsOrderDetailPath("RZ-20260705-1001"), "/operations/orders/RZ-20260705-1001");
  assert.equal(isOperationsRoute("/operations"), true);
  assert.equal(isOperationsRoute("/operations/orders/RZ-20260705-1001"), true);
  assert.equal(isOperationsRoute("/admin"), false);
});

test("operations queue labels and empty/error messages exist", () => {
  const page = readFileSync("src/operations/OperationsWorkspacePage.tsx", "utf8");
  assert.equal(getOperationsOrderStatusLabel("new"), "Новая");
  assert.equal(getOperationsOrderStatusLabel("in_progress"), "В работе");
  assert.equal(getOperationsWorkspaceEmptyMessage(), "Очередь заявок пока пуста.");
  assert.equal(getOperationsWorkspaceErrorMessage(), "Не удалось загрузить очередь заявок.");
  assert.match(page, /getOperationsWorkspaceEmptyMessage/);
  assert.match(page, /getOperationsWorkspaceFilteredEmptyMessage/);
});

const sampleOrders: OperationsWorkspaceOrder[] = [
  {
    orderId: "RZ-1",
    status: "new",
    domainStatus: "Проверка",
    createdAt: null,
    updatedAt: null,
    customerNameMasked: "A•••",
    productSummary: "Шкаф",
    totalPrice: 1000,
    productionStatus: "requires-review",
  },
  {
    orderId: "RZ-2",
    status: "in_progress",
    domainStatus: "Оплата",
    createdAt: null,
    updatedAt: null,
    customerNameMasked: "B•••",
    productSummary: "Шкаф",
    totalPrice: 2000,
    productionStatus: "approved",
  },
  {
    orderId: "RZ-3",
    status: "cancelled",
    domainStatus: "Отмена",
    createdAt: null,
    updatedAt: null,
    customerNameMasked: "C•••",
    productSummary: "Шкаф",
    totalPrice: 3000,
    productionStatus: "rejected",
  },
];

test("operations workspace domain status filters render and filter queue rows", () => {
  const page = readFileSync("src/operations/OperationsWorkspacePage.tsx", "utf8");
  assert.match(page, /OPERATIONS_DOMAIN_STATUS_FILTER_OPTIONS/);
  assert.match(page, /filterOperationsWorkspaceByDomainStatus/);
  assert.match(page, /OperationsDomainStatusBadge/);
  assert.match(page, /aria-pressed/);

  for (const option of OPERATIONS_DOMAIN_STATUS_FILTER_OPTIONS) {
    assert.match(page, /option\.label/);
    assert.equal(
      OPERATIONS_DOMAIN_STATUS_FILTER_OPTIONS.some((item) => item.label === option.label),
      true,
    );
  }

  assert.equal(filterOperationsWorkspaceByDomainStatus(sampleOrders, "all").length, 3);
  assert.equal(filterOperationsWorkspaceByDomainStatus(sampleOrders, "Проверка").length, 1);
  assert.equal(filterOperationsWorkspaceByDomainStatus(sampleOrders, "Оплата").length, 1);
  assert.equal(filterOperationsWorkspaceByDomainStatus(sampleOrders, "Отмена").length, 1);
  assert.equal(
    filterOperationsWorkspaceByDomainStatus(sampleOrders, "Проверка")[0]?.orderId,
    "RZ-1",
  );
});

test("operations workspace domain status badges and filtered empty state", () => {
  const badge = readFileSync("src/operations/OperationsDomainStatusBadge.tsx", "utf8");
  assert.match(badge, /getOperationsDomainStatusLabel/);
  assert.match(badge, /data-domain-status/);
  assert.equal(getOperationsDomainStatusLabel("Проверка"), "Проверка");
  assert.equal(getOperationsDomainStatusLabel("Оплата"), "Оплата");
  assert.equal(getOperationsDomainStatusLabel("Отмена"), "Отмена");
  assert.equal(getOperationsDomainStatusLabel("В работе"), "В работе");
  assert.equal(getOperationsDomainStatusLabel("Завершено"), "Завершено");
  assert.equal(getOperationsDomainStatusLabel("unknown-status"), "unknown-status");
  assert.equal(
    getOperationsWorkspaceFilteredEmptyMessage("Проверка"),
    "Заявок со статусом «Проверка» пока нет.",
  );
});

test("operations workspace order detail navigation preserved with filters", () => {
  const page = readFileSync("src/operations/OperationsWorkspacePage.tsx", "utf8");
  assert.match(page, /buildOperationsOrderDetailPath\(order\.orderId\)/);
  assert.match(page, /OperationsManualReviewView/);
});

test("operations workspace status counts render from loaded queue rows", () => {
  const page = readFileSync("src/operations/OperationsWorkspacePage.tsx", "utf8");
  assert.match(page, /countOperationsWorkspaceByDomainStatus/);
  assert.match(page, /formatOperationsDomainStatusFilterLabel/);

  const counts = countOperationsWorkspaceByDomainStatus(sampleOrders);
  assert.deepEqual(counts, {
    all: 3,
    Проверка: 1,
    Оплата: 1,
    "В работе": 0,
    Завершено: 0,
    Отмена: 1,
  });
  assert.equal(formatOperationsDomainStatusFilterLabel("Все", counts.all), "Все 3");
  assert.equal(formatOperationsDomainStatusFilterLabel("Проверка", counts.Проверка), "Проверка 1");
  assert.equal(filterOperationsWorkspaceByDomainStatus(sampleOrders, "Оплата").length, counts.Оплата);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
