import assert from "node:assert/strict";

import handler from "../api/orders";
import { CUSTOMER_UNAUTHORIZED_MESSAGE } from "../api/_shared/customer-api-auth";
import { INITIAL_ORDER_DOMAIN_STATUS, PUBLIC_ORDER_NUMBER_PATTERN } from "../api/_shared/order-domain";
import {
  ORDER_SUBMIT_TEST_AUTH_TOKEN,
  ORDER_SUBMIT_TEST_USER_ID,
} from "../api/_shared/order-submit-auth";
import type { OrderRequest } from "../api/_shared/order-types";
import { makeValidOrder } from "./fixtures/order-contract-fixture";

type FetchRecord = {
  url: string;
  method: string;
  body: string | null;
};

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
  process.env.RESEND_API_KEY = "test-resend-key";
  process.env.ORDER_MANAGER_EMAIL = "manager@example.com";
  process.env.MAIL_FROM = "Размерно <noreply@example.com>";
  process.env.ADMIN_API_KEY = "test-admin-key";
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const ORDER_SUBMIT_ORDER_UUID = "660e8400-e29b-41d4-a716-446655440031";

function installOwnershipFetchMock(options: {
  profilePhone?: string | null;
  projectOwnerId?: string | null;
  notificationInsertFails?: boolean;
} = {}): FetchRecord[] {
  const records: FetchRecord[] = [];
  let publicOrderSequence = 0;
  const orders = new Map<string, Record<string, unknown>>();
  const projectId = "550e8400-e29b-41d4-a716-446655440010";
  const foreignProjectId = "550e8400-e29b-41d4-a716-446655440011";

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";
    records.push({
      url,
      method,
      body: typeof init?.body === "string" ? init.body : null,
    });

    if (url.includes("/rest/v1/rpc/next_public_order_number")) {
      publicOrderSequence += 1;
      return jsonResponse(`RZM_${String(publicOrderSequence).padStart(4, "0")}`);
    }

    if (url.includes("/rest/v1/orders")) {
      if (method === "POST") {
        const payload = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
        orders.set(String(payload.order_id), {
          ...payload,
          id: ORDER_SUBMIT_ORDER_UUID,
        });
        return jsonResponse([], 201);
      }
      if (method === "GET") {
        const parsed = new URL(url);
        const filter = parsed.searchParams.get("order_id");
        const orderId = filter?.startsWith("eq.") ? decodeURIComponent(filter.slice(3)) : null;
        const order = orderId ? orders.get(orderId) : null;
        if (order && parsed.searchParams.get("select")?.includes("id")) {
          return jsonResponse({ id: order.id, user_id: order.user_id });
        }
        return jsonResponse(order ? [order] : [], 200);
      }
      if (method === "PATCH") {
        return jsonResponse([], 200);
      }
    }

    if (url.includes("/rest/v1/order_notifications") && method === "POST") {
      if (options.notificationInsertFails) {
        return jsonResponse({ message: "notification insert failed" }, 500);
      }
      return jsonResponse({
        id: "990e8400-e29b-41d4-a716-446655440060",
        ...(init?.body ? JSON.parse(String(init.body)) : {}),
        is_read: false,
        created_at: "2026-07-05T14:00:00.000Z",
      });
    }

    if (url.includes("/rest/v1/price_items") && method === "GET") {
      return jsonResponse([], 200);
    }

    if (url.includes("/rest/v1/constructor_projects") && method === "GET") {
      const parsed = new URL(url);
      const filter = parsed.searchParams.get("id");
      const id = filter?.startsWith("eq.") ? decodeURIComponent(filter.slice(3)) : null;
      if (id === projectId) {
        return jsonResponse([
          {
            id: projectId,
            user_id: options.projectOwnerId ?? ORDER_SUBMIT_TEST_USER_ID,
            title: "Тестовый проект",
            snapshot: { version: 1, draft: { furnitureType: "Шкаф" } },
            furniture_type: "wardrobe",
            preview_path: null,
            archived_at: null,
            created_at: "2026-07-03T10:00:00.000Z",
            updated_at: "2026-07-03T10:00:00.000Z",
          },
        ]);
      }
      if (id === foreignProjectId) {
        return jsonResponse([
          {
            id: foreignProjectId,
            user_id: "22222222-2222-4222-8222-222222222202",
            title: "Чужой проект",
            snapshot: { version: 1, draft: { furnitureType: "Шкаф" } },
            furniture_type: "wardrobe",
            preview_path: null,
            archived_at: null,
            created_at: "2026-07-03T10:00:00.000Z",
            updated_at: "2026-07-03T10:00:00.000Z",
          },
        ]);
      }
      return jsonResponse([], 200);
    }

    if (url.includes("/rest/v1/profiles")) {
      if (method === "GET") {
        return jsonResponse({
          user_id: ORDER_SUBMIT_TEST_USER_ID,
          full_name: "Contract Test",
          email: "contract-test@example.com",
          phone: options.profilePhone ?? null,
          created_at: "2026-07-03T10:00:00.000Z",
          updated_at: "2026-07-03T10:00:00.000Z",
        });
      }
      if (method === "PATCH") {
        const patch = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
        return jsonResponse({
          user_id: ORDER_SUBMIT_TEST_USER_ID,
          full_name: "Contract Test",
          email: "contract-test@example.com",
          phone: patch.phone ?? null,
          created_at: "2026-07-03T10:00:00.000Z",
          updated_at: "2026-07-03T10:05:00.000Z",
        });
      }
    }

    if (url.includes("api.resend.com/emails")) {
      return jsonResponse({ id: "email-1" });
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;

  return records;
}

function makeReq(body: OrderRequest, authenticated = true) {
  const headers: Record<string, string> = {
    origin: "http://localhost:5173",
    "user-agent": "customer-order-submit-test",
    "idempotency-key": body.orderId ?? "RZ-20260703-1001",
  };
  if (authenticated) {
    headers.authorization = `Bearer ${ORDER_SUBMIT_TEST_AUTH_TOKEN}`;
  }
  return { method: "POST", headers, body, socket: { remoteAddress: "198.51.100.10" } };
}

function makeRes() {
  const state: { statusCode: number | null; json: unknown } = { statusCode: null, json: undefined };
  const res = {
    setHeader() {
      return res;
    },
    status(code: number) {
      state.statusCode = code;
      return {
        json(payload: unknown) {
          state.json = payload;
        },
        end() {},
      };
    },
  };
  return { state, res };
}

function getOrdersInsert(records: FetchRecord[]) {
  const insert = records.find((record) => record.url.includes("/rest/v1/orders") && record.method === "POST");
  assert.ok(insert?.body, "expected orders insert");
  return JSON.parse(insert.body) as Record<string, unknown>;
}

function getNotificationInserts(records: FetchRecord[]) {
  return records.filter((record) => record.url.includes("/rest/v1/order_notifications") && record.method === "POST");
}

async function runTests() {
  const ownedProjectId = "550e8400-e29b-41d4-a716-446655440010";
  const foreignProjectId = "550e8400-e29b-41d4-a716-446655440011";

  try {
    setRequiredServerEnv();

    {
      const records = installOwnershipFetchMock();
      const { res, state } = makeRes();
      await handler(makeReq(makeValidOrder(), false), res);
      assert.equal(state.statusCode, 401);
      assert.deepEqual(state.json, { ok: false, message: CUSTOMER_UNAUTHORIZED_MESSAGE });
      assert.equal(records.filter((record) => record.url.includes("/rest/v1/orders") && record.method === "POST").length, 0);
    }

    {
      const records = installOwnershipFetchMock();
      const order = makeValidOrder({ orderId: "RZ-20260703-2001" });
      const { res, state } = makeRes();
      await handler(makeReq(order), res);
      assert.equal(state.statusCode, 200);
      const response = state.json as { publicOrderNumber?: string; orderId?: string };
      assert.match(String(response.publicOrderNumber), PUBLIC_ORDER_NUMBER_PATTERN);
      assert.equal(response.orderId, "RZ-20260703-2001");

      const insert = getOrdersInsert(records);
      assert.equal(insert.user_id, ORDER_SUBMIT_TEST_USER_ID);
      assert.equal(insert.domain_status, INITIAL_ORDER_DOMAIN_STATUS);
      assert.equal(insert.status, "new");
      assert.match(String(insert.public_order_number), PUBLIC_ORDER_NUMBER_PATTERN);
      assert.equal(insert.constructor_project_id, null);
    }

    {
      const records = installOwnershipFetchMock();
      const order = makeValidOrder({
        orderId: "RZ-20260703-2002",
        projectId: ownedProjectId,
      });
      const { res, state } = makeRes();
      await handler(makeReq(order), res);
      assert.equal(state.statusCode, 200);
      const insert = getOrdersInsert(records);
      assert.equal(insert.constructor_project_id, ownedProjectId);
    }

    {
      installOwnershipFetchMock();
      const order = makeValidOrder({
        orderId: "RZ-20260703-2003",
        projectId: foreignProjectId,
      });
      const { res, state } = makeRes();
      await handler(makeReq(order), res);
      assert.equal(state.statusCode, 404);
    }

    {
      const records = installOwnershipFetchMock({ profilePhone: null });
      const order = makeValidOrder({ orderId: "RZ-20260703-2004" });
      const { res, state } = makeRes();
      await handler(makeReq(order), res);
      assert.equal(state.statusCode, 200);
      const profilePatch = records.find(
        (record) => record.url.includes("/rest/v1/profiles") && record.method === "PATCH",
      );
      assert.ok(profilePatch?.body, "expected profile phone autofill patch");
      const patchBody = JSON.parse(profilePatch.body) as { phone?: string };
      assert.equal(patchBody.phone, order.customer?.phone?.trim());
    }

    {
      const records = installOwnershipFetchMock({ profilePhone: "+7 900 000-00-00" });
      const order = makeValidOrder({ orderId: "RZ-20260703-2005" });
      const { res, state } = makeRes();
      await handler(makeReq(order), res);
      assert.equal(state.statusCode, 200);
      const profilePatch = records.find(
        (record) => record.url.includes("/rest/v1/profiles") && record.method === "PATCH",
      );
      assert.equal(profilePatch, undefined);
    }

    {
      const records = installOwnershipFetchMock();
      const order = makeValidOrder({ orderId: "RZ-20260705-3001" });
      const { res, state } = makeRes();
      await handler(makeReq(order), res);
      assert.equal(state.statusCode, 200);
      const notificationInserts = getNotificationInserts(records);
      assert.equal(notificationInserts.length, 1);
      const payload = JSON.parse(String(notificationInserts[0]?.body ?? "{}")) as Record<string, unknown>;
      assert.equal(payload.type, "order_created");
      assert.equal(payload.title, "Заказ оформлен");
      assert.equal(payload.user_id, ORDER_SUBMIT_TEST_USER_ID);
      assert.equal(payload.order_id, ORDER_SUBMIT_ORDER_UUID);
    }

    {
      const records = installOwnershipFetchMock({ notificationInsertFails: true });
      const order = makeValidOrder({ orderId: "RZ-20260705-3002" });
      const { res, state } = makeRes();
      await handler(makeReq(order), res);
      assert.equal(state.statusCode, 200);
      assert.equal(getNotificationInserts(records).length, 1);
    }

    console.log("customer-order-submit: 8 passed");
  } finally {
    restoreEnvironment();
  }
}

void runTests();
