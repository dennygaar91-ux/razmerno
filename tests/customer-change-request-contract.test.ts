import assert from "node:assert/strict";

import changeRequestHandler from "../api/customer/change-request";
import changeRequestDecisionHandler from "../api/operations/change-request-decision";
import orderReviewHandler from "../api/operations/order";
import unreadCountHandler from "../api/customer/notifications/unread-count";
import { createAdminSessionToken } from "../api/_shared/admin-auth";
import { INITIAL_ORDER_DOMAIN_STATUS, OPERATIONS_APPROVED_DOMAIN_STATUS } from "../api/_shared/order-domain";
import { CUSTOMER_CHANGE_REQUEST_STATUS_NOT_ALLOWED_MESSAGE } from "../api/_shared/customer-change-request-policy";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ADMIN_API_KEY = "test-admin-api-key-with-minimum-length";
const ORDER_ID = "RZ-20260705-1001";
const ORDER_UUID = "660e8400-e29b-41d4-a716-446655440030";
const ORDER_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CUSTOMER_TOKEN = "customer-change-request-contract-token";
const CHANGE_REQUEST_ID = "770e8400-e29b-41d4-a716-446655440040";
const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

let changeRequestRows: Array<Record<string, unknown>> = [];
let notificationRows: Array<Record<string, unknown>> = [];
let totalPriceMutations = 0;
let productionMutations = 0;
let currentDomainStatus = INITIAL_ORDER_DOMAIN_STATUS;

function restoreEnvironment() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
  globalThis.fetch = ORIGINAL_FETCH;
  changeRequestRows = [];
  notificationRows = [];
  totalPriceMutations = 0;
  productionMutations = 0;
  currentDomainStatus = INITIAL_ORDER_DOMAIN_STATUS;
}

function setRequiredServerEnv() {
  process.env.ADMIN_API_KEY = ADMIN_API_KEY;
  process.env.ALLOWED_ORIGINS = "http://localhost:5173,https://razmerno.ru";
  process.env.SUPABASE_URL = "https://supabase.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
}

