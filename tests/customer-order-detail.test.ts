import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import orderDetailHandler from "../api/customer/order";
import { CUSTOMER_UNAUTHORIZED_MESSAGE } from "../api/_shared/customer-api-auth";
import {
  buildCustomerOrderPricingSummary,
  CUSTOMER_ORDER_DETAIL_FORBIDDEN_RESPONSE_KEYS,
  formatCustomerOrderDimensionsSummary,
  formatCustomerOrderMaterialsDecorSummary,
  mapCustomerOrderDetail,
} from "../api/_shared/customer-order-detail-types";
import {
  CUSTOMER_ORDER_STATUS_FORBIDDEN_RESPONSE_KEYS,
  mapCustomerOrderStatus,
} from "../api/_shared/customer-order-status";
import type { CustomerOrderDetailRow } from "../api/_shared/customer-order-detail-types";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ORDER_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_USER_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ORDER_ID = "660e8400-e29b-41d4-a716-446655440030";
const FOREIGN_ORDER_ID = "660e8400-e29b-41d4-a716-446655440099";
const ACCESS_TOKEN = "order-detail-test-token";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

function restoreEnvironment() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
  globalThis.fetch = ORIGINAL_FETCH;
}

function setRequiredServerEnv() {
  process.env.ALLOWED_ORIGINS = "http://localhost:5173,https://razmerno.ru";
  process.env.SUPABASE_URL = "https://supabase.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function createMockResponse() {
  const state = { statusCode: 200, headers: {} as Record<string, string>, body: null as unknown };
  const res = {
    setHeader(name: string, value: string) {
      state.headers[name] = value;
    },
    status(code: number) {
      state.statusCode = code;
      return {
        json(payload: unknown) {
          state.body = payload;
        },
        end() {
          state.body = null;
        },
      };
    },
  };
  return { res, snapshot: () => ({ ...state, headers: { ...state.headers } }) };
}

const sampleOrderRow: CustomerOrderDetailRow = {
  id: ORDER_ID,
  user_id: ORDER_USER_ID,
  public_order_number: "RZM_0001",
  domain_status: "Проверка",
  created_at: "2026-07-03T12:00:00.000Z",
  total_price: 79_800,
  customer_name: "Иван Петров",
  customer_phone: "+7 999 111-22-33",
  delivery_address: "Москва, ул. Пример, 1",
  delivery_enabled: true,
  delivery_price: 6_000,
  assembly_enabled: true,
  assembly_price: 7_500,
  product_type: "wardrobe",
  dimensions: { width: 1800, height: 2200, depth: 600 },
  materials: { bodyId: "ldsp-egger-w960-belyy", facadeId: "ldsp-egger-h3395-dub" },
  style: { facadeStyleId: "hinged", hardwareId: "base-handle" },
  sections: 2,
  filling: { shelves: 4, drawers: 0, hangingRod: true },
  price_breakdown: {
    body: 32_000,
    delivery: 6_000,
    assembly: 7_500,
    production: 99_999,
  },
};

function installOrderDetailFetchMock() {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes("/auth/v1/user")) {
      return jsonResponse({
        id: ORDER_USER_ID,
        email: "ivan@example.com",
        user_metadata: { full_name: "Иван Петров" },
      });
    }

    if (url.includes("/rest/v1/orders")) {
      const parsed = new URL(url);
      const idFilter = parsed.searchParams.get("id");
      const orderId = idFilter?.startsWith("eq.") ? decodeURIComponent(idFilter.slice(3)) : null;
      if (orderId === ORDER_ID) {
        return jsonResponse(sampleOrderRow);
      }
      if (orderId === FOREIGN_ORDER_ID) {
        return jsonResponse({ ...sampleOrderRow, id: FOREIGN_ORDER_ID, user_id: OTHER_USER_ID });
      }
      return jsonResponse(null, 200);
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;
}

test("order detail GET returns 401 without bearer token", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();

  await orderDetailHandler(
    {
      method: "GET",
      headers: { origin: "http://localhost:5173" },
      query: { id: ORDER_ID },
      body: null,
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 401);
  assert.deepEqual(result.body, { ok: false, message: CUSTOMER_UNAUTHORIZED_MESSAGE });
});

test("order detail GET returns 404 for foreign order", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installOrderDetailFetchMock();
  const { res, snapshot } = createMockResponse();

  await orderDetailHandler(
    {
      method: "GET",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      query: { id: FOREIGN_ORDER_ID },
      body: null,
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 404);
});

