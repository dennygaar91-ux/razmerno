import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";

import handler from "../api/orders";
import { mapOrderRow, mapStatusEvent, isAdminOrderStatus } from "../api/_shared/admin-orders";
import { toOrderDbInsert } from "../api/_shared/order-db";
import { calculateServerPrice } from "../api/_shared/server-price";
import { validateOrder } from "../api/_shared/order-validation";
import { insertOrderRecord, updateOrderEmailStatus } from "../api/_shared/supabase-orders";
import type { OrderRequest } from "../api/_shared/order-types";
import { calculateCatalogPrice, type CatalogPriceInput } from "../src/pricing/engine";
import { buildConstructorMaterialPricingContext } from "../src/pricing/materialPricing";
import type { MaterialToken } from "../src/shared/materials/materialCatalog";
import { submitOrder, validateCustomer } from "../src/shared/lib/order";
import {
  makeAssemblyOrder,
  makeDeliveryOrder,
  makeValidOrder,
  REQUIRED_ORDER_DB_COLUMNS,
} from "./fixtures/order-contract-fixture";

type AsyncTest = () => void | Promise<void>;
type FetchRecord = {
  url: string;
  method: string;
  body: string | null;
};

const tests: Array<{ name: string; run: AsyncTest }> = [];
const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;
let ipCounter = 10;

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

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

function clearRequiredServerEnv() {
  delete process.env.ALLOWED_ORIGINS;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.RESEND_API_KEY;
  delete process.env.ORDER_MANAGER_EMAIL;
  delete process.env.MAIL_FROM;
  delete process.env.ADMIN_API_KEY;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function textResponse(text: string, status = 200): Response {
  return new Response(text, { status });
}

function installCheckoutFetchMock(response: Response): FetchRecord[] {
  const records: FetchRecord[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    records.push({
      url,
      method: init?.method ?? "GET",
      body: typeof init?.body === "string" ? init.body : null,
    });
    return response.clone();
  }) as typeof fetch;
  return records;
}

function installServerFetchMock(options: {
  failSupabaseInsert?: boolean;
  failManagerEmail?: boolean;
  failCustomerEmail?: boolean;
} = {}): FetchRecord[] {
  const records: FetchRecord[] = [];
  let resendCall = 0;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";
    records.push({
      url,
      method,
      body: typeof init?.body === "string" ? init.body : null,
    });

    if (url.includes("supabase.example.test") && url.includes("/rest/v1/orders")) {
      if (options.failSupabaseInsert && method === "POST") {
        return jsonResponse({ message: "insert failed" }, 500);
      }
      return jsonResponse([], method === "POST" ? 201 : 200);
    }

    if (url.includes("api.resend.com/emails")) {
      resendCall += 1;
      if (options.failManagerEmail && resendCall === 1) {
        return textResponse("manager email failed", 500);
      }
      if (options.failCustomerEmail && resendCall === 2) {
        return textResponse("customer email failed", 500);
      }
      return jsonResponse({ id: `email-${resendCall}` });
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;

  return records;
}

function makeReq(body: OrderRequest, options: { method?: string; ip?: string; origin?: string } = {}) {
  return {
    method: options.method ?? "POST",
    headers: {
      origin: options.origin ?? "http://localhost:5173",
      "user-agent": "contract-test-agent",
      "x-forwarded-for": options.ip ?? `198.51.100.${ipCounter++}`,
    },
    socket: { remoteAddress: options.ip ?? `198.51.100.${ipCounter++}` },
    body,
  };
}

function makeRes() {
  const state: {
    statusCode: number | null;
    json: unknown;
    ended: boolean;
    headers: Record<string, string>;
  } = {
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
        json(payload: unknown) {
          state.json = payload;
        },
        end() {
          state.ended = true;
        },
      };
    },
  };

  return { res, state };
}

const pricingParityBaseInput: CatalogPriceInput = {
  type: "wardrobe",
  dimensions: { width: 1800, height: 2200, depth: 600 },
  sections: 2,
  filling: { shelves: 4, drawers: 0, hangingRod: true },
  facadeStyleMultiplier: 1,
  hardwareLevel: "base",
};