function jsonResponse(payload: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
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

const sampleOrderRow = {
  id: ORDER_UUID,
  user_id: ORDER_USER_ID,
  order_id: ORDER_ID,
  public_order_number: "RZM_0001",
  status: "new",
  domain_status: INITIAL_ORDER_DOMAIN_STATUS,
  created_at: "2026-07-05T10:00:00.000Z",
  updated_at: "2026-07-05T11:30:00.000Z",
  total_price: 86400,
  customer_name: "Иван Петров",
  customer_phone: "+7 999 111-22-33",
  delivery_address: "Москва",
  delivery_enabled: true,
  delivery_price: 1500,
  assembly_enabled: true,
  assembly_price: 7980,
  product_type: "wardrobe",
  dimensions: { width: 1800, height: 2400, depth: 600 },
  materials: { bodyId: "ldsp", facadeId: "ldsp" },
  style: { facadeStyleId: "hinged", hardwareId: "base" },
  sections: 2,
  filling: { shelves: 2, drawers: 0, hangingRod: true },
  price_breakdown: { body: 50000 },
  production_export: { review: { status: "requires-review" } },
};

function installContractFetchMock() {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";

    if (url.includes("/auth/v1/user")) {
      return jsonResponse({ id: ORDER_USER_ID, email: "ivan@example.com", user_metadata: {} });
    }

    if (url.includes("/rest/v1/orders")) {
      if (method === "PATCH" || method === "PUT") {
        const body = init?.body ? JSON.parse(String(init.body)) : {};
        if ("production_export" in body) productionMutations += 1;
        if ("total_price" in body) totalPriceMutations += 1;
        if (typeof body.domain_status === "string") currentDomainStatus = body.domain_status;
        return jsonResponse({ ...sampleOrderRow, domain_status: currentDomainStatus, ...body });
      }

      const parsed = new URL(url);
      const idFilter = parsed.searchParams.get("id");
      const orderUuid = idFilter?.startsWith("eq.") ? decodeURIComponent(idFilter.slice(3)) : null;
      if (orderUuid === ORDER_UUID) {
        return jsonResponse({ ...sampleOrderRow, domain_status: currentDomainStatus });
      }
      if (url.includes(`order_id=eq.${encodeURIComponent(ORDER_ID)}`)) {
        return jsonResponse({ ...sampleOrderRow, domain_status: currentDomainStatus });
      }
      if (url.includes(ORDER_UUID)) {
        return jsonResponse({ ...sampleOrderRow, domain_status: currentDomainStatus });
      }
      return jsonResponse(null, 200);
    }

    if (url.includes("/rest/v1/order_change_requests")) {
      if (method === "POST") {
        const body = init?.body ? JSON.parse(String(init.body)) : {};
        const row = {
          id: CHANGE_REQUEST_ID,
          ...body,
          status: "submitted",
          created_at: "2026-07-05T14:00:00.000Z",
          updated_at: "2026-07-05T14:00:00.000Z",
        };
        changeRequestRows = [row];
        return jsonResponse(row);
      }

      const parsed = new URL(url);
      const idFilter = parsed.searchParams.get("id");
      const changeRequestId = idFilter?.startsWith("eq.") ? decodeURIComponent(idFilter.slice(3)) : null;

      if (method === "PATCH" && changeRequestId === CHANGE_REQUEST_ID) {
        const body = init?.body ? JSON.parse(String(init.body)) : {};
        const updated = { ...changeRequestRows[0], ...body };
        changeRequestRows = [updated];
        return jsonResponse(updated);
      }

      if (changeRequestId === CHANGE_REQUEST_ID) {
        return jsonResponse(changeRequestRows[0] ?? null);
      }

      const orderFilter = parsed.searchParams.get("order_id");
      const orderUuid = orderFilter?.startsWith("eq.") ? decodeURIComponent(orderFilter.slice(3)) : null;
      if (orderUuid === ORDER_UUID) return jsonResponse(changeRequestRows);
      return jsonResponse([]);
    }

    if (url.includes("/rest/v1/order_notifications")) {
      if (method === "POST") {
        const body = init?.body ? JSON.parse(String(init.body)) : {};
        const row = {
          id: `990e8400-e29b-41d4-a716-44665544${String(notificationRows.length).padStart(4, "0")}`,
          ...body,
          is_read: false,
          created_at: new Date().toISOString(),
        };
        notificationRows.push(row);
        return jsonResponse(row);
      }

      const parsed = new URL(url);
      if (parsed.searchParams.get("is_read") === "eq.false" && parsed.searchParams.get("select") === "id") {
        const unread = notificationRows.filter((row) => row.user_id === ORDER_USER_ID && row.is_read === false);
        return new Response(null, {
          status: 200,
          headers: { "Content-Range": `*/${unread.length}` },
        });
      }

      return jsonResponse(notificationRows);
    }

    if (url.includes("/rest/v1/order_status_events")) return jsonResponse([]);
    if (url.includes("/rest/v1/order_manual_pricing_drafts")) return jsonResponse(null);

    return jsonResponse({ ok: true });
  }) as typeof fetch;
}

async function submitCustomerChangeRequest() {
  const { res, snapshot } = createMockResponse();
  await changeRequestHandler(
    {
      method: "POST",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${CUSTOMER_TOKEN}`,
      },
      body: {
        orderId: ORDER_UUID,
        requestType: "dimensions",
        message: "Нужно увеличить глубину.",
      },
    },
    res,
  );
  return snapshot();
}

async function loadOperationsReview() {
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();
  await orderReviewHandler(
    {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
      query: { orderId: ORDER_ID },
      body: null,
    },
    res,
  );
  return snapshot();
}

async function resolveChangeRequest() {
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();
  await changeRequestDecisionHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: { changeRequestId: CHANGE_REQUEST_ID, decision: "resolved" },
      query: {},
    },
    res,
  );
  return snapshot();
}

async function getUnreadCount() {
  const { res, snapshot } = createMockResponse();
  await unreadCountHandler(
    {
      method: "GET",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${CUSTOMER_TOKEN}`,
      },
      body: null,
    },
    res,
  );
  return snapshot();
}

