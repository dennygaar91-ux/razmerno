import assert from "node:assert/strict";

import changeRequestHandler from "../api/customer/change-request";
import changeRequestsHandler from "../api/customer/change-requests";
import { CUSTOMER_UNAUTHORIZED_MESSAGE } from "../api/_shared/customer-api-auth";
import {
  CUSTOMER_CHANGE_REQUEST_FORBIDDEN_RESPONSE_KEYS,
  CUSTOMER_CHANGE_REQUEST_TYPES,
  mapCustomerChangeRequest,
} from "../api/_shared/customer-change-request-types";
import type { CustomerChangeRequestRow } from "../api/_shared/customer-change-request-types";
import {
  CUSTOMER_CHANGE_REQUEST_MESSAGE_MAX_LENGTH,
  validateCustomerChangeRequestBody,
} from "../api/_shared/customer-change-request-validation";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ORDER_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_USER_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ORDER_ID = "660e8400-e29b-41d4-a716-446655440030";
const FOREIGN_ORDER_ID = "660e8400-e29b-41d4-a716-446655440099";
const CHANGE_REQUEST_ID = "770e8400-e29b-41d4-a716-446655440040";
const ACCESS_TOKEN = "change-request-test-token";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

const sampleOrderRow = {
  id: ORDER_ID,
  user_id: ORDER_USER_ID,
  public_order_number: "RZM_0001",
  domain_status: "Проверка",
  created_at: "2026-07-03T12:00:00.000Z",
  total_price: 79_800,
  customer_name: "Иван Петров",
  customer_phone: "+7 999 111-22-33",
  delivery_address: "Москва",
  delivery_enabled: true,
  delivery_price: 6_000,
  assembly_enabled: false,
  assembly_price: null,
  product_type: "wardrobe",
  dimensions: { width: 1800, height: 2200, depth: 600 },
  materials: null,
  style: null,
  sections: null,
  filling: null,
  price_breakdown: null,
};

const sampleChangeRequestRow: CustomerChangeRequestRow = {
  id: CHANGE_REQUEST_ID,
  order_id: ORDER_ID,
  user_id: ORDER_USER_ID,
  request_type: "dimensions",
  message: "Нужно увеличить глубину до 650 мм.",
  status: "submitted",
  created_at: "2026-07-03T13:00:00.000Z",
  updated_at: "2026-07-03T13:00:00.000Z",
};

const foreignChangeRequestRow: CustomerChangeRequestRow = {
  ...sampleChangeRequestRow,
  id: "770e8400-e29b-41d4-a716-446655440099",
  user_id: OTHER_USER_ID,
};

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

