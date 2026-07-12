import assert from "node:assert/strict";

import orderDecisionHandler from "../api/operations/order-decision";
import paymentConfirmationHandler from "../api/operations/payment-confirmation";
import orderCompletionHandler from "../api/operations/order-completion";
import orderDetailHandler from "../api/customer/order";
import unreadCountHandler from "../api/customer/notifications/unread-count";
import { createAdminSessionToken } from "../api/_shared/admin-auth";
import {
  INITIAL_ORDER_DOMAIN_STATUS,
  MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
  ORDER_COMPLETED_DOMAIN_STATUS,
} from "../api/_shared/order-domain";
import { isPaymentInstructionsVisibleForState } from "../api/_shared/payment-readiness-domain";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ADMIN_API_KEY = "test-admin-api-key-with-minimum-length";
const ORDER_ID = "RZ-20260707-1001";
const ORDER_UUID = "660e8400-e29b-41d4-a716-446655440030";
const ORDER_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CUSTOMER_TOKEN = "manual-payment-contract-token";
const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

let notificationRows: Array<Record<string, unknown>> = [];
let auditEvents: Array<Record<string, unknown>> = [];
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
  auditEvents = [];
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
  created_at: "2026-07-07T10:00:00.000Z",
  updated_at: "2026-07-07T11:30:00.000Z",
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

      const parsed = new URL(url);
      const orderIdFilter = parsed.searchParams.get("order_id");
      const selectParam = parsed.searchParams.get("select") ?? "";

      if (orderIdFilter?.startsWith("eq.") && selectParam.includes("public_order_number")) {
        return jsonResponse({
          id: ORDER_UUID,
          user_id: ORDER_USER_ID,
          public_order_number: "RZM_0001",
        });
      }

      if (
        selectParam.includes("total_price") &&
        selectParam.includes("production_export") &&
        !selectParam.includes("customer_name")
      ) {
        return jsonResponse({
          status: currentLegacyStatus,
          domain_status: currentDomainStatus,
          total_price: sampleOrderRow.total_price,
          production_export: sampleOrderRow.production_export,
        });
      }

      if (url.includes("select=status%2Cdomain_status") || url.includes("select=status,domain_status")) {
        return jsonResponse({ status: currentLegacyStatus, domain_status: currentDomainStatus });
      }

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

      return jsonResponse(
        notificationRows
          .filter((row) => row.user_id === ORDER_USER_ID)
          .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))),
      );
    }

    if (url.includes("/rest/v1/order_status_events") && method === "POST") {
      const eventBody = init?.body ? JSON.parse(String(init.body)) : {};
      auditEvents.push(eventBody);
      return jsonResponse(eventBody);
    }

    if (url.includes("/rest/v1/order_status_events") && method === "GET") {
      return jsonResponse([]);
    }

    if (url.includes("/rest/v1/order_change_requests")) return jsonResponse([]);
    if (url.includes("/rest/v1/order_manual_pricing_drafts")) return jsonResponse(null);

    return jsonResponse({ ok: true });
  }) as typeof fetch;
}

async function postApprove() {
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();
  await orderDecisionHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: { orderId: ORDER_ID, decision: "approve", reason: null },
      query: {},
    },
    res,
  );
  return snapshot();
}

async function postPaymentConfirmation(note?: string) {
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();
  await paymentConfirmationHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: { orderId: ORDER_ID, note: note ?? null },
      query: {},
    },
    res,
  );
  return snapshot();
}

