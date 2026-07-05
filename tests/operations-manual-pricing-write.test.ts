import assert from "node:assert/strict";

import manualPricingDraftHandler from "../api/operations/manual-pricing-draft";
import { createAdminSessionToken } from "../api/_shared/admin-auth";
import {
  OPERATIONS_MANUAL_PRICING_DRAFT_FORBIDDEN_RESPONSE_KEYS,
  mapOperationsManualPricingDraft,
} from "../api/_shared/operations-manual-pricing-draft-types";
import {
  OPERATIONS_MANUAL_PRICING_MAX_PRICE,
  validateOperationsManualPricingDraftBody,
} from "../api/_shared/operations-manual-pricing-draft-validation";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ADMIN_API_KEY = "test-admin-api-key-with-minimum-length";
const ORDER_ID = "RZ-20260705-1001";
const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

let orderStatusMutations = 0;
let productionStatusMutations = 0;
let savedDraftRows: Array<Record<string, unknown>> = [];

function restoreEnvironment() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
  globalThis.fetch = ORIGINAL_FETCH;
  orderStatusMutations = 0;
  productionStatusMutations = 0;
  savedDraftRows = [];
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

const sampleOrderRow = {
  order_id: ORDER_ID,
  status: "new",
  created_at: "2026-07-05T10:00:00.000Z",
  updated_at: "2026-07-05T11:30:00.000Z",
  product_type: "wardrobe",
  dimensions: { width: 1800, height: 2400, depth: 600 },
  total_price: 86400,
  price_breakdown: { body: 50000, facades: 20000 },
  delivery_enabled: true,
  delivery_price: 1500,
  delivery_address: "Москва, ул. Секретная, 1",
  assembly_enabled: true,
  assembly_price: 7980,
  assembly_base_price: 79800,
  customer_name: "Иван Петров",
  customer_phone: "+7 999 123-45-67",
  customer_email: "ivan.petrov@example.com",
  manager_email_status: "sent",
  customer_email_status: "pending",
  production_export: {
    review: { status: "requires-review" },
    validation: { errors: ["e1"], warnings: ["w1"] },
  },
  catalog_source_used: "supabase",
  pricing_source_diagnostic: null,
  pricing_fallback_reason: null,
};

function installManualPricingDraftFetchMock(options: { orderFound?: boolean } = {}) {
  const orderFound = options.orderFound !== false;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";

    if (url.includes("/rest/v1/orders")) {
      if (!orderFound) return jsonResponse(null, 404);
      if (method === "PATCH" || method === "PUT") {
        orderStatusMutations += 1;
        return jsonResponse(sampleOrderRow);
      }
      if (url.includes(ORDER_ID)) return jsonResponse(sampleOrderRow);
      return jsonResponse([sampleOrderRow]);
    }

    if (url.includes("/rest/v1/order_manual_pricing_drafts")) {
      if (method === "GET" || method === "HEAD") {
        const existing = savedDraftRows.find((row) => row.order_id === ORDER_ID);
        return jsonResponse(existing ?? null);
      }

      if (method === "POST") {
        const body = init?.body ? JSON.parse(String(init.body)) : null;
        const row = {
          id: "draft-id-1",
          order_id: body?.order_id ?? ORDER_ID,
          manual_total_price: body?.manual_total_price ?? 0,
          reason: body?.reason ?? null,
          status: "draft",
          created_by: body?.created_by ?? "admin",
          updated_by: body?.updated_by ?? "admin",
          created_at: "2026-07-05T12:00:00.000Z",
          updated_at: "2026-07-05T12:00:00.000Z",
        };
        savedDraftRows = savedDraftRows.filter((item) => item.order_id !== row.order_id);
        savedDraftRows.push(row);
        return jsonResponse(row);
      }

      if (method === "PATCH") {
        const body = init?.body ? JSON.parse(String(init.body)) : null;
        const existing = savedDraftRows.find((row) => row.order_id === ORDER_ID);
        const row = {
          ...(existing ?? {
            id: "draft-id-1",
            order_id: ORDER_ID,
            created_by: "admin",
            created_at: "2026-07-05T12:00:00.000Z",
          }),
          manual_total_price: body?.manual_total_price ?? existing?.manual_total_price,
          reason: body?.reason ?? existing?.reason ?? null,
          status: "draft",
          updated_by: body?.updated_by ?? "admin",
          updated_at: "2026-07-05T12:30:00.000Z",
        };
        savedDraftRows = savedDraftRows.filter((item) => item.order_id !== ORDER_ID);
        savedDraftRows.push(row);
        return jsonResponse(row);
      }
    }

    if (url.includes("production") && (method === "PATCH" || method === "PUT")) {
      productionStatusMutations += 1;
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;
}

test("manual pricing draft validation rejects invalid payloads", () => {
  assert.equal(validateOperationsManualPricingDraftBody(null).ok, false);
  assert.equal(validateOperationsManualPricingDraftBody({ orderId: "bad", manualTotalPrice: 100 }).ok, false);
  assert.equal(validateOperationsManualPricingDraftBody({ orderId: ORDER_ID, manualTotalPrice: 0 }).ok, false);
  assert.equal(
    validateOperationsManualPricingDraftBody({ orderId: ORDER_ID, manualTotalPrice: OPERATIONS_MANUAL_PRICING_MAX_PRICE + 1 }).ok,
    false,
  );
  assert.equal(
    validateOperationsManualPricingDraftBody({ orderId: ORDER_ID, manualTotalPrice: 100, productionExport: {} }).ok,
    false,
  );
});

test("manual pricing draft save returns 401 without bearer token", async () => {
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();

  await manualPricingDraftHandler(
    {
      method: "POST",
      headers: {},
      query: {},
      body: { orderId: ORDER_ID, manualTotalPrice: 123000 },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 401);
});

test("manual pricing draft save returns 400 for invalid payload", async () => {
  setRequiredServerEnv();
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();

  await manualPricingDraftHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      query: {},
      body: { orderId: ORDER_ID, manualTotalPrice: -1 },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 400);
});

test("manual pricing draft save returns 404 for missing order", async () => {
  setRequiredServerEnv();
  installManualPricingDraftFetchMock({ orderFound: false });
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();

  await manualPricingDraftHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      query: {},
      body: { orderId: ORDER_ID, manualTotalPrice: 123000, reason: "Manual review adjustment" },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 404);
});