function installChangeRequestFetchMock() {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";

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

    if (url.includes("/rest/v1/order_change_requests")) {
      if (method === "POST") {
        const body = init?.body ? JSON.parse(String(init.body)) : null;
        return jsonResponse({
          ...sampleChangeRequestRow,
          order_id: body?.order_id ?? ORDER_ID,
          user_id: body?.user_id ?? ORDER_USER_ID,
          request_type: body?.request_type ?? "dimensions",
          message: body?.message ?? sampleChangeRequestRow.message,
        });
      }

      const parsed = new URL(url);
      const orderFilter = parsed.searchParams.get("order_id");
      const userFilter = parsed.searchParams.get("user_id");
      const orderId = orderFilter?.startsWith("eq.") ? decodeURIComponent(orderFilter.slice(3)) : null;
      const userId = userFilter?.startsWith("eq.") ? decodeURIComponent(userFilter.slice(3)) : null;

      if (orderId === ORDER_ID && userId === ORDER_USER_ID) {
        return jsonResponse([sampleChangeRequestRow]);
      }
      if (orderId === FOREIGN_ORDER_ID) {
        return jsonResponse([]);
      }
      return jsonResponse([]);
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;
}

test("change request POST returns 401 without bearer token", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();

  await changeRequestHandler(
    {
      method: "POST",
      headers: { origin: "http://localhost:5173" },
      body: {
        orderId: ORDER_ID,
        requestType: "dimensions",
        message: "Нужно изменить размеры.",
      },
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 401);
  assert.deepEqual(result.body, { ok: false, message: CUSTOMER_UNAUTHORIZED_MESSAGE });
});

test("change request POST returns 400 for invalid body", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installChangeRequestFetchMock();
  const { res, snapshot } = createMockResponse();

  await changeRequestHandler(
    {
      method: "POST",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: {
        orderId: "not-a-uuid",
        requestType: "dimensions",
        message: "test",
      },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 400);

  await changeRequestHandler(
    {
      method: "POST",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: {
        orderId: ORDER_ID,
        requestType: "invalid-type",
        message: "test",
      },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 400);

  await changeRequestHandler(
    {
      method: "POST",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: {
        orderId: ORDER_ID,
        requestType: "dimensions",
        message: "   ",
      },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 400);
});

test("change request POST returns 404 for foreign order", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installChangeRequestFetchMock();
  const { res, snapshot } = createMockResponse();

  await changeRequestHandler(
    {
      method: "POST",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: {
        orderId: FOREIGN_ORDER_ID,
        requestType: "materials",
        message: "Хочу другой фасад.",
      },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 404);
});

test("change request POST returns 404 for missing order", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installChangeRequestFetchMock();
  const { res, snapshot } = createMockResponse();

  await changeRequestHandler(
    {
      method: "POST",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: {
        orderId: "550e8400-e29b-41d4-a716-446655440099",
        requestType: "other",
        message: "Уточнение по заказу.",
      },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 404);
});

test("change request POST returns safe read model", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installChangeRequestFetchMock();
  const { res, snapshot } = createMockResponse();

  await changeRequestHandler(
    {
      method: "POST",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: {
        orderId: ORDER_ID,
        requestType: "dimensions",
        message: "Нужно увеличить глубину до 650 мм.",
      },
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 200);
  const body = result.body as { ok: boolean; changeRequest: Record<string, unknown> };
  assert.equal(body.ok, true);
  assert.equal(body.changeRequest.orderId, ORDER_ID);
  assert.equal(body.changeRequest.requestType, "dimensions");
  assert.equal(body.changeRequest.status, "submitted");
  assert.match(String(body.changeRequest.message), /650/);

  for (const forbiddenKey of CUSTOMER_CHANGE_REQUEST_FORBIDDEN_RESPONSE_KEYS) {
    assert.equal(forbiddenKey in body.changeRequest, false, `forbidden field leaked: ${forbiddenKey}`);
  }
});

test("change requests GET returns 401 without bearer token", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();

  await changeRequestsHandler(
    {
      method: "GET",
      headers: { origin: "http://localhost:5173" },
      query: { orderId: ORDER_ID },
      body: null,
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 401);
  assert.deepEqual(result.body, { ok: false, message: CUSTOMER_UNAUTHORIZED_MESSAGE });
});

test("change requests GET returns 404 for foreign or missing order", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installChangeRequestFetchMock();
  const { res, snapshot } = createMockResponse();

  await changeRequestsHandler(
    {
      method: "GET",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      query: { orderId: FOREIGN_ORDER_ID },
      body: null,
    },
    res,
  );

  assert.equal(snapshot().statusCode, 404);

  await changeRequestsHandler(
    {
      method: "GET",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      query: { orderId: "550e8400-e29b-41d4-a716-446655440099" },
      body: null,
    },
    res,
  );

  assert.equal(snapshot().statusCode, 404);
});

test("change requests GET returns only current user requests for the order", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installChangeRequestFetchMock();
  const { res, snapshot } = createMockResponse();

  await changeRequestsHandler(
    {
      method: "GET",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      query: { orderId: ORDER_ID },
      body: null,
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 200);
  const body = result.body as { ok: boolean; changeRequests: Array<Record<string, unknown>> };
  assert.equal(body.ok, true);
  assert.equal(body.changeRequests.length, 1);
  assert.equal(body.changeRequests[0]?.orderId, ORDER_ID);
  assert.equal(body.changeRequests[0]?.requestType, "dimensions");
  assert.notEqual(body.changeRequests[0]?.id, foreignChangeRequestRow.id);
});

test("request type validation accepts controlled set only", () => {
  for (const requestType of CUSTOMER_CHANGE_REQUEST_TYPES) {
    const result = validateCustomerChangeRequestBody({
      orderId: ORDER_ID,
      requestType,
      message: "Тестовое сообщение.",
    });
    assert.equal(result.ok, true);
  }

  const invalid = validateCustomerChangeRequestBody({
    orderId: ORDER_ID,
    requestType: "cancel",
    message: "Тестовое сообщение.",
  });
  assert.equal(invalid.ok, false);
});

test("message validation rejects empty and too long values", () => {
  const empty = validateCustomerChangeRequestBody({
    orderId: ORDER_ID,
    requestType: "other",
    message: "   ",
  });
  assert.equal(empty.ok, false);

  const tooLong = validateCustomerChangeRequestBody({
    orderId: ORDER_ID,
    requestType: "other",
    message: "x".repeat(CUSTOMER_CHANGE_REQUEST_MESSAGE_MAX_LENGTH + 1),
  });
  assert.equal(tooLong.ok, false);

  const valid = validateCustomerChangeRequestBody({
    orderId: ORDER_ID,
    requestType: "delivery",
    message: "Перенести доставку на другой адрес.",
  });
  assert.equal(valid.ok, true);
});

test("mapper exposes only customer-safe change request fields", () => {
  const mapped = mapCustomerChangeRequest(sampleChangeRequestRow);
  assert.equal(mapped.id, CHANGE_REQUEST_ID);
  assert.equal(mapped.orderId, ORDER_ID);
  assert.equal(mapped.status, "submitted");
  assert.equal("user_id" in mapped, false);
  assert.equal("updated_at" in mapped, false);
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