test("order detail GET returns 404 for missing order", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installOrderDetailFetchMock();
  const { res, snapshot } = createMockResponse();

  await orderDetailHandler(
    {
      method: "GET",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      query: { id: "550e8400-e29b-41d4-a716-446655440099" },
      body: null,
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 404);
});

test("order detail response uses publicOrderNumber and safe fields only", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installOrderDetailFetchMock();
  const { res, snapshot } = createMockResponse();

  await orderDetailHandler(
    {
      method: "GET",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      query: { id: ORDER_ID },
      body: null,
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 200);
  const body = result.body as { ok: boolean; order: Record<string, unknown> };
  assert.equal(body.ok, true);
  assert.equal(body.order.publicOrderNumber, "RZM_0001");
  assert.equal(body.order.status.label, "На проверке");
  assert.equal(body.order.status.stage, "review");
  assert.equal(body.order.customerPhone, "+7 999 111-22-33");

  for (const forbiddenKey of CUSTOMER_ORDER_DETAIL_FORBIDDEN_RESPONSE_KEYS) {
    assert.equal(forbiddenKey in body.order, false, `forbidden field leaked: ${forbiddenKey}`);
  }
  for (const forbiddenKey of CUSTOMER_ORDER_STATUS_FORBIDDEN_RESPONSE_KEYS) {
    assert.equal(forbiddenKey in body.order, false, `forbidden status field leaked: ${forbiddenKey}`);
  }
});

test("customer order status mapping covers lifecycle states and unknown fallback", () => {
  assert.equal(mapCustomerOrderStatus("Проверка").label, "На проверке");
  assert.equal(mapCustomerOrderStatus("Проверка").stage, "review");
  assert.equal(mapCustomerOrderStatus("Оплата").label, "Ожидает оплаты");
  assert.equal(mapCustomerOrderStatus("Оплата").stage, "payment");
  assert.equal(mapCustomerOrderStatus("Отмена").label, "Отменён");
  assert.equal(mapCustomerOrderStatus("Отмена").stage, "cancelled");
  assert.equal(mapCustomerOrderStatus("В работе").label, "В работе");
  assert.equal(mapCustomerOrderStatus("В работе").stage, "in_progress");
  assert.equal(mapCustomerOrderStatus("Завершено").label, "Завершено");
  assert.equal(mapCustomerOrderStatus("Завершено").stage, "completed");
  assert.equal(mapCustomerOrderStatus("Черновик").label, "Черновик");
  assert.equal(mapCustomerOrderStatus("Черновик").stage, "unknown");
  assert.equal(mapCustomerOrderStatus(null).label, "Статус уточняется");
  assert.equal(mapCustomerOrderStatus("").stage, "unknown");

  const mapped = mapCustomerOrderDetail({ ...sampleOrderRow, domain_status: "Оплата" });
  assert.equal(mapped.status.label, "Ожидает оплаты");
  assert.equal("domainStatus" in mapped, false);
  assert.equal("changed_by" in mapped, false);
});

test("dimensions/materials/pricing summary mapping", () => {
  assert.equal(
    formatCustomerOrderDimensionsSummary(sampleOrderRow.dimensions),
    "1800 × 2200 × 600 мм",
  );
  assert.match(
    formatCustomerOrderMaterialsDecorSummary(sampleOrderRow.materials, sampleOrderRow.style) ?? "",
    /Корпус:/,
  );
  assert.match(
    formatCustomerOrderMaterialsDecorSummary(sampleOrderRow.materials, sampleOrderRow.style) ?? "",
    /Фасад:/,
  );

  const pricing = buildCustomerOrderPricingSummary(sampleOrderRow);
  assert.equal(pricing.furnitureTotal, 66_300);
  assert.equal(pricing.deliveryTotal, 6_000);
  assert.equal(pricing.assemblyTotal, 7_500);

  const mapped = mapCustomerOrderDetail(sampleOrderRow);
  assert.equal(mapped.pricingSummary.furnitureTotal, 66_300);
  assert.equal(mapped.deliveryEnabled, true);
  assert.equal(mapped.assemblyEnabled, true);
  assert.equal(mapped.dimensionsSummary, "1800 × 2200 × 600 мм");
});