function compareClientServerPricing(order: OrderRequest, clientInput: CatalogPriceInput = pricingParityBaseInput) {
  const client = calculateCatalogPrice(clientInput);
  const server = calculateServerPrice(order);

  return {
    client,
    server,
    delta: server.total - client.total,
  };
}

function withMaterialPricingInput(input: CatalogPriceInput, materials: { bodyId: MaterialToken; facadeId: MaterialToken }): CatalogPriceInput {
  const context = buildConstructorMaterialPricingContext({
    bodyMaterialId: materials.bodyId,
    facadeMaterialId: materials.facadeId,
  });

  return {
    ...input,
    bodyProducer: context.body.producer as CatalogPriceInput["bodyProducer"],
    bodyArticle: context.body.article,
    bodyThicknessMm: context.body.thicknessMm,
    facadeProducer: context.facade.producer as CatalogPriceInput["facadeProducer"],
    facadeArticle: context.facade.article,
    facadeThicknessMm: context.facade.thicknessMm,
    facadeMaterialKind: context.facade.materialKind === "mdf" ? "mdf" : "ldsp",
  };
}

async function callOrderHandler(body: OrderRequest, options: { method?: string; ip?: string; origin?: string } = {}) {
  const { res, state } = makeRes();
  await handler(makeReq(body, options), res);
  return state;
}

test("legacy checkout submit hook still delegates payload and validation", () => {
  const hook = readFileSync("src/configurator/checkout/useCheckoutSubmit.ts", "utf8");
  const drawer = readFileSync("src/configurator/CheckoutDrawer.tsx", "utf8");

  assert.ok(hook.includes("export function useCheckoutSubmit"));
  assert.ok(hook.includes("submitOrder(buildCheckoutOrderPayload"));
  assert.ok(hook.includes("validateCustomer"));
  assert.ok(hook.includes("validateDelivery"));
  assert.ok(hook.includes("validateAssembly"));
  assert.ok(drawer.includes("useCheckoutSubmit"));
  assert.ok(!drawer.includes("submitOrder("));
  assert.ok(!drawer.includes("buildCheckoutOrderPayload("));
});

test("active Constructor3D submit hook keeps cooldown, validation and no-reset contracts", () => {
  const hook = readFileSync("src/static-pages/constructor/hooks/useConstructorSubmit.ts", "utf8");

  assert.ok(hook.includes("RESUBMIT_COOLDOWN_MS = 30_000"));
  assert.ok(hook.includes("if (isCooldownActive)"));
  assert.ok(hook.includes('onStepChange("checkout")'));
  assert.ok(hook.includes("validateCustomer(snapshot.contact)"));
  assert.ok(hook.includes("validateDelivery(snapshot.deliveryEnabled, snapshot.deliveryAddress)"));
  assert.ok(hook.includes("buildOrderPayloadFromConstructor(snapshot, quote"));
  assert.ok(hook.includes('source: "constructor-store-adapter"'));
  assert.ok(hook.includes("onDraftSave()"));
  assert.ok(!hook.includes("constructorStore.reset("));
});

test("checkout validation rejects missing email and missing RU phone", () => {
  assert.deepEqual(validateCustomer({ name: "Иван", phone: "+7 999 111-22-33", email: "" }), {
    email: "Укажите email",
  });
  assert.deepEqual(validateCustomer({ name: "Иван", phone: "123", email: "client@example.com" }), {
    phone: "Укажите российский номер в формате +7",
  });
});

test("API validation rejects missing email and missing phone", () => {
  const withoutEmail = makeValidOrder({ customer: { name: "Иван", phone: "+7 999 111-22-33", email: "" } });
  const withoutPhone = makeValidOrder({ customer: { name: "Иван", phone: "123", email: "client@example.com" } });

  assert.equal(validateOrder(withoutEmail), "Укажите email");
  assert.equal(validateOrder(withoutPhone), "Укажите российский номер в формате +7");
});

test("delivery and assembly enabled payloads pass validation when required fields are present", () => {
  assert.equal(validateOrder(makeDeliveryOrder()), null);
  assert.equal(validateOrder(makeAssemblyOrder()), null);

  const deliveryMissingAddress = makeDeliveryOrder("");
  assert.match(validateOrder(deliveryMissingAddress) ?? "", /адрес/i);

  const assemblyInvalidRate = makeValidOrder({
    assembly: {
      enabled: true,
      price: 20_000,
      rate: 0.2,
      basePrice: 100_000,
    },
  });
  assert.match(validateOrder(assemblyInvalidRate) ?? "", /сборк|некоррект/i);
});

