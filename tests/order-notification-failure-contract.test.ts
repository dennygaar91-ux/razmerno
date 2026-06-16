import assert from "node:assert/strict";

import handler from "../api/orders";
import { validateOrder } from "../api/_shared/order-validation";
import type { OrderRequest } from "../api/_shared/order-types";
import { makeDeliveryOrder, makeValidOrder } from "./fixtures/order-contract-fixture";

type AsyncTest = () => void | Promise<void>;
type FetchRecord = { url: string; method: string; body: string | null };
type ConsoleRecord = { level: "info" | "warn" | "error"; line: string };

const tests: Array<{ name: string; run: AsyncTest }> = [];
const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;
const ORIGINAL_CONSOLE = { info: console.info, warn: console.warn, error: console.error };
let ipCounter = 80;

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

function restoreEnvironment() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
  globalThis.fetch = ORIGINAL_FETCH;
  console.info = ORIGINAL_CONSOLE.info;
  console.warn = ORIGINAL_CONSOLE.warn;
  console.error = ORIGINAL_CONSOLE.error;
}

function setRequiredServerEnv() {
  process.env.ALLOWED_ORIGINS = "http://localhost:5173,https://razmerno.ru";
  process.env.SUPABASE_URL = "https://supabase.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  process.env.RESEND_API_KEY = "test-resend-key";
  process.env.ORDER_MANAGER_EMAIL = "manager@example.test";
  process.env.MAIL_FROM = "Razmerno <noreply@example.test>";
  process.env.ADMIN_API_KEY = "test-admin-key";
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}

function textResponse(text: string, status = 200): Response {
  return new Response(text, { status });
}

function captureConsole(): ConsoleRecord[] {
  const records: ConsoleRecord[] = [];
  console.info = ((line?: unknown) => records.push({ level: "info", line: String(line ?? "") })) as typeof console.info;
  console.warn = ((line?: unknown) => records.push({ level: "warn", line: String(line ?? "") })) as typeof console.warn;
  console.error = ((line?: unknown) => records.push({ level: "error", line: String(line ?? "") })) as typeof console.error;
  return records;
}

function orderPii(order: OrderRequest): string[] {
  return [
    order.customer?.email,
    order.customer?.phone,
    order.customer?.name,
    order.customer?.comment,
    order.delivery?.address,
  ].filter((value): value is string => Boolean(value));
}

function providerFailureText(order: OrderRequest): string {
  return ["provider failed", ...orderPii(order)].join(" | ");
}

function installServerFetchMock(options: {
  failManagerEmail?: boolean;
  failCustomerEmail?: boolean;
  rawProviderError?: string;
  duplicateByOrderId?: boolean;
} = {}): FetchRecord[] {
  const records: FetchRecord[] = [];
  const seenOrderIds = new Set<string>();
  let resendCall = 0;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";
    const body = typeof init?.body === "string" ? init.body : null;
    records.push({ url, method, body });

    if (url.includes("supabase.example.test") && url.includes("/rest/v1/orders")) {
      if (method === "POST") {
        const rows = JSON.parse(body ?? "[]") as Array<{ order_id?: string }> | { order_id?: string };
        const record = Array.isArray(rows) ? rows[0] : rows;
        const orderId = record?.order_id ?? "unknown";
        if (options.duplicateByOrderId && seenOrderIds.has(orderId)) {
          return jsonResponse({ code: "23505", message: "duplicate key value violates unique constraint orders_order_id_key" }, 409);
        }
        seenOrderIds.add(orderId);
        return jsonResponse([], 201);
      }
      return jsonResponse([], 200);
    }

    if (url.includes("api.resend.com/emails")) {
      resendCall += 1;
      if (options.failManagerEmail && resendCall === 1) return textResponse(options.rawProviderError ?? "manager provider failed", 500);
      if (options.failCustomerEmail && resendCall === 2) return textResponse(options.rawProviderError ?? "customer provider failed", 500);
      return jsonResponse({ id: `email-${resendCall}` });
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;

  return records;
}

function makeReq(body: unknown, options: { method?: string; ip?: string; origin?: string } = {}) {
  const ip = options.ip ?? `198.51.100.${ipCounter++}`;
  return {
    method: options.method ?? "POST",
    headers: { origin: options.origin ?? "http://localhost:5173", "user-agent": "notification-contract-test-agent", "x-forwarded-for": ip },
    socket: { remoteAddress: ip },
    body,
  };
}

function makeRes() {
  const state: { statusCode: number | null; json: unknown; ended: boolean; headers: Record<string, string> } = {
    statusCode: null,
    json: undefined,
    ended: false,
    headers: {},
  };
  const res = {
    setHeader(name: string, value: string) {
      state.headers[name] = value;
    },
    status(code: number) {
      state.statusCode = code;
      return {
        json(payload: unknown) { state.json = payload; },
        end() { state.ended = true; },
      };
    },
  };
  return { res, state };
}

async function callOrderHandler(body: unknown, options: { method?: string; ip?: string; origin?: string } = {}) {
  const { res, state } = makeRes();
  await handler(makeReq(body, options), res);
  return state;
}

function assertNoPii(text: string, order: OrderRequest) {
  for (const value of orderPii(order)) {
    assert.ok(!text.includes(value), `PII leaked into log: ${value}`);
  }
}

test("order success contract sends manager and customer notifications", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock();
  const result = await callOrderHandler(makeValidOrder());

  assert.equal(result.statusCode, 200);
  assert.equal((result.json as { ok?: boolean }).ok, true);
  assert.equal((result.json as { email?: { manager?: string; customer?: string } }).email?.manager, "sent");
  assert.equal((result.json as { email?: { manager?: string; customer?: string } }).email?.customer, "sent");
  assert.equal(records.filter((record) => record.url.includes("/rest/v1/orders") && record.method === "POST").length, 1);
  assert.equal(records.filter((record) => record.url.includes("api.resend.com/emails")).length, 2);
});