test("account orders list links to order detail route", () => {
  const cabinet = readFileSync("src/static-pages/account/CustomerAccountCabinet.tsx", "utf8");
  const routes = readFileSync("src/shared/workspace/orderDetailRoutes.ts", "utf8");
  assert.match(cabinet, /buildAccountOrderUrl/);
  assert.match(cabinet, /Открыть заказ/);
  assert.match(routes, /\/account\/order\//);
});

test("App routes account order detail page", () => {
  const app = readFileSync("src/App.tsx", "utf8");
  const page = readFileSync("src/static-pages/AccountOrderPage.tsx", "utf8");
  const card = readFileSync("src/static-pages/account/CustomerOrderDetailCard.tsx", "utf8");
  assert.match(app, /accountOrder/);
  assert.match(app, /LazyAccountOrderPage/);
  assert.match(page, /CustomerOrderDetailCard/);
  assert.match(page, /AccountPageGate/);
  assert.match(card, /useCustomerOrderDetail/);
  assert.match(card, /Вернуться в кабинет/);
});

test("order card UI is read-only", () => {
  const card = readFileSync("src/static-pages/account/CustomerOrderDetailCard.tsx", "utf8");
  assert.doesNotMatch(card, /<form\b/i);
  assert.doesNotMatch(card, /<input\b/i);
  assert.doesNotMatch(card, /<textarea\b/i);
  assert.doesNotMatch(card, /Отменить/i);
  assert.doesNotMatch(card, /Оплат/i);
});

test("customer order status timeline renders safe customer-facing states", () => {
  const card = readFileSync("src/static-pages/account/CustomerOrderDetailCard.tsx", "utf8");
  const timeline = readFileSync("src/static-pages/account/CustomerOrderStatusTimeline.tsx", "utf8");

  assert.match(card, /CustomerOrderStatusTimeline/);
  assert.match(timeline, /На проверке/);
  assert.match(timeline, /Ожидает оплаты/);
  assert.match(timeline, /В работе/);
  assert.match(timeline, /Завершено/);
  assert.match(timeline, /Отменён/);
  assert.match(timeline, /status\.description/);
  assert.match(timeline, /status\.nextStep/);
  assert.doesNotMatch(timeline, /changed_by|auditReason|domainStatus|order_status_events/i);
  assert.doesNotMatch(card, /createClient|supabase/i);
});

test("customer order status matrix covers all domain statuses with safe labels and timeline stages", () => {
  const timeline = readFileSync("src/static-pages/account/CustomerOrderStatusTimeline.tsx", "utf8");
  const statusCases = [
    { domain: "Черновик", label: "Черновик", stage: "unknown" },
    { domain: "Проверка", label: "На проверке", stage: "review" },
    { domain: "Оплата", label: "Ожидает оплаты", stage: "payment" },
    { domain: "В работе", label: "В работе", stage: "in_progress" },
    { domain: "Завершено", label: "Завершено", stage: "completed", nextStep: null },
    { domain: "Отмена", label: "Отменён", stage: "cancelled", nextStep: null },
    { domain: "Неизвестный статус", label: "Неизвестный статус", stage: "unknown" },
  ] as const;

  for (const statusCase of statusCases) {
    const mapped = mapCustomerOrderStatus(statusCase.domain);
    assert.equal(mapped.label, statusCase.label, `label for ${statusCase.domain}`);
    assert.equal(mapped.stage, statusCase.stage, `stage for ${statusCase.domain}`);
    if ("nextStep" in statusCase) {
      assert.equal(mapped.nextStep, statusCase.nextStep);
    }
    assert.doesNotMatch(mapped.description, /audit|manager_email|production_export|decisionHistory/i);
  }

  assert.match(timeline, /HAPPY_PATH_STEPS/);
  assert.match(timeline, /cancelled/);
  assert.match(timeline, /getCustomerOrderStatusTimelineSteps/);
  assert.doesNotMatch(timeline, /manufacturing|drilling|basisExport/i);
});

test("order detail keeps publicOrderNumber separate from internal business order id", () => {
  const detailTypes = readFileSync("api/_shared/customer-order-detail-types.ts", "utf8");
  assert.match(detailTypes, /publicOrderNumber/);
  assert.match(detailTypes, /public_order_number/);
  assert.doesNotMatch(detailTypes, /publicOrderNumber:\s*row\.id/);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests().finally(() => {
  restoreEnvironment();
});