test("authorized manual pricing draft save persists draft and returns safe DTO only", async () => {
  setRequiredServerEnv();
  installManualPricingDraftFetchMock();
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();

  await manualPricingDraftHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      query: {},
      body: { orderId: ORDER_ID, manualTotalPrice: 123000, reason: "Manual review adjustment" },
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 200);

  const body = result.body as {
    ok: boolean;
    manualPricingDraft: {
      orderId: string;
      manualTotalPrice: number;
      manualTotalPriceLabel: string;
      reason: string | null;
      status: "draft";
      updatedAt: string | null;
    };
  };

  assert.equal(body.ok, true);
  assert.equal(body.manualPricingDraft.orderId, ORDER_ID);
  assert.equal(body.manualPricingDraft.manualTotalPrice, 123000);
  assert.match(body.manualPricingDraft.manualTotalPriceLabel, /123/);
  assert.equal(body.manualPricingDraft.reason, "Manual review adjustment");
  assert.equal(body.manualPricingDraft.status, "draft");

  const serialized = JSON.stringify(body);
  for (const key of OPERATIONS_MANUAL_PRICING_DRAFT_FORBIDDEN_RESPONSE_KEYS) {
    assert.equal(serialized.includes(`"${key}"`), false, `forbidden key leaked: ${key}`);
  }
  assert.equal(serialized.includes("ivan.petrov@example.com"), false);
  assert.equal(serialized.includes("production_export"), false);
  assert.equal(serialized.includes("price_breakdown"), false);
  assert.equal(savedDraftRows.length, 1);
  assert.equal(orderStatusMutations, 0);
  assert.equal(productionStatusMutations, 0);
});

test("manual pricing draft mapper returns safe read model", () => {
  const draft = mapOperationsManualPricingDraft({
    id: "draft-id-1",
    order_id: ORDER_ID,
    manual_total_price: 123000,
    reason: "note",
    status: "draft",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2026-07-05T12:00:00.000Z",
    updated_at: "2026-07-05T12:00:00.000Z",
  });

  assert.equal(draft.orderId, ORDER_ID);
  assert.equal(draft.manualTotalPrice, 123000);
  assert.equal(draft.status, "draft");
  assert.match(draft.manualTotalPriceLabel, /123/);
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