test("customer email failure keeps persisted order successful and logs safely", async () => {
  setRequiredServerEnv();
  const order = makeDeliveryOrder();
  const logs = captureConsole();
  installServerFetchMock({ failCustomerEmail: true, rawProviderError: providerFailureText(order) });

  const result = await callOrderHandler(order);

  assert.equal(result.statusCode, 200);
  assert.equal((result.json as { ok?: boolean }).ok, true);
  assert.deepEqual((result.json as { email?: unknown }).email, { manager: "sent", customer: "failed", customerError: "logged" });
  const logText = logs.map((item) => item.line).join("\n");
  assert.ok(logText.includes("orders.customer_email_failed"));
  assertNoPii(logText, order);
  assert.ok(!JSON.stringify(result.json).includes("provider failed"));
});

test("manager email failure is a safe API error under current contract", async () => {
  setRequiredServerEnv();
  const order = makeDeliveryOrder();
  const logs = captureConsole();
  installServerFetchMock({ failManagerEmail: true, rawProviderError: providerFailureText(order) });

  const result = await callOrderHandler(order);

  assert.equal(result.statusCode, 502);
  assert.match((result.json as { message?: string }).message ?? "", /менеджеру/i);
  assert.ok(!JSON.stringify(result.json).includes("provider failed"));
  assertNoPii(logs.map((item) => item.line).join("\n"), order);
});

test("duplicate order id is treated as idempotent replay without duplicate notifications", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock({ duplicateByOrderId: true });
  const order = makeValidOrder({ orderId: "RZ-20260616-9101" });

  const first = await callOrderHandler(order, { ip: "198.51.100.201" });
  const second = await callOrderHandler(order, { ip: "198.51.100.202" });

  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  assert.equal((second.json as { ok?: boolean; idempotent?: boolean }).ok, true);
  assert.equal((second.json as { idempotent?: boolean }).idempotent, true);
  assert.equal(records.filter((record) => record.url.includes("/rest/v1/orders") && record.method === "POST").length, 2);
  assert.equal(records.filter((record) => record.url.includes("api.resend.com/emails")).length, 2);
});

test("validation contract rejects required fields and invalid payload shape", async () => {
  setRequiredServerEnv();
  installServerFetchMock();

  assert.equal(validateOrder(makeValidOrder({ customer: { name: "Ivan", phone: "+7 000 000-00-00", email: "" } })), "Укажите email");
  assert.equal(validateOrder(makeValidOrder({ customer: { name: "Ivan", phone: "", email: "client@example.test" } })), "Укажите российский номер в формате +7");
  assert.equal(validateOrder(makeValidOrder({ customer: { name: "Ivan", phone: "+1 000 000 00 00", email: "client@example.test" } })), "Укажите российский номер в формате +7");
  assert.match(validateOrder(makeDeliveryOrder("")) ?? "", /адрес/i);

  const invalidShape = await callOrderHandler(null);
  assert.equal(invalidShape.statusCode, 400);
  assert.match((invalidShape.json as { message?: string }).message ?? "", /формат/i);
});

try {
  for (const item of tests) {
    await item.run();
    console.log(`✓ ${item.name}`);
  }
  console.log(`${tests.length} order notification failure contract tests passed.`);
} finally {
  restoreEnvironment();
}