async function postOrderCompletion(note?: string) {
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();
  await orderCompletionHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: { orderId: ORDER_ID, note: note ?? null },
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

test("contract: approve → awaiting payment → confirm payment → customer notified", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  const approve = await postApprove();
  assert.equal(approve.statusCode, 200);
  assert.equal(currentDomainStatus, OPERATIONS_APPROVED_DOMAIN_STATUS);

  const awaitingOrder = await getCustomerOrder();
  const awaitingBody = awaitingOrder.body as {
    order: {
      status: { label: string; stage: string };
      paymentState: string;
      totalPrice: number;
    };
  };
  assert.equal(awaitingBody.order.status.label, "Ожидает оплаты");
  assert.equal(awaitingBody.order.status.stage, "payment");
  assert.equal(awaitingBody.order.paymentState, "awaiting_manual_confirmation");
  assert.equal(isPaymentInstructionsVisibleForState(awaitingBody.order.paymentState as "awaiting_manual_confirmation"), true);

  const unreadAfterApprove = await getUnreadCount();
  assert.equal((unreadAfterApprove.body as { unreadCount: number }).unreadCount, 1);

  const confirm = await postPaymentConfirmation("Оплата подтверждена менеджером");
  assert.equal(confirm.statusCode, 200);
  assert.equal(currentDomainStatus, MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS);
  assert.equal(auditEvents.length, 2);
  assert.equal(auditEvents[1]?.changed_by, "operations:payment_confirm");
  assert.equal(productionMutations, 0);
  assert.equal(totalPriceMutations, 0);

  const confirmedOrder = await getCustomerOrder();
  const confirmedBody = confirmedOrder.body as {
    order: { status: { label: string }; paymentState: string; totalPrice: number };
  };
  assert.equal(confirmedBody.order.status.label, "В работе");
  assert.equal(confirmedBody.order.paymentState, "confirmed");
  assert.equal(confirmedBody.order.totalPrice, 86400);

  assert.equal(notificationRows.length, 2);
  assert.equal(notificationRows[1]?.title, "Оплата подтверждена");
  assert.doesNotMatch(String(notificationRows[1]?.message ?? ""), /менеджером|card|stripe/i);

  const unreadAfterConfirm = await getUnreadCount();
  assert.equal((unreadAfterConfirm.body as { unreadCount: number }).unreadCount, 2);
});

test("contract: payment confirmation blocked outside Оплата", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  const blocked = await postPaymentConfirmation();
  assert.equal(blocked.statusCode, 409);
  assert.equal(notificationRows.length, 0);
  assert.equal(auditEvents.length, 0);
});

test("contract: confirm payment → complete order lifecycle with safe customer state", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  await postApprove();
  await postPaymentConfirmation("Оплата подтверждена");

  const complete = await postOrderCompletion("Заказ завершён");
  assert.equal(complete.statusCode, 200);
  assert.equal(currentDomainStatus, ORDER_COMPLETED_DOMAIN_STATUS);
  assert.equal(auditEvents.length, 3);
  assert.equal(auditEvents[2]?.changed_by, "operations:order_complete");
  assert.equal(productionMutations, 0);
  assert.equal(totalPriceMutations, 0);

  const completedOrder = await getCustomerOrder();
  const completedBody = completedOrder.body as {
    order: { status: { label: string; stage: string; nextStep: string | null }; totalPrice: number };
  };
  assert.equal(completedBody.order.status.label, "Завершено");
  assert.equal(completedBody.order.status.stage, "completed");
  assert.equal(completedBody.order.status.nextStep, null);
  assert.equal(completedBody.order.totalPrice, 86400);
});

test("contract: order completion blocked outside В работе", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  await postApprove();
  const blocked = await postOrderCompletion();
  assert.equal(blocked.statusCode, 409);
  assert.notEqual(currentDomainStatus, ORDER_COMPLETED_DOMAIN_STATUS);
});

test("contract: approve/reject blocked after completion", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  await postApprove();
  await postPaymentConfirmation();
  await postOrderCompletion();

  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();
  await orderDecisionHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: { orderId: ORDER_ID, decision: "reject", reason: "late reject" },
      query: {},
    },
    res,
  );

  assert.equal(snapshot().statusCode, 409);
  assert.equal(currentDomainStatus, ORDER_COMPLETED_DOMAIN_STATUS);
});

test("contract: repeated completion is rejected after order already completed", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installContractFetchMock();

  await postApprove();
  await postPaymentConfirmation();
  const first = await postOrderCompletion();
  assert.equal(first.statusCode, 200);

  const second = await postOrderCompletion();
  assert.equal(second.statusCode, 409);
  assert.equal(currentDomainStatus, ORDER_COMPLETED_DOMAIN_STATUS);
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