test("contract: customer submit → operations readback → decision → notification", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  const submit = await submitCustomerChangeRequest();
  assert.equal(submit.statusCode, 200);

  const review = await loadOperationsReview();
  const reviewBody = review.body as {
    ok: boolean;
    review: { changeRequests: Array<{ message: string; status: string }>; totalPrice: number };
  };
  assert.equal(review.statusCode, 200);
  assert.equal(reviewBody.review.changeRequests.length, 1);
  assert.match(reviewBody.review.changeRequests[0]?.message ?? "", /глубину/i);

  const decision = await resolveChangeRequest();
  assert.equal(decision.statusCode, 200);

  const unread = await getUnreadCount();
  assert.equal((unread.body as { unreadCount: number }).unreadCount, 2);
  assert.equal(notificationRows.some((row) => row.type === "change_request"), true);
  assert.equal(notificationRows.some((row) => String(row.title).includes("приняты")), true);
  assert.doesNotMatch(JSON.stringify(notificationRows), /Internal|audit reason/i);
  assert.equal(reviewBody.review.totalPrice, 86400);
  assert.equal(totalPriceMutations, 0);
  assert.equal(productionMutations, 0);
});

test("contract: non-owner cannot submit change request", async () => {
  restoreEnvironment();
  setRequiredServerEnv();

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes("/auth/v1/user")) {
      return jsonResponse({ id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", email: "other@example.com", user_metadata: {} });
    }

    if (url.includes("/rest/v1/orders")) {
      const parsed = new URL(url);
      const idFilter = parsed.searchParams.get("id");
      const orderUuid = idFilter?.startsWith("eq.") ? decodeURIComponent(idFilter.slice(3)) : null;
      if (orderUuid === ORDER_UUID) return jsonResponse(sampleOrderRow);
      return jsonResponse(null, 200);
    }

    return jsonResponse([]);
  }) as typeof fetch;

  const { res, snapshot } = createMockResponse();
  await changeRequestHandler(
    {
      method: "POST",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${CUSTOMER_TOKEN}`,
      },
      body: {
        orderId: ORDER_UUID,
        requestType: "dimensions",
        message: "Попытка чужого запроса.",
      },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 404);
});

test("contract: customer cannot submit change request after order leaves Проверка", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();
  currentDomainStatus = OPERATIONS_APPROVED_DOMAIN_STATUS;

  const blocked = await submitCustomerChangeRequest();
  assert.equal(blocked.statusCode, 409);
  const body = blocked.body as { message: string };
  assert.equal(body.message, CUSTOMER_CHANGE_REQUEST_STATUS_NOT_ALLOWED_MESSAGE);
  assert.equal(changeRequestRows.length, 0);
});

test("contract: operations decision locks resolved change request from repeat decision", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  await submitCustomerChangeRequest();
  const firstDecision = await resolveChangeRequest();
  assert.equal(firstDecision.statusCode, 200);

  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();
  await changeRequestDecisionHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: { changeRequestId: CHANGE_REQUEST_ID, decision: "rejected" },
      query: {},
    },
    res,
  );

  assert.equal(snapshot().statusCode, 409);
  assert.equal(changeRequestRows[0]?.status, "resolved");
});

test("contract: post-decision customer notification stays safe without internal operations notes", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  await submitCustomerChangeRequest();
  await resolveChangeRequest();

  assert.equal(notificationRows.length, 2);
  const serialized = JSON.stringify(notificationRows);
  assert.doesNotMatch(serialized, /Internal|audit reason|decisionHistory|manager_email/i);
  assert.match(serialized, /change_request|приняты/i);
});

async function runTests() {
  try {
    for (const item of tests) {
      await item.run();
      console.log(`ok - ${item.name}`);
    }
    console.log(`\n${tests.length} passed`);
  } finally {
    restoreEnvironment();
  }
}

void runTests();
