import assert from "node:assert/strict";

import orderDecisionHandler from "../api/operations/order-decision";
import { createAdminSessionToken } from "../api/_shared/admin-auth";
import {
  INITIAL_ORDER_DOMAIN_STATUS,
  LEGACY_ORDER_STATUS_AFTER_APPROVAL,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
  OPERATIONS_REJECTED_DOMAIN_STATUS,
} from "../api/_shared/order-domain";
import { applyOperationsOrderDecision } from "../api/_shared/operations-order-decision-store";
import { validateOperationsOrderDecisionBody } from "../api/_shared/operations-order-decision-validation";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ADMIN_API_KEY = "test-admin-api-key-with-minimum-length";
const ORDER_ID = "RZ-20260705-1001";
const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

let orderUpdates: Array<Record<string, unknown>> = [];
let auditEvents: Array<Record<string, unknown>> = [];
let productionMutations = 0;
let totalPriceMutations = 0;

function restoreEnvironment() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
  globalThis.fetch = ORIGINAL_FETCH;
  orderUpdates = [];
  auditEvents = [];
  productionMutations = 0;
  totalPriceMutations = 0;
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
  domain_status: INITIAL_ORDER_DOMAIN_STATUS,
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

function installDecisionFetchMock(options: { orderFound?: boolean; domainStatus?: string } = {}) {
  const orderFound = options.orderFound !== false;
  let currentDomainStatus = options.domainStatus ?? INITIAL_ORDER_DOMAIN_STATUS;
  let currentLegacyStatus = "new";
  const row = () => ({ ...sampleOrderRow, domain_status: currentDomainStatus, status: currentLegacyStatus });

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";

    if (url.includes("/rest/v1/orders")) {
      if (!orderFound) return jsonResponse(null, 404);
      if (method === "PATCH" || method === "PUT") {
        const body = init?.body ? JSON.parse(String(init.body)) : {};
        if ("production_export" in body) productionMutations += 1;
        if ("total_price" in body) totalPriceMutations += 1;
        if (typeof body.domain_status === "string") currentDomainStatus = body.domain_status;
        if (typeof body.status === "string") currentLegacyStatus = body.status;
        orderUpdates.push(body);
        return jsonResponse({ ...row(), ...body });
      }
      if (url.includes("select=status%2Cdomain_status") || url.includes("select=status,domain_status")) {
        return jsonResponse({ status: currentLegacyStatus, domain_status: currentDomainStatus });
      }
      if (url.includes(ORDER_ID)) return jsonResponse(row());
      return jsonResponse([row()]);
    }

    if (url.includes("/rest/v1/order_status_events") && method === "POST") {
      const eventBody = init?.body ? JSON.parse(String(init.body)) : {};
      auditEvents.push(eventBody);
      return jsonResponse(eventBody);
    }

    if (url.includes("/rest/v1/order_manual_pricing_drafts")) {
      return jsonResponse(null);
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;
}

test("validateOperationsOrderDecisionBody rejects invalid order id", () => {
  const result = validateOperationsOrderDecisionBody({ orderId: "bad", decision: "approve" });
  assert.equal(result.ok, false);
});

test("validateOperationsOrderDecisionBody rejects invalid decision", () => {
  const result = validateOperationsOrderDecisionBody({ orderId: ORDER_ID, decision: "maybe" });
  assert.equal(result.ok, false);
});

test("validateOperationsOrderDecisionBody rejects reject without reason", () => {
  const result = validateOperationsOrderDecisionBody({ orderId: ORDER_ID, decision: "reject" });
  assert.equal(result.ok, false);
});

test("validateOperationsOrderDecisionBody accepts approve without reason", () => {
  const result = validateOperationsOrderDecisionBody({ orderId: ORDER_ID, decision: "approve", reason: null });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.decision, "approve");
});

