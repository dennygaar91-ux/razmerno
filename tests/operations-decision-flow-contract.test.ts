import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import workspaceHandler from "../api/operations/workspace";
import orderReviewHandler from "../api/operations/order";
import orderDecisionHandler from "../api/operations/order-decision";
import { createAdminSessionToken } from "../api/_shared/admin-auth";
import {
  INITIAL_ORDER_DOMAIN_STATUS,
  LEGACY_ORDER_STATUS_AFTER_APPROVAL,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
  OPERATIONS_REJECTED_DOMAIN_STATUS,
} from "../api/_shared/order-domain";
import { getOperationsDecisionIneligibleMessage } from "../src/shared/operations/reviewTypes";
import { mapOperationsWorkspaceOrder } from "../api/_shared/operations-workspace-types";

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

function installFlowFetchMock() {
  let currentDomainStatus = INITIAL_ORDER_DOMAIN_STATUS;
  let currentLegacyStatus = "new";
  const row = () => ({ ...sampleOrderRow, domain_status: currentDomainStatus, status: currentLegacyStatus });

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";

    if (url.includes("/rest/v1/orders")) {
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

    if (url.includes("/rest/v1/order_status_events") && method === "GET") {
      return jsonResponse(
        auditEvents.map((event, index) => ({
          id: index + 1,
          order_id: ORDER_ID,
          from_status: event.from_status ?? null,
          to_status: event.to_status,
          changed_by: event.changed_by,
          reason: event.reason ?? null,
          created_at: new Date(Date.now() - index * 1000).toISOString(),
        })),
      );
    }

    if (url.includes("/rest/v1/order_manual_pricing_drafts")) {
      return jsonResponse(null);
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;
}

async function loadWorkspace(token: string) {
  const { res, snapshot } = createMockResponse();
  await workspaceHandler(
    { method: "GET", headers: { authorization: `Bearer ${token}` }, query: { limit: "20" }, body: null },
    res,
  );
  return snapshot();
}

async function loadReview(token: string) {
  const { res, snapshot } = createMockResponse();
  await orderReviewHandler(
    { method: "GET", headers: { authorization: `Bearer ${token}` }, query: { orderId: ORDER_ID }, body: null },
    res,
  );
  return snapshot();
}

async function postDecision(
  token: string,
  body: { orderId: string; decision: "approve" | "reject"; reason?: string | null },
) {
  const { res, snapshot } = createMockResponse();
  await orderDecisionHandler(
    { method: "POST", headers: { authorization: `Bearer ${token}` }, body, query: {} },
    res,
  );
  return snapshot();
}

test("contract: workspace queue exposes review-eligible domain status before decision", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installFlowFetchMock();
  const token = createAdminSessionToken(Date.now());

  const workspace = await loadWorkspace(token);
  assert.equal(workspace.statusCode, 200);
  const workspaceBody = workspace.body as {
    workspace: { orders: Array<{ orderId: string; domainStatus: string }> };
  };
  assert.equal(workspaceBody.workspace.orders[0]?.domainStatus, INITIAL_ORDER_DOMAIN_STATUS);

  const reviewBefore = await loadReview(token);
  assert.equal(reviewBefore.statusCode, 200);
  const reviewBody = reviewBefore.body as {
    review: { domainStatus: string; reviewDecisionAllowed: boolean; totalPrice: number };
  };
  assert.equal(reviewBody.review.domainStatus, INITIAL_ORDER_DOMAIN_STATUS);
  assert.equal(reviewBody.review.reviewDecisionAllowed, true);
});

test("contract: approve flow updates status, audit and history without price/production mutation", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installFlowFetchMock();
  const token = createAdminSessionToken(Date.now());

  const reviewBefore = await loadReview(token);
  const initialTotal = (reviewBefore.body as { review: { totalPrice: number } }).review.totalPrice;

  const decision = await postDecision(token, { orderId: ORDER_ID, decision: "approve", reason: null });
  assert.equal(decision.statusCode, 200);
  const decisionBody = decision.body as {
    decision: { domainStatus: string; legacyStatus: string };
    review: {
      domainStatus: string;
      reviewDecisionAllowed: boolean;
      decisionHistory: Array<{ toStatus: string; changedBy: string; reason: string | null }>;
    };
  };

  assert.equal(decisionBody.decision.domainStatus, OPERATIONS_APPROVED_DOMAIN_STATUS);
  assert.equal(decisionBody.decision.legacyStatus, LEGACY_ORDER_STATUS_AFTER_APPROVAL);
  assert.equal(orderUpdates[0]?.domain_status, OPERATIONS_APPROVED_DOMAIN_STATUS);
  assert.equal(orderUpdates[0]?.status, LEGACY_ORDER_STATUS_AFTER_APPROVAL);
  assert.equal(auditEvents[0]?.changed_by, "operations:approve");
  assert.equal(decisionBody.review.reviewDecisionAllowed, false);
  assert.equal(decisionBody.review.decisionHistory[0]?.toStatus, OPERATIONS_APPROVED_DOMAIN_STATUS);
  assert.equal(decisionBody.review.decisionHistory[0]?.changedBy, "operations:approve");
  assert.equal(productionMutations, 0);
  assert.equal(totalPriceMutations, 0);

  const reviewAfter = await loadReview(token);
  const afterTotal = (reviewAfter.body as { review: { totalPrice: number } }).review.totalPrice;
  assert.equal(afterTotal, initialTotal);
});

