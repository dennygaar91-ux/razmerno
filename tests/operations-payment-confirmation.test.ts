import assert from "node:assert/strict";

import paymentConfirmationHandler from "../api/operations/payment-confirmation";
import { createAdminSessionToken } from "../api/_shared/admin-auth";
import {
  LEGACY_ORDER_STATUS_AFTER_APPROVAL,
  MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
} from "../api/_shared/order-domain";
import { applyOperationsManualPaymentConfirmation } from "../api/_shared/operations-payment-confirmation-store";
import { validateOperationsPaymentConfirmationBody } from "../api/_shared/operations-payment-confirmation-validation";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ADMIN_API_KEY = "test-admin-api-key-with-minimum-length";
const ORDER_ID = "RZ-20260707-1001";
const ORDER_UUID = "660e8400-e29b-41d4-a716-446655440030";
const ORDER_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

let orderUpdates: Array<Record<string, unknown>> = [];
let auditEvents: Array<Record<string, unknown>> = [];
let productionMutations = 0;
let totalPriceMutations = 0;
let notificationInserts: Array<Record<string, unknown>> = [];

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
  notificationInserts = [];
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
  status: LEGACY_ORDER_STATUS_AFTER_APPROVAL,
  domain_status: OPERATIONS_APPROVED_DOMAIN_STATUS,
  user_id: ORDER_USER_ID,
  public_order_number: "RZM_0001",
  total_price: 86400,
  production_export: { review: { status: "requires-review" } },
};

function installPaymentConfirmationFetchMock(options: { domainStatus?: string } = {}) {
  let currentDomainStatus = options.domainStatus ?? OPERATIONS_APPROVED_DOMAIN_STATUS;
  let currentLegacyStatus = LEGACY_ORDER_STATUS_AFTER_APPROVAL;
  const row = () => ({ ...sampleOrderRow, domain_status: currentDomainStatus, status: currentLegacyStatus });

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";

    if (url.includes("/rest/v1/orders")) {
      const parsed = new URL(url);
      const orderIdFilter = parsed.searchParams.get("order_id");
      const selectParam = parsed.searchParams.get("select") ?? "";

      if (orderIdFilter?.startsWith("eq.") && method === "GET") {
        const businessOrderId = decodeURIComponent(orderIdFilter.slice(3));
        if (businessOrderId === ORDER_ID && selectParam.includes("public_order_number")) {
          return jsonResponse({
            id: ORDER_UUID,
            user_id: ORDER_USER_ID,
            public_order_number: "RZM_0001",
          });
        }
      }

      if (method === "PATCH" || method === "PUT") {
        const body = init?.body ? JSON.parse(String(init.body)) : {};
        if ("production_export" in body) productionMutations += 1;
        if ("total_price" in body) totalPriceMutations += 1;
        if (typeof body.domain_status === "string") currentDomainStatus = body.domain_status;
        if (typeof body.status === "string") currentLegacyStatus = body.status;
        orderUpdates.push(body);
        return jsonResponse({ ...row(), ...body });
      }
      if (url.includes("total_price") || url.includes("production_export")) {
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
      if (url.includes(ORDER_ID)) return jsonResponse(row());
      return jsonResponse([row()]);
    }

    if (url.includes("/rest/v1/order_notifications") && method === "POST") {
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      notificationInserts.push(body);
      return jsonResponse(body);
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

test("validateOperationsPaymentConfirmationBody rejects invalid order id", () => {
  const result = validateOperationsPaymentConfirmationBody({ orderId: "bad" });
  assert.equal(result.ok, false);
});

test("validateOperationsPaymentConfirmationBody rejects forbidden fields", () => {
  const result = validateOperationsPaymentConfirmationBody({
    orderId: ORDER_ID,
    totalPrice: 100,
  });
  assert.equal(result.ok, false);
});

test("validateOperationsPaymentConfirmationBody accepts optional note", () => {
  const result = validateOperationsPaymentConfirmationBody({
    orderId: ORDER_ID,
    note: "Оплата подтверждена менеджером",
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.note, "Оплата подтверждена менеджером");
});

test("payment confirmation POST returns 401 without admin auth", async () => {
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();
  await paymentConfirmationHandler(
    { method: "POST", headers: {}, body: { orderId: ORDER_ID } },
    res,
  );
  assert.equal(snapshot().statusCode, 401);
});

test("wrong status rejected with 409", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installPaymentConfirmationFetchMock({ domainStatus: "Проверка" });

  const applied = await applyOperationsManualPaymentConfirmation({ orderId: ORDER_ID, note: null });
  assert.equal(applied.ok, false);
  if (applied.ok) return;
  assert.equal(applied.reason, "invalid_state");
});

test("valid confirmation updates domain status to В работе with audit event", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installPaymentConfirmationFetchMock();

  const applied = await applyOperationsManualPaymentConfirmation({
    orderId: ORDER_ID,
    note: "Оплата подтверждена менеджером",
  });

  assert.equal(applied.ok, true);
  if (!applied.ok) return;
  assert.equal(applied.result.domainStatus, MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS);
  assert.equal(orderUpdates.length, 1);
  assert.equal(orderUpdates[0].domain_status, MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS);
  assert.equal(auditEvents.length, 1);
  assert.equal(auditEvents[0].from_status, OPERATIONS_APPROVED_DOMAIN_STATUS);
  assert.equal(auditEvents[0].to_status, MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS);
  assert.equal(auditEvents[0].changed_by, "operations:payment_confirm");
  assert.equal(auditEvents[0].reason, "Оплата подтверждена менеджером");
  assert.equal(productionMutations, 0);
  assert.equal(totalPriceMutations, 0);
});

test("payment confirmation handler returns safe review DTO", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installPaymentConfirmationFetchMock();
  const token = createAdminSessionToken(Date.now());

  const { res, snapshot } = createMockResponse();
  await paymentConfirmationHandler(
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: { orderId: ORDER_ID, note: "Оплата подтверждена менеджером" },
    },
    res,
  );

  const snap = snapshot();
  assert.equal(snap.statusCode, 200);
  const body = snap.body as { ok: boolean; review: { paymentState: string; paymentConfirmationAllowed: boolean } };
  assert.equal(body.ok, true);
  assert.equal(body.review.paymentState, "confirmed");
  assert.equal(body.review.paymentConfirmationAllowed, false);
  assert.equal(notificationInserts.length, 1);
  assert.equal(notificationInserts[0]?.title, "Оплата подтверждена");
  assert.doesNotMatch(String(notificationInserts[0]?.message ?? ""), /менеджером/i);
});

async function runAll() {
  for (const { name, run } of tests) {
    restoreEnvironment();
    await run();
    console.log(`ok - ${name}`);
  }
  console.log(`${tests.length} operations payment confirmation tests passed.`);
}

runAll().catch((error) => {
  console.error(error);
  process.exit(1);
});
