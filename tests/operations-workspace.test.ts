import assert from "node:assert/strict";

import workspaceHandler from "../api/operations/workspace";
import { createAdminSessionToken } from "../api/_shared/admin-auth";
import { mapOrderRow } from "../api/_shared/admin-orders";
import { buildOperationsWorkspaceFromStore } from "../api/_shared/operations-workspace";
import {
  OPERATIONS_WORKSPACE_FORBIDDEN_RESPONSE_KEYS,
  buildOperationsWorkspace,
  mapOperationsWorkspaceOrder,
} from "../api/_shared/operations-workspace-types";
import type { AdminOrderSummary } from "../api/_shared/admin-orders";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ADMIN_API_KEY = "test-admin-api-key-with-minimum-length";
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

function installOperationsOrdersFetchMock() {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes("/rest/v1/orders")) {
      return jsonResponse([
        {
          order_id: "RZ-20260705-1001",
          status: "new",
          domain_status: "Проверка",
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
          production_export: { review: { status: "requires-review" }, rules: { autoWarnings: ["w1"] } },
          catalog_source_used: "supabase",
          pricing_source_diagnostic: null,
          pricing_fallback_reason: null,
        },
      ]);
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;
}

const sampleAdminSummary: AdminOrderSummary = {
  id: "RZ-20260705-1001",
  status: "new",
  domainStatus: "Проверка",
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

test("operations workspace mapper exposes only safe queue fields", () => {
  assert.deepEqual(mapOperationsWorkspaceOrder(sampleAdminSummary), {
    orderId: "RZ-20260705-1001",
    status: "new",
    domainStatus: "Проверка",
    createdAt: "2026-07-05T10:00:00.000Z",
    updatedAt: "2026-07-05T11:30:00.000Z",
    customerNameMasked: "И•••",
    productSummary: "Шкаф 1800×2400×600",
    totalPrice: 86400,
    productionStatus: "requires-review",
  });
});

test("buildOperationsWorkspace computes stats and excludes unsafe keys", () => {
  const workspace = buildOperationsWorkspace([sampleAdminSummary]);
  assert.equal(workspace.stats.total, 1);
  assert.equal(workspace.orders.length, 1);

  const serialized = JSON.stringify(workspace);
  for (const key of OPERATIONS_WORKSPACE_FORBIDDEN_RESPONSE_KEYS) {
    assert.equal(serialized.includes(`"${key}"`), false, `forbidden key leaked: ${key}`);
  }
  assert.equal(serialized.includes("ivan.petrov@example.com"), false);
  assert.equal(serialized.includes("+7 999 123-45-67"), false);
  assert.equal(serialized.includes("Иван Петров"), false);
});

test("mapOrderRow masks raw customer fields in admin summary", () => {
  const summary = mapOrderRow({
    order_id: "RZ-20260705-1001",
    status: "new",
    created_at: "2026-07-05T10:00:00.000Z",
    updated_at: "2026-07-05T11:30:00.000Z",
    product_type: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    total_price: 86400,
    price_breakdown: { body: 50000 },
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
    production_export: { review: { status: "requires-review" } },
  });

  const serialized = JSON.stringify(summary);
  assert.equal(serialized.includes("ivan.petrov@example.com"), false);
  assert.equal(serialized.includes("Иван Петров"), false);
  assert.equal(summary.updatedAt, "2026-07-05T11:30:00.000Z");
});

test("operations workspace GET returns 401 without bearer token", async () => {
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();
  await workspaceHandler({ method: "GET", headers: {}, body: null }, res);
  const result = snapshot();
  assert.equal(result.statusCode, 401);
  assert.deepEqual(result.body, { ok: false, message: "Unauthorized" });
});

test("operations workspace GET returns safe read model for authorized admin session", async () => {
  setRequiredServerEnv();
  installOperationsOrdersFetchMock();
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();

  await workspaceHandler(
    {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
      query: { limit: "20" },
      body: null,
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 200);
  const body = result.body as {
    ok: boolean;
    workspace: {
      orders: Array<{
        orderId: string;
        domainStatus: string;
        customerNameMasked: string;
        productSummary: string;
        updatedAt: string | null;
      }>;
      stats: { total: number };
    };
  };

  assert.equal(body.ok, true);
  assert.equal(body.workspace.stats.total, 1);
  assert.equal(body.workspace.orders[0]?.orderId, "RZ-20260705-1001");
  assert.equal(body.workspace.orders[0]?.domainStatus, "Проверка");
  assert.equal(body.workspace.orders[0]?.updatedAt, "2026-07-05T11:30:00.000Z");
  assert.notEqual(body.workspace.orders[0]?.customerNameMasked, "Иван Петров");
  assert.match(body.workspace.orders[0]?.customerNameMasked ?? "", /[•*]/);

  const serialized = JSON.stringify(body.workspace);
  assert.equal(serialized.includes("customer_name"), false);
  assert.equal(serialized.includes("production_export"), false);
  assert.equal(serialized.includes("price_breakdown"), false);
});

test("buildOperationsWorkspaceFromStore loads orders through service role API path", async () => {
  setRequiredServerEnv();
  installOperationsOrdersFetchMock();

  const built = await buildOperationsWorkspaceFromStore(10);
  assert.equal(built.ok, true);
  if (!built.ok) return;
  assert.equal(built.workspace.orders.length, 1);
  assert.equal(built.workspace.orders[0]?.orderId, "RZ-20260705-1001");
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