test("P0-13 pricing parity fixture: default baseline currently matches client and server totals", () => {
  const { client, server, delta } = compareClientServerPricing(makeValidOrder());

  assert.equal(delta, 0);
  assert.equal(server.total, client.total);
  assert.equal(server.body, client.body);
  assert.equal(server.facades, client.facades);
  assert.equal(server.hardware, client.hardware);
});

test("P0-13 pricing parity fixture: body material change matches client and server totals", () => {
  const materials = {
    bodyId: "ldsp-egger-u780-seryy-monumentalnyy-st9",
    facadeId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  } satisfies { bodyId: MaterialToken; facadeId: MaterialToken };
  const { client, server, delta } = compareClientServerPricing(
    makeValidOrder({
      materials: {
        bodyId: materials.bodyId,
        facadeId: materials.facadeId,
        facadeKind: "ldsp",
        backPanelId: "white-matt",
        backPanelKind: "hdf",
      },
    }),
    withMaterialPricingInput(pricingParityBaseInput, materials),
  );

  assert.equal(delta, 0);
  assert.equal(server.total, client.total);
  assert.equal(server.body, client.body);
  assert.equal(server.facades, client.facades);
});

test("P0-13 pricing parity fixture: facade material change matches client and server totals", () => {
  const materials = {
    bodyId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeId: "mdf-egger-r010-seryy-grafitovyy-ms",
  } satisfies { bodyId: MaterialToken; facadeId: MaterialToken };
  const { client, server, delta } = compareClientServerPricing(
    makeValidOrder({
      materials: {
        bodyId: materials.bodyId,
        facadeId: materials.facadeId,
        facadeKind: "mdf",
        backPanelId: "white-matt",
        backPanelKind: "hdf",
      },
    }),
    withMaterialPricingInput(pricingParityBaseInput, materials),
  );

  assert.equal(delta, 0);
  assert.equal(server.total, client.total);
  assert.equal(server.body, client.body);
  assert.equal(server.facades, client.facades);
});

test("P0-13 pricing parity fixture: no-handle multiplier currently matches client and server", () => {
  const baseline = compareClientServerPricing(makeValidOrder());
  const { client, server, delta } = compareClientServerPricing(
    makeValidOrder({ style: { facadeStyleId: "no-handle", hardwareId: "base" } }),
    {
      ...pricingParityBaseInput,
      facadeStyleMultiplier: 1.15,
    },
  );

  assert.equal(delta, 0);
  assert.equal(server.total, client.total);
  assert.ok(server.facades > baseline.server.facades);
  assert.ok(server.hardware > baseline.server.hardware);
});

test("P0-13 pricing parity fixture: assembly base is added consistently on the server", () => {
  const baseline = compareClientServerPricing(makeValidOrder());
  const { client, server, delta } = compareClientServerPricing(
    makeValidOrder({
      assembly: {
        enabled: true,
        price: 0,
        rate: 0.1,
        basePrice: 0,
      },
    }),
  );

  assert.equal(client.total, baseline.client.total);
  assert.equal(server.assembly, Math.round(baseline.server.total * 0.1));
  assert.equal(delta, server.assembly);
  assert.equal(server.total, baseline.server.total + server.assembly);
});

test("checkout submit sends API payload with idempotency key and returns success", async () => {
  const records = installCheckoutFetchMock(jsonResponse({ ok: true, orderId: "RZ-20260615-7777" }));

  const result = await submitOrder(makeValidOrder() as Parameters<typeof submitOrder>[0]);

  assert.deepEqual(result, { ok: true, orderId: "RZ-20260615-7777" });
  assert.equal(records.length, 1);
  assert.equal(records[0]?.url, "/api/orders");
  assert.equal(records[0]?.method, "POST");

  const body = JSON.parse(records[0]?.body ?? "{}");
  assert.match(body.orderId, /^RZ-\d{8}-\d{4}$/);
  assert.equal(body.source, "constructor-store-adapter");
  assert.equal(body.customer.email, "client@example.com");
  assert.deepEqual(body.utm, {});
});