test("contract: reject flow requires reason and persists audit/history without price/production mutation", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installFlowFetchMock();
  const token = createAdminSessionToken(Date.now());

  const rejectMissingReason = await postDecision(token, { orderId: ORDER_ID, decision: "reject" });
  assert.equal(rejectMissingReason.statusCode, 400);

  const decision = await postDecision(token, {
    orderId: ORDER_ID,
    decision: "reject",
    reason: "  Dimensions mismatch  ",
  });
  assert.equal(decision.statusCode, 200);
  const decisionBody = decision.body as {
    decision: { domainStatus: string; legacyStatus: string; auditReason: string | null };
    review: {
      domainStatus: string;
      reviewDecisionAllowed: boolean;
      decisionHistory: Array<{ reason: string | null; changedBy: string }>;
    };
  };

  assert.equal(decisionBody.decision.domainStatus, OPERATIONS_REJECTED_DOMAIN_STATUS);
  assert.equal(decisionBody.decision.legacyStatus, "new");
  assert.equal(decisionBody.decision.auditReason, "Dimensions mismatch");
  assert.equal(auditEvents[0]?.reason, "Dimensions mismatch");
  assert.equal(decisionBody.review.decisionHistory[0]?.reason, "Dimensions mismatch");
  assert.equal(decisionBody.review.decisionHistory[0]?.changedBy, "operations:reject");
  assert.equal(decisionBody.review.reviewDecisionAllowed, false);
  assert.equal(productionMutations, 0);
  assert.equal(totalPriceMutations, 0);
});

test("contract: second decision attempt returns 409 and UI guard message matches non-eligible state", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installFlowFetchMock();
  const token = createAdminSessionToken(Date.now());

  const first = await postDecision(token, { orderId: ORDER_ID, decision: "approve", reason: null });
  assert.equal(first.statusCode, 200);

  const second = await postDecision(token, { orderId: ORDER_ID, decision: "approve", reason: null });
  assert.equal(second.statusCode, 409);

  const review = await loadReview(token);
  const reviewBody = review.body as { review: { domainStatus: string; reviewDecisionAllowed: boolean } };
  assert.equal(reviewBody.review.reviewDecisionAllowed, false);
  assert.equal(getOperationsDecisionIneligibleMessage(reviewBody.review.domainStatus), "Решение уже принято");

  const section = readFileSync("src/operations/OperationsOrderDecisionSection.tsx", "utf8");
  assert.match(section, /getOperationsDecisionIneligibleMessage/);
});

test("contract: workspace mapper keeps domain status in safe queue DTO after decision", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installFlowFetchMock();
  const token = createAdminSessionToken(Date.now());

  await postDecision(token, { orderId: ORDER_ID, decision: "approve", reason: null });
  const workspace = await loadWorkspace(token);
  const workspaceBody = workspace.body as {
    workspace: { orders: Array<{ orderId: string; domainStatus: string; status: string }> };
  };

  const queueOrder = workspaceBody.workspace.orders[0];
  assert.equal(queueOrder?.domainStatus, OPERATIONS_APPROVED_DOMAIN_STATUS);
  assert.equal(
    mapOperationsWorkspaceOrder({
      id: queueOrder!.orderId,
      status: queueOrder!.status,
      domainStatus: queueOrder!.domainStatus,
      createdAt: null,
      updatedAt: null,
      product: "Шкаф",
      totalPrice: 86400,
      priceBreakdown: {},
      delivery: { enabled: false, price: 0, addressMasked: "—" },
      assembly: { enabled: false, price: 0, basePrice: 0 },
      pricing: { status: "final", source: "supabase", diagnostic: null, fallbackReason: null },
      customer: { nameMasked: "И•••", phoneMasked: "+7", emailMasked: "i@" },
      email: { manager: "sent", customer: "pending" },
      production: {
        status: "requires-review",
        warnings: 0,
        rejects: 0,
        repairs: 0,
        revision: 0,
        manualAllowed: false,
      },
    }).domainStatus,
    OPERATIONS_APPROVED_DOMAIN_STATUS,
  );
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