test("operations order decision POST returns 401 without bearer token", async () => {
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();
  await orderDecisionHandler(
    { method: "POST", headers: {}, body: { orderId: ORDER_ID, decision: "approve" } },
    res,
  );
  assert.equal(snapshot().statusCode, 401);
});

test("approve updates domain status and legacy status with audit event", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installDecisionFetchMock();

  const applied = await applyOperationsOrderDecision({
    orderId: ORDER_ID,
    decision: "approve",
    reason: null,
  });

  assert.equal(applied.ok, true);
  if (!applied.ok) return;
  assert.equal(applied.result.domainStatus, OPERATIONS_APPROVED_DOMAIN_STATUS);
  assert.equal(applied.result.legacyStatus, LEGACY_ORDER_STATUS_AFTER_APPROVAL);
  assert.equal(orderUpdates.length, 1);
  assert.equal(orderUpdates[0].domain_status, OPERATIONS_APPROVED_DOMAIN_STATUS);
  assert.equal(orderUpdates[0].status, LEGACY_ORDER_STATUS_AFTER_APPROVAL);
  assert.equal(auditEvents.length, 1);
  assert.equal(auditEvents[0].from_status, INITIAL_ORDER_DOMAIN_STATUS);
  assert.equal(auditEvents[0].to_status, OPERATIONS_APPROVED_DOMAIN_STATUS);
  assert.equal(auditEvents[0].changed_by, "operations:approve");
  assert.equal(productionMutations, 0);
  assert.equal(totalPriceMutations, 0);
});

test("reject updates domain status to cancelled with audit event", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installDecisionFetchMock();

  const applied = await applyOperationsOrderDecision({
    orderId: ORDER_ID,
    decision: "reject",
    reason: "Dimensions mismatch",
  });

  assert.equal(applied.ok, true);
  if (!applied.ok) return;
  assert.equal(applied.result.domainStatus, OPERATIONS_REJECTED_DOMAIN_STATUS);
  assert.equal(applied.result.legacyStatus, "new");
  assert.equal(orderUpdates[0].domain_status, OPERATIONS_REJECTED_DOMAIN_STATUS);
  assert.equal(auditEvents[0].changed_by, "operations:reject");
  assert.equal(productionMutations, 0);
  assert.equal(totalPriceMutations, 0);
});

test("operations order decision POST approve returns safe review DTO", async () => {
  setRequiredServerEnv();
  installDecisionFetchMock();
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();

  await orderDecisionHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: { orderId: ORDER_ID, decision: "approve" },
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 200);
  const body = result.body as {
    ok: boolean;
    decision: { domainStatus: string };
    review: {
      orderId: string;
      domainStatus: string;
      approvalActionsImplemented: boolean;
      reviewDecisionAllowed: boolean;
      customerNameMasked: string;
    };
  };

  assert.equal(body.ok, true);
  assert.equal(body.decision.domainStatus, OPERATIONS_APPROVED_DOMAIN_STATUS);
  assert.equal(body.review.orderId, ORDER_ID);
  assert.equal(body.review.approvalActionsImplemented, true);
  assert.equal(body.review.reviewDecisionAllowed, false);
  assert.notEqual(body.review.customerNameMasked, "Иван Петров");

  const serialized = JSON.stringify(body);
  assert.equal(serialized.includes("ivan.petrov@example.com"), false);
  assert.equal(serialized.includes("production_export"), false);
});

test("operations order decision POST reject requires reason", async () => {
  setRequiredServerEnv();
  installDecisionFetchMock();
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();

  await orderDecisionHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: { orderId: ORDER_ID, decision: "reject" },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 400);
});

test("operations order decision POST returns 409 when order is not in review state", async () => {
  setRequiredServerEnv();
  installDecisionFetchMock({ domainStatus: OPERATIONS_APPROVED_DOMAIN_STATUS });
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();

  await orderDecisionHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: { orderId: ORDER_ID, decision: "approve" },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 409);
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