test("checkout submit returns validation/API failure without throwing", async () => {
  installCheckoutFetchMock(jsonResponse({ ok: false, message: "Не удалось сохранить заявку. Попробуйте позже." }, 502));

  const result = await submitOrder(makeValidOrder() as Parameters<typeof submitOrder>[0]);

  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /сохранить заявку/i);
});

test("Supabase env-missing repository contract skips writes deterministically", async () => {
  clearRequiredServerEnv();
  const record = toOrderDbInsert({
    orderId: "RZ-20260615-2001",
    body: makeValidOrder(),
    userAgent: "contract-test-agent",
    clientIp: "203.0.113.10",
  });

  assert.deepEqual(await insertOrderRecord(record), {
    ok: true,
    skipped: true,
    reason: "supabase-env-missing",
  });
  assert.deepEqual(await updateOrderEmailStatus(record.order_id, { customer_email_status: "sent" }), {
    ok: true,
    skipped: true,
    reason: "supabase-env-missing",
  });
});

test("Supabase DB insert contract maps order payload without leaking raw client IP", () => {
  const record = toOrderDbInsert({
    orderId: "RZ-20260615-2002",
    body: makeAssemblyOrder(),
    userAgent: "contract-test-agent",
    clientIp: "203.0.113.42",
  });

  assert.equal(record.order_id, "RZ-20260615-2002");
  assert.equal(record.status, "new");
  assert.equal(record.source, "constructor-store-adapter");
  assert.equal(record.customer_email, "client@example.com");
  assert.equal(record.assembly_enabled, true);
  assert.equal(record.assembly_rate, 0.1);
  assert.equal(record.manager_email_status, "pending");
  assert.equal(record.customer_email_status, "pending");
  assert.equal(record.client_ip_hash, crypto.createHash("sha256").update("203.0.113.42").digest("hex"));
  assert.notEqual(record.client_ip_hash, "203.0.113.42");
});

test("Supabase schema contract contains required orders columns, RLS and status events", () => {
  const baseSchema = readFileSync("db/orders.sql", "utf8");
  const deploySchema = readFileSync("supabase/deploy/deploy-all.sql", "utf8");
  const schema = `${baseSchema}\n${deploySchema}`;

  for (const column of REQUIRED_ORDER_DB_COLUMNS) {
    assert.ok(schema.includes(column), `Missing orders schema column: ${column}`);
  }

  assert.ok(baseSchema.includes("alter table public.orders enable row level security"));
  assert.ok(baseSchema.includes('create policy "orders_no_public_access"'));
  assert.ok(deploySchema.includes("create table if not exists public.order_status_events"));
  assert.ok(deploySchema.includes("order_status_events_order_id_idx"));
});

test("Supabase read/status repository contracts map admin rows and status transitions", () => {
  const row = mapOrderRow({
    order_id: "RZ-20260615-3001",
    status: "new",
    created_at: "2026-06-15T12:00:00.000Z",
    product_type: "wardrobe",
    dimensions: { width: 1800, height: 2200, depth: 600 },
    total_price: 79_800,
    delivery_enabled: true,
    delivery_price: 6000,
    delivery_address: "Москва, ул. Тверская, 1",
    assembly_enabled: true,
    assembly_price: 7980,
    customer_name: "Иван Петров",
    customer_phone: "+7 999 111-22-33",
    customer_email: "client@example.com",
    manager_email_status: "sent",
    customer_email_status: "failed",
    production_export: {
      review: { status: "requires-review", manualChangesAllowed: true },
      rules: { autoWarnings: [{}], autoRejects: [], autoRepairs: [{}] },
      revisions: [{ version: 2 }],
    },
  } as Parameters<typeof mapOrderRow>[0]);

  assert.equal(row.id, "RZ-20260615-3001");
  assert.equal(row.product, "Шкаф 1800×2200×600");
  assert.equal(row.delivery.addressMasked, "Адрес скрыт");
  assert.equal(row.customer.emailMasked, "c***@example.com");
  assert.equal(row.email.manager, "sent");
  assert.equal(row.email.customer, "failed");
  assert.equal(row.production.warnings, 1);
  assert.equal(row.production.repairs, 1);
  assert.equal(row.production.revision, 2);
  assert.equal(row.production.manualAllowed, true);

  assert.equal(isAdminOrderStatus("new"), true);
  assert.equal(isAdminOrderStatus("in_progress"), true);
  assert.equal(isAdminOrderStatus("done"), true);
  assert.equal(isAdminOrderStatus("cancelled"), false);

  assert.deepEqual(mapStatusEvent({
    id: 1,
    order_id: "RZ-20260615-3001",
    from_status: "new",
    to_status: "done",
    changed_by: "admin",
    created_at: "2026-06-15T12:05:00.000Z",
  }), {
    id: 1,
    orderId: "RZ-20260615-3001",
    fromStatus: "new",
    toStatus: "done",
    changedBy: "admin",
    createdAt: "2026-06-15T12:05:00.000Z",
  });
});

