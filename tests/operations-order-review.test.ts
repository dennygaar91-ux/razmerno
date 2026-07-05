import assert from "node:assert/strict";

import orderReviewHandler from "../api/operations/order";
import { createAdminSessionToken } from "../api/_shared/admin-auth";
import { buildOperationsOrderReviewByOrderId } from "../api/_shared/operations-order-review";
import {
  OPERATIONS_ORDER_REVIEW_FORBIDDEN_RESPONSE_KEYS,
  buildOperationsOrderReview,
} from "../api/_shared/operations-order-review-types";
import type { AdminOrderSummary } from "../api/_shared/admin-orders";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ADMIN_API_KEY = "test-admin-api-key-with-minimum-length";
const ORDER_ID = "RZ-20260705-1001";
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
    rules: { autoRejects: [], autoWarnings: ["aw1"] },
  },
  catalog_source_used: "supabase",
  pricing_source_diagnostic: null,
  pricing_fallback_reason: null,
};

function installOrderReviewFetchMock(options: { orderFound?: boolean } = {}) {
  const orderFound = options.orderFound !== false;

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes("/rest/v1/orders")) {
      if (!orderFound) return jsonResponse(null, 404);
      if (url.includes(`order_id=eq.${encodeURIComponent(ORDER_ID)}`) || url.includes(ORDER_ID)) {
        return jsonResponse(sampleOrderRow);
      }
      return jsonResponse([sampleOrderRow]);
    }

    if (url.includes("/rest/v1/order_manual_pricing_drafts")) {
      return jsonResponse(null);
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;
}

const sampleAdminSummary: AdminOrderSummary = {
  id: ORDER_ID,
  status: "new",
  createdAt: "2026-07-05T10:00:00.000Z",
  updatedAt: "2026-07-05T11:30:00.000Z",
  product: "Шкаф 1800×2400×600",
  totalPrice: 86400,
  priceBreakdown: { body: 50000 },
  delivery: { enabled: true, price: 1500, addressMasked: "Адрес скрыт" },
  assembly: { enabled: true, price: 7980, basePrice: 79800 },
  pricing: {
    status: "final server snapshot",
    source: "supabase",
    diagnostic: null,
    fallbackReason: null,
  },
  customer: {
    nameMasked: "И•••",
    phoneMasked: "+7 *** ***-67",
    emailMasked: "i***@example.com",
  },
  email: { manager: "sent", customer: "pending" },
  production: {
    status: "requires-review",
    warnings: 1,
    rejects: 0,
    repairs: 0,
    revision: 0,
    manualAllowed: false,
  },
};

test("operations order review exposes safe manual review fields only", () => {
  const review = buildOperationsOrderReview(sampleAdminSummary, sampleOrderRow.production_export);
  assert.equal(review.orderId, ORDER_ID);
  assert.equal(review.approvalActionsImplemented, false);
  assert.equal(review.manualPricingDraft, null);
  assert.equal(review.productionReviewStatus, "requires-review");
  assert.match(review.priceBreakdownSummary, /stored breakdown keys/);
  assert.notEqual(review.customerNameMasked, "Иван Петров");

  const serialized = JSON.stringify(review);
  for (const key of OPERATIONS_ORDER_REVIEW_FORBIDDEN_RESPONSE_KEYS) {
    assert.equal(serialized.includes(`"${key}"`), false, `forbidden key leaked: ${key}`);
  }
  assert.equal(serialized.includes("ivan.petrov@example.com"), false);
  assert.equal(serialized.includes("production_export"), false);
});

test("operations order review GET returns 401 without bearer token", async () => {
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();
  await orderReviewHandler({ method: "GET", headers: {}, query: { orderId: ORDER_ID }, body: null }, res);
  const result = snapshot();
  assert.equal(result.statusCode, 401);
});

test("operations order review GET returns 404 for missing order", async () => {
  setRequiredServerEnv();
  installOrderReviewFetchMock({ orderFound: false });
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (url.includes("/rest/v1/orders")) return jsonResponse(null, 404);
    return jsonResponse({ ok: true });
  }) as typeof fetch;

  await orderReviewHandler(
    {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
      query: { orderId: ORDER_ID },
      body: null,
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 404);
});

test("operations order review GET returns safe review read model for authorized admin", async () => {
  setRequiredServerEnv();
  installOrderReviewFetchMock();
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

  const result = snapshot();
  assert.equal(result.statusCode, 200);
  const body = result.body as {
    ok: boolean;
    review: {
      orderId: string;
      approvalActionsImplemented: false;
      customerNameMasked: string;
      productionReviewStatus: string;
      manualPricingDraft: unknown;
    };
  };

  assert.equal(body.ok, true);
  assert.equal(body.review.orderId, ORDER_ID);
  assert.equal(body.review.approvalActionsImplemented, false);
  assert.equal(body.review.productionReviewStatus, "requires-review");
  assert.equal(body.review.manualPricingDraft, null);
  assert.notEqual(body.review.customerNameMasked, "Иван Петров");
});

test("buildOperationsOrderReviewByOrderId loads review through service role path", async () => {
  setRequiredServerEnv();
  installOrderReviewFetchMock();

  const built = await buildOperationsOrderReviewByOrderId(ORDER_ID);
  assert.equal(built.ok, true);
  if (!built.ok) return;
  assert.equal(built.review.orderId, ORDER_ID);
  assert.equal(built.review.approvalActionsImplemented, false);
  assert.equal(built.review.manualPricingDraft, null);
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
