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

test("operations order detail reuses existing admin detail page", () => {
  const page = readFileSync("src/operations/OperationsWorkspacePage.tsx", "utf8");
  assert.match(page, /AdminOrderDetailPage/);
  assert.match(page, /summarizeOrderForAdmin/);
  assert.match(page, /fetchAdminOrders/);
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
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
