import assert from "node:assert/strict";

import orderDecisionHandler from "../api/operations/order-decision";
import orderDetailHandler from "../api/customer/order";
import unreadCountHandler from "../api/customer/notifications/unread-count";
import notificationsHandler from "../api/customer/notifications";
import notificationReadHandler from "../api/customer/notification/read";
import { createAdminSessionToken } from "../api/_shared/admin-auth";
import {
  INITIAL_ORDER_DOMAIN_STATUS,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
  OPERATIONS_REJECTED_DOMAIN_STATUS,
} from "../api/_shared/order-domain";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ADMIN_API_KEY = "test-admin-api-key-with-minimum-length";
const ORDER_ID = "RZ-20260705-1001";
const ORDER_UUID = "660e8400-e29b-41d4-a716-446655440030";
const ORDER_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CUSTOMER_TOKEN = "customer-contract-token";
const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

let notificationRows: Array<Record<string, unknown>> = [];
let currentDomainStatus = INITIAL_ORDER_DOMAIN_STATUS;
let currentLegacyStatus = "new";
let productionMutations = 0;
let totalPriceMutations = 0;

function restoreEnvironment() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
  globalThis.fetch = ORIGINAL_FETCH;
  notificationRows = [];
  currentDomainStatus = INITIAL_ORDER_DOMAIN_STATUS;
  currentLegacyStatus = "new";
  productionMutations = 0;
  totalPriceMutations = 0;
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
};

function installContractFetchMock() {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";

    if (url.includes("/auth/v1/user")) {
      return jsonResponse({ id: ORDER_USER_ID, email: "ivan@example.com", user_metadata: {} });
    }

    if (url.includes("/rest/v1/orders")) {
      const row = () => ({
        ...sampleOrderRow,
        domain_status: currentDomainStatus,
        status: currentLegacyStatus,
      });

      if (method === "PATCH" || method === "PUT") {
        const body = init?.body ? JSON.parse(String(init.body)) : {};
        if ("production_export" in body) productionMutations += 1;
        if ("total_price" in body) totalPriceMutations += 1;
        if (typeof body.domain_status === "string") currentDomainStatus = body.domain_status;
        if (typeof body.status === "string") currentLegacyStatus = body.status;
        return jsonResponse({ ...row(), ...body });
      }

      if (url.includes("select=status%2Cdomain_status") || url.includes("select=status,domain_status")) {
        return jsonResponse({ status: currentLegacyStatus, domain_status: currentDomainStatus });
      }
      if (
        (url.includes("select=id%2Cuser_id%2Cpublic_order_number") ||
          url.includes("select=id,user_id,public_order_number")) &&
        !url.includes("total_price")
      ) {
        return jsonResponse({
          id: ORDER_UUID,
          user_id: ORDER_USER_ID,
          public_order_number: "RZM_0001",
        });
      }
      const parsed = new URL(url);
      const idFilter = parsed.searchParams.get("id");
      const orderUuid = idFilter?.startsWith("eq.") ? decodeURIComponent(idFilter.slice(3)) : null;
      if (orderUuid === ORDER_UUID) return jsonResponse(row());
      if (url.includes(ORDER_ID)) return jsonResponse(row());
      return jsonResponse([row()]);
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

      if (method === "PATCH") {
        const idFilter = parsed.searchParams.get("id");
        const notificationId = idFilter?.startsWith("eq.") ? decodeURIComponent(idFilter.slice(3)) : null;
        const row = notificationRows.find((item) => item.id === notificationId);
        if (!row) return jsonResponse(null, 200);
        row.is_read = true;
        return jsonResponse(row);
      }

      return jsonResponse(
        notificationRows
          .filter((row) => row.user_id === ORDER_USER_ID)
          .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))),
      );
    }

    if (url.includes("/rest/v1/order_status_events") && method === "POST") {
      return jsonResponse(init?.body ? JSON.parse(String(init.body)) : {});
    }

    if (url.includes("/rest/v1/order_change_requests")) {
      return jsonResponse([]);
    }

    if (url.includes("/rest/v1/order_manual_pricing_drafts")) {
      return jsonResponse(null);
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;
}

async function postDecision(decision: "approve" | "reject", reason?: string) {
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();
  await orderDecisionHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: { orderId: ORDER_ID, decision, reason: reason ?? null },
      query: {},
    },
    res,
  );
  return snapshot();
}

async function getCustomerOrder() {
  const { res, snapshot } = createMockResponse();
  await orderDetailHandler(
    {
      method: "GET",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${CUSTOMER_TOKEN}`,
      },
      query: { id: ORDER_UUID },
      body: null,
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

test("contract approve: customer status, notification and unread count", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  const decision = await postDecision("approve");
  assert.equal(decision.statusCode, 200);

  const order = await getCustomerOrder();
  const orderBody = order.body as { order: { status: { label: string; stage: string }; totalPrice: number } };
  assert.equal(orderBody.order.status.label, "Ожидает оплаты");
  assert.equal(orderBody.order.status.stage, "payment");

  const unread = await getUnreadCount();
  assert.equal((unread.body as { unreadCount: number }).unreadCount, 1);
  assert.equal(notificationRows[0]?.type, "order_updated");
  assert.doesNotMatch(String(notificationRows[0]?.message ?? ""), /audit|changed_by/i);
  assert.equal(productionMutations, 0);
  assert.equal(totalPriceMutations, 0);
  assert.equal(orderBody.order.totalPrice, 86400);
});

test("contract reject: customer status, notification and no internal reason leak", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  const decision = await postDecision("reject", "  Internal reject reason  ");
  assert.equal(decision.statusCode, 200);

  const order = await getCustomerOrder();
  const orderBody = order.body as { order: { status: { label: string } } };
  assert.equal(orderBody.order.status.label, "Отменён");
  assert.equal(notificationRows.length, 1);
  assert.match(String(notificationRows[0]?.title ?? ""), /отменена/i);
  assert.doesNotMatch(String(notificationRows[0]?.message ?? ""), /Internal reject reason/i);

  const unread = await getUnreadCount();
  assert.equal((unread.body as { unreadCount: number }).unreadCount, 1);
});

test("contract notification can be marked read and unread count decreases", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  await postDecision("approve");
  const notificationId = String(notificationRows[0]?.id);
  const before = await getUnreadCount();
  assert.equal((before.body as { unreadCount: number }).unreadCount, 1);

  const { res, snapshot } = createMockResponse();
  await notificationReadHandler(
    {
      method: "PATCH",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${CUSTOMER_TOKEN}`,
      },
      body: { notificationId },
    },
    res,
  );
  assert.equal(snapshot().statusCode, 200);

  const after = await getUnreadCount();
  assert.equal((after.body as { unreadCount: number }).unreadCount, 0);
});

test("contract second decision attempt remains blocked with unchanged customer price", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  await postDecision("approve");
  const second = await postDecision("approve");
  assert.equal(second.statusCode, 409);
  assert.equal(notificationRows.length, 1);

  const order = await getCustomerOrder();
  const orderBody = order.body as { order: { status: { label: string }; totalPrice: number } };
  assert.equal(orderBody.order.status.label, "Ожидает оплаты");
  assert.equal(orderBody.order.totalPrice, 86400);
  assert.notEqual(currentDomainStatus, OPERATIONS_REJECTED_DOMAIN_STATUS);
  assert.equal(currentDomainStatus, OPERATIONS_APPROVED_DOMAIN_STATUS);
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
