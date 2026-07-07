import assert from "node:assert/strict";

import changeRequestDecisionHandler from "../api/operations/change-request-decision";
import { createAdminSessionToken } from "../api/_shared/admin-auth";
import { validateOperationsChangeRequestDecisionBody } from "../api/_shared/operations-change-request-validation";
import {
  isValidOperationsChangeRequestDecisionTransition,
} from "../api/_shared/operations-change-request-policy";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ADMIN_API_KEY = "test-admin-api-key-with-minimum-length";
const ORDER_ID = "RZ-20260705-1001";
const ORDER_UUID = "660e8400-e29b-41d4-a716-446655440030";
const CHANGE_REQUEST_ID = "770e8400-e29b-41d4-a716-446655440040";
const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

let changeRequestStatus = "submitted";
let totalPriceMutations = 0;
let productionMutations = 0;

const sampleOrderRow = {
  id: ORDER_UUID,
  order_id: ORDER_ID,
  status: "new",
  domain_status: "Проверка",
  created_at: "2026-07-05T10:00:00.000Z",
  updated_at: "2026-07-05T11:30:00.000Z",
  product_type: "wardrobe",
  dimensions: { width: 1800, height: 2400, depth: 600 },
  total_price: 86400,
  price_breakdown: { body: 50000 },
  delivery_enabled: true,
  delivery_price: 1500,
  delivery_address: "Москва",
  assembly_enabled: true,
  assembly_price: 7980,
  assembly_base_price: 79800,
  customer_name: "Иван Петров",
  customer_phone: "+7 999 123-45-67",
  customer_email: "ivan.petrov@example.com",
  manager_email_status: "sent",
  customer_email_status: "pending",
  production_export: { review: { status: "requires-review" } },
  catalog_source_used: "supabase",
  pricing_source_diagnostic: null,
  pricing_fallback_reason: null,
};

const sampleChangeRequestRow = {
  id: CHANGE_REQUEST_ID,
  order_id: ORDER_UUID,
  user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  request_type: "dimensions",
  message: "Нужно увеличить глубину до 650 мм.",
  status: "submitted",
  created_at: "2026-07-05T14:00:00.000Z",
  updated_at: "2026-07-05T14:00:00.000Z",
};

function restoreEnvironment() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
  globalThis.fetch = ORIGINAL_FETCH;
  changeRequestStatus = "submitted";
  totalPriceMutations = 0;
  productionMutations = 0;
}

function setRequiredServerEnv() {
  process.env.ADMIN_API_KEY = ADMIN_API_KEY;
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

function installDecisionFetchMock() {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";

    if (url.includes("/rest/v1/orders")) {
      if (method === "PATCH" || method === "PUT") {
        const body = init?.body ? JSON.parse(String(init.body)) : {};
        if ("production_export" in body) productionMutations += 1;
        if ("total_price" in body) totalPriceMutations += 1;
        return jsonResponse({ ...sampleOrderRow, ...body });
      }

      const parsed = new URL(url);
      const idFilter = parsed.searchParams.get("id");
      const orderUuid = idFilter?.startsWith("eq.") ? decodeURIComponent(idFilter.slice(3)) : null;
      if (orderUuid === ORDER_UUID) {
        if (parsed.searchParams.get("select") === "order_id") {
          return jsonResponse({ order_id: ORDER_ID });
        }
        return jsonResponse({ id: ORDER_UUID });
      }
      if (url.includes(`order_id=eq.${encodeURIComponent(ORDER_ID)}`) || url.includes(ORDER_ID)) {
        return jsonResponse(sampleOrderRow);
      }
      return jsonResponse([sampleOrderRow]);
    }

    if (url.includes("/rest/v1/order_change_requests")) {
      const parsed = new URL(url);
      const idFilter = parsed.searchParams.get("id");
      const changeRequestId = idFilter?.startsWith("eq.") ? decodeURIComponent(idFilter.slice(3)) : null;

      if (method === "PATCH") {
        const body = init?.body ? JSON.parse(String(init.body)) : {};
        if (typeof body.status === "string") changeRequestStatus = body.status;
        return jsonResponse({
          ...sampleChangeRequestRow,
          status: changeRequestStatus,
          updated_at: new Date().toISOString(),
        });
      }

      if (changeRequestId === CHANGE_REQUEST_ID) {
        return jsonResponse({ ...sampleChangeRequestRow, status: changeRequestStatus });
      }

      const orderFilter = parsed.searchParams.get("order_id");
      const orderUuid = orderFilter?.startsWith("eq.") ? decodeURIComponent(orderFilter.slice(3)) : null;
      if (orderUuid === ORDER_UUID) {
        return jsonResponse([{ ...sampleChangeRequestRow, status: changeRequestStatus }]);
      }

      return jsonResponse([]);
    }

    if (url.includes("/rest/v1/order_status_events")) {
      return jsonResponse([]);
    }

    if (url.includes("/rest/v1/order_manual_pricing_drafts")) {
      return jsonResponse(null);
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;
}

async function postDecision(decision: "reviewed" | "resolved" | "rejected") {
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();
  await changeRequestDecisionHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: { changeRequestId: CHANGE_REQUEST_ID, decision },
      query: {},
    },
    res,
  );
  return snapshot();
}

test("validateOperationsChangeRequestDecisionBody rejects invalid request id", () => {
  const result = validateOperationsChangeRequestDecisionBody({
    changeRequestId: "bad",
    decision: "resolved",
  });
  assert.equal(result.ok, false);
});

test("operations change request decision POST returns 401 without bearer token", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();
  await changeRequestDecisionHandler(
    {
      method: "POST",
      headers: {},
      body: { changeRequestId: CHANGE_REQUEST_ID, decision: "resolved" },
      query: {},
    },
    res,
  );
  assert.equal(snapshot().statusCode, 401);
});

test("operations change request decision POST resolves submitted request", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installDecisionFetchMock();

  const result = await postDecision("resolved");
  assert.equal(result.statusCode, 200);
  const body = result.body as {
    ok: boolean;
    changeRequest: { status: string; decisionAllowed: boolean };
    review: { totalPrice: number } | null;
  };
  assert.equal(body.ok, true);
  assert.equal(body.changeRequest.status, "resolved");
  assert.equal(body.changeRequest.decisionAllowed, false);
  assert.equal(body.review?.totalPrice, 86400);
  assert.equal(totalPriceMutations, 0);
  assert.equal(productionMutations, 0);
});

test("operations change request decision POST rejects invalid transition", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installDecisionFetchMock();
  changeRequestStatus = "resolved";

  const result = await postDecision("rejected");
  assert.equal(result.statusCode, 409);
});

test("status transition policy allows submitted to reviewed/resolved/rejected", () => {
  assert.equal(isValidOperationsChangeRequestDecisionTransition("submitted", "reviewed"), true);
  assert.equal(isValidOperationsChangeRequestDecisionTransition("submitted", "resolved"), true);
  assert.equal(isValidOperationsChangeRequestDecisionTransition("submitted", "rejected"), true);
  assert.equal(isValidOperationsChangeRequestDecisionTransition("reviewed", "resolved"), true);
  assert.equal(isValidOperationsChangeRequestDecisionTransition("resolved", "rejected"), false);
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