test("API order flow creates order, persists it and sends manager/customer notifications", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock();

  const result = await callOrderHandler(makeValidOrder());

  assert.equal(result.statusCode, 200);
  assert.equal((result.json as { ok?: boolean }).ok, true);
  assert.equal((result.json as { email?: { manager?: string; customer?: string } }).email?.manager, "sent");
  assert.equal((result.json as { email?: { manager?: string; customer?: string } }).email?.customer, "sent");
  assert.ok(records.some((record) => record.url.includes("/rest/v1/orders") && record.method === "POST"));
  assert.equal(records.filter((record) => record.url.includes("api.resend.com/emails")).length, 2);
});

test("API order flow stays successful when customer notification fails after manager notification", async () => {
  setRequiredServerEnv();
  installServerFetchMock({ failCustomerEmail: true });

  const result = await callOrderHandler(makeValidOrder());

  assert.equal(result.statusCode, 200);
  assert.equal((result.json as { ok?: boolean }).ok, true);
  assert.equal((result.json as { email?: { manager?: string; customer?: string; customerError?: string | null } }).email?.manager, "sent");
  assert.equal((result.json as { email?: { manager?: string; customer?: string; customerError?: string | null } }).email?.customer, "failed");
  assert.equal((result.json as { email?: { manager?: string; customer?: string; customerError?: string | null } }).email?.customerError, "logged");
});

test("API order flow fails when manager notification fails", async () => {
  setRequiredServerEnv();
  installServerFetchMock({ failManagerEmail: true });

  const result = await callOrderHandler(makeValidOrder());

  assert.equal(result.statusCode, 502);
  assert.match((result.json as { message?: string }).message ?? "", /менеджеру/i);
});

test("API order flow fails when order persistence fails", async () => {
  setRequiredServerEnv();
  installServerFetchMock({ failSupabaseInsert: true });

  const result = await callOrderHandler(makeValidOrder());

  assert.equal(result.statusCode, 502);
  assert.match((result.json as { message?: string }).message ?? "", /сохранить заявку/i);
});

test("API order flow rejects invalid payload and unsupported methods", async () => {
  setRequiredServerEnv();
  installServerFetchMock();

  const invalidStyle = makeValidOrder({ style: { facadeStyleId: "missing-style", hardwareId: "base" } });
  const invalidResult = await callOrderHandler(invalidStyle);
  assert.equal(invalidResult.statusCode, 400);
  assert.match((invalidResult.json as { message?: string }).message ?? "", /стоимость/i);

  const methodResult = await callOrderHandler(makeValidOrder(), { method: "GET" });
  assert.equal(methodResult.statusCode, 405);
});

test("API order flow enforces request cooldown/rate limit deterministically", async () => {
  setRequiredServerEnv();
  installServerFetchMock();
  const ip = `198.51.100.${ipCounter++}`;
  let result: Awaited<ReturnType<typeof callOrderHandler>> | null = null;

  for (let index = 0; index < 9; index += 1) {
    result = await callOrderHandler(makeValidOrder({ orderId: `RZ-20260615-40${index}` }), { ip });
  }

  assert.equal(result?.statusCode, 429);
  assert.match((result?.json as { message?: string }).message ?? "", /много запросов/i);
});

try {
  for (const item of tests) {
    await item.run();
    console.log(`✓ ${item.name}`);
  }
  console.log(`${tests.length} checkout/API/Supabase contract tests passed.`);
} finally {
  restoreEnvironment();
}
