import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";

import handler from "../api/orders";
import { mapOrderRow, mapStatusEvent, isAdminOrderStatus } from "../api/_shared/admin-orders";
import { toOrderDbInsert } from "../api/_shared/order-db";
import {
  applyServerDeliveryAndAssembly,
  applyServerProductionPanelPrice,
  calculateServerCatalogPrice,
  calculateServerPrice,
  withServerPrice,
} from "../api/_shared/server-price";
import { validateOrder } from "../api/_shared/order-validation";
import { insertOrderRecord, updateOrderEmailStatus } from "../api/_shared/supabase-orders";
import type { OrderRequest } from "../api/_shared/order-types";
import { calculateCatalogPrice, type CatalogPriceInput } from "../src/pricing/engine";
import { calculateAssemblyQuote } from "../src/pricing/assembly";
import { calculateDeliveryQuote } from "../src/pricing/delivery";
import { buildConstructorMaterialPricingContext } from "../src/pricing/materialPricing";
import { buildProductionExportFromOrder } from "../src/constructor/production/orderExportPackage";
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
  headers: Record<string, string>;
};
type ConsoleCapture = {
  errors: string[];
  warns: string[];
  restore: () => void;
};

const tests: Array<{ name: string; run: AsyncTest }> = [];
const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;
let ipCounter = 10;

function test(name: string, run: AsyncTest) {
  const existingIndex = tests.findIndex((item) => item.name === name);
  if (existingIndex >= 0) {
    tests.splice(existingIndex, 1);
  }
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

function captureConsole(): ConsoleCapture {
  const originalError = console.error;
  const originalWarn = console.warn;
  const errors: string[] = [];
  const warns: string[] = [];

  console.error = ((...args: unknown[]) => {
    errors.push(args.map(String).join(" "));
  }) as typeof console.error;

  console.warn = ((...args: unknown[]) => {
    warns.push(args.map(String).join(" "));
  }) as typeof console.warn;

  return {
    errors,
    warns,
    restore() {
      console.error = originalError;
      console.warn = originalWarn;
    },
  };
}

function installCheckoutFetchMock(response: Response): FetchRecord[] {
  const records: FetchRecord[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const headers = new Headers(init?.headers);
    records.push({
      url,
      method: init?.method ?? "GET",
      body: typeof init?.body === "string" ? init.body : null,
      headers: Object.fromEntries(headers.entries()),
    });
    return response.clone();
  }) as typeof fetch;
  return records;
}

function installServerFetchMock(options: {
  failSupabaseInsert?: boolean;
  failManagerEmail?: boolean;
  failCustomerEmail?: boolean;
  managerEmailFailureText?: string;
  customerEmailFailureText?: string;
} = {}): FetchRecord[] {
  const records: FetchRecord[] = [];
  let resendCall = 0;
  const orders = new Map<string, Record<string, unknown>>();

  function findOrderId(url: URL): string | null {
    const filter = url.searchParams.get("order_id");
    if (!filter?.startsWith("eq.")) return null;
    return decodeURIComponent(filter.slice(3));
  }

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";
    const headers = new Headers(init?.headers);
    records.push({
      url,
      method,
      body: typeof init?.body === "string" ? init.body : null,
      headers: Object.fromEntries(headers.entries()),
    });

    if (url.includes("supabase.example.test") && url.includes("/rest/v1/orders")) {
      const parsedUrl = new URL(url);

      if (options.failSupabaseInsert && method === "POST") {
        return jsonResponse({ message: "insert failed" }, 500);
      }

      if (method === "POST") {
        const payload = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
        const orderId = String(payload.order_id ?? "");

        if (orders.has(orderId)) {
          return jsonResponse(
            {
              code: "23505",
              message: 'duplicate key value violates unique constraint "orders_order_id_key"',
            },
            409,
          );
        }

        orders.set(orderId, {
          ...payload,
          created_at: "2026-06-20T04:00:00.000Z",
          updated_at: "2026-06-20T04:00:00.000Z",
        });
        return jsonResponse([], 201);
      }

      if (method === "GET") {
        const orderId = findOrderId(parsedUrl);
        const order = orderId ? orders.get(orderId) : null;
        return jsonResponse(order ? [order] : [], 200);
      }

      if (method === "PATCH") {
        const orderId = findOrderId(parsedUrl);
        const patch = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
        const current = orderId ? orders.get(orderId) : null;
        if (orderId && current) {
          orders.set(orderId, {
            ...current,
            ...patch,
            updated_at: "2026-06-20T04:05:00.000Z",
          });
        }
        return jsonResponse([], 200);
      }

      return jsonResponse([], 200);
    }

    if (url.includes("api.resend.com/emails")) {
      resendCall += 1;
      if (options.failManagerEmail && resendCall === 1) {
        return textResponse(options.managerEmailFailureText ?? "manager email failed", 500);
      }
      if (options.failCustomerEmail && resendCall === 2) {
        return textResponse(options.customerEmailFailureText ?? "customer email failed", 500);
      }
      return jsonResponse({ id: `email-${resendCall}` });
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;

  return records;
}

function makeReq(
  body: OrderRequest,
  options: { method?: string; ip?: string; origin?: string; idempotencyKey?: string | null } = {},
) {
  const headers: Record<string, string> = {
    origin: options.origin ?? "http://localhost:5173",
    "user-agent": "contract-test-agent",
    "x-forwarded-for": options.ip ?? `198.51.100.${ipCounter++}`,
  };
  if (options.idempotencyKey !== null) {
    headers["idempotency-key"] = options.idempotencyKey ?? body.orderId ?? "";
  }

  return {
    method: options.method ?? "POST",
    headers,
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

function calculateClientOrderPricing(order: OrderRequest, clientInput: CatalogPriceInput = pricingParityBaseInput) {
  const base = calculateCatalogPrice(clientInput);
  const delivery = calculateDeliveryQuote(order.delivery?.enabled === true, order.delivery?.address ?? "");
  const assembly = calculateAssemblyQuote(order.assembly?.enabled === true, base.total);

  return {
    ...base,
    delivery: delivery.price,
    assembly: assembly.price,
    total: base.total + delivery.price + assembly.price,
  };
}

function compareClientServerOrderPricing(order: OrderRequest, clientInput: CatalogPriceInput = pricingParityBaseInput) {
  const client = calculateClientOrderPricing(order, clientInput);
  const server = calculateServerPrice(order);

  return {
    client,
    server,
    delta: server.total - client.total,
  };
}

function assertOrderPricingParity(order: OrderRequest, clientInput: CatalogPriceInput = pricingParityBaseInput) {
  const { client, server, delta } = compareClientServerOrderPricing(order, clientInput);

  assert.equal(delta, 0);
  assert.equal(server.total, client.total);
  assert.equal(server.body, client.body);
  assert.equal(server.facades, client.facades);
  assert.equal(server.delivery, client.delivery);
  assert.equal(server.assembly ?? 0, client.assembly ?? 0);
  assert.equal(server.filling, client.filling);
  assert.equal(server.hardware, client.hardware);
  assert.equal(server.materials, client.materials);
  assert.equal(server.edgeBanding, client.edgeBanding);
  assert.equal(server.services, client.services);
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

async function callOrderHandler(
  body: OrderRequest,
  options: { method?: string; ip?: string; origin?: string; idempotencyKey?: string | null } = {},
) {
  const { res, state } = makeRes();
  await handler(makeReq(body, options), res);
  return state;
}

function getOrdersInsertPayload(records: FetchRecord[]) {
  const insertRequest = records.find(
    (record) => record.url.includes("/rest/v1/orders") && record.method === "POST",
  );
  assert.ok(insertRequest?.body, "Expected Supabase orders insert request");
  return JSON.parse(insertRequest.body) as Record<string, unknown>;
}

function calculateExpectedServerProductionPanelPrice(order: OrderRequest) {
  const catalogPrice = calculateServerCatalogPrice(order);
  const catalogServerPrice = applyServerDeliveryAndAssembly(order, catalogPrice);
  const catalogPricedBody = withServerPrice(order, catalogServerPrice);
  const initialProductionExport = buildProductionExportFromOrder(catalogPricedBody);
  const finalBasePrice = applyServerProductionPanelPrice({
    body: order,
    catalogPrice,
    productionExport: initialProductionExport,
  }).price;
  const finalServerPrice = applyServerDeliveryAndAssembly(order, finalBasePrice);

  return {
    catalogPrice,
    catalogServerPrice,
    initialProductionExport,
    finalBasePrice,
    finalServerPrice,
    finalPricedBody: withServerPrice(order, finalServerPrice),
  };
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

test("P0-13 pricing parity fixture: no delivery and no assembly match order total", () => {
  assertOrderPricingParity(makeValidOrder());
});

test("P0-13 pricing parity fixture: Moscow delivery matches client and server totals", () => {
  assertOrderPricingParity(makeDeliveryOrder("Москва, ул. Тверская, 1"));
});

test("P0-13 pricing parity fixture: outside MKAD delivery matches client and server totals", () => {
  assertOrderPricingParity(makeDeliveryOrder("Московская область, Химки, за МКАД 20 км"));
});

test("P0-13 pricing parity fixture: assembly without delivery matches client and server totals", () => {
  assertOrderPricingParity(
    makeValidOrder({
      assembly: {
        enabled: true,
        price: 0,
        rate: 0.1,
        basePrice: 0,
      },
    }),
  );
});

test("P0-13 pricing parity fixture: delivery and assembly together match client and server totals", () => {
  assertOrderPricingParity(
    makeValidOrder({
      delivery: {
        enabled: true,
        address: "Москва, ул. Тверская, 1",
        price: 0,
      },
      assembly: {
        enabled: true,
        price: 0,
        rate: 0.1,
        basePrice: 0,
      },
    }),
  );
});

test("P0-13 pricing parity fixture: material-aware delivery and assembly match client and server totals", () => {
  const materials = {
    bodyId: "ldsp-egger-u780-seryy-monumentalnyy-st9",
    facadeId: "mdf-egger-r010-seryy-grafitovyy-ms",
  } satisfies { bodyId: MaterialToken; facadeId: MaterialToken };

  assertOrderPricingParity(
    makeValidOrder({
      materials: {
        bodyId: materials.bodyId,
        facadeId: materials.facadeId,
        facadeKind: "mdf",
        backPanelId: "white-matt",
        backPanelKind: "hdf",
      },
      delivery: {
        enabled: true,
        address: "Московская область, Химки, за МКАД 20 км",
        price: 0,
      },
      assembly: {
        enabled: true,
        price: 0,
        rate: 0.1,
        basePrice: 0,
      },
    }),
    withMaterialPricingInput(pricingParityBaseInput, materials),
  );
});

test("checkout submit sends API payload with idempotency key and returns success", async () => {
  const records = installCheckoutFetchMock(jsonResponse({ ok: true, orderId: "RZ-20260615-7777" }));

  const result = await submitOrder(makeValidOrder() as Parameters<typeof submitOrder>[0]);

  assert.deepEqual(result, { ok: true, orderId: "RZ-20260615-7777" });
  assert.equal(records.length, 1);
  assert.equal(records[0]?.url, "/api/orders");
  assert.equal(records[0]?.method, "POST");
  assert.match(records[0]?.headers["idempotency-key"] ?? "", /^RZ-\d{8}-\d{4}$/);

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

test("checkout submit returns 409 conflict message without throwing", async () => {
  installCheckoutFetchMock(jsonResponse({ ok: false, message: "Idempotency conflict: payload changed for this key." }, 409));

  const result = await submitOrder(makeValidOrder() as Parameters<typeof submitOrder>[0]);

  assert.equal(result.ok, false);
  assert.equal(result.error, "Idempotency conflict: payload changed for this key.");
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
  assert.equal((result.json as { email?: { manager?: string; customer?: string; managerError?: string | null } }).email?.manager, "sent");
  assert.equal((result.json as { email?: { manager?: string; customer?: string; managerError?: string | null } }).email?.customer, "sent");
  assert.equal((result.json as { email?: { manager?: string; customer?: string; managerError?: string | null } }).email?.managerError ?? null, null);
  assert.ok(records.some((record) => record.url.includes("/rest/v1/orders") && record.method === "POST"));
  assert.equal(records.filter((record) => record.url.includes("api.resend.com/emails")).length, 2);
});

test("P0-13 server-authoritative boundary: malicious lower client total and breakdown are overwritten before stored order insert", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock();
  const materials = {
    bodyId: "ldsp-egger-u780-seryy-monumentalnyy-st9",
    facadeId: "mdf-egger-r010-seryy-grafitovyy-ms",
  } satisfies { bodyId: MaterialToken; facadeId: MaterialToken };
  const maliciousOrder = makeValidOrder({
    orderId: "RZ-20260620-4101",
    materials: {
      bodyId: materials.bodyId,
      facadeId: materials.facadeId,
      facadeKind: "mdf",
      backPanelId: "white-matt",
      backPanelKind: "hdf",
    },
    priceBreakdown: {
      body: 10,
      facades: 10,
      filling: 10,
      hardware: 10,
      production: 10,
      materials: 10,
      edgeBanding: 10,
      services: 10,
      delivery: 10,
      assembly: 10,
    },
    totalPrice: 101,
  });

  const serverPrice = calculateServerPrice(maliciousOrder);
  const pricedOrder = withServerPrice(maliciousOrder, serverPrice);
  const expectedProductionExport = buildProductionExportFromOrder(pricedOrder);

  const result = await callOrderHandler(maliciousOrder, {
    idempotencyKey: "RZ-20260620-4101",
  });
  const storedInsert = getOrdersInsertPayload(records);
  const storedProductionExport = storedInsert.production_export as
    | {
        project?: {
          dimensions?: { widthMm?: number; heightMm?: number; depthMm?: number };
          structure?: { sectionCount?: number; hardwareMode?: string };
          material?: { bodyMaterialId?: string; facadeMaterialId?: string };
        };
        source?: string;
        schema?: string;
      }
    | null;

  assert.equal(result.statusCode, 200);
  assert.equal((result.json as { ok?: boolean }).ok, true);
  assert.equal(storedInsert.total_price, serverPrice.total);
  assert.notEqual(storedInsert.total_price, maliciousOrder.totalPrice);
  assert.deepEqual(storedInsert.price_breakdown, pricedOrder.priceBreakdown);
  assert.notDeepEqual(storedInsert.price_breakdown, maliciousOrder.priceBreakdown);
  assert.equal(storedInsert.delivery_price, (storedInsert.price_breakdown as { delivery?: number }).delivery);
  assert.equal(storedInsert.assembly_price, (storedInsert.price_breakdown as { assembly?: number }).assembly);
  assert.ok(storedProductionExport);
  assert.equal(storedProductionExport?.schema, expectedProductionExport.schema);
  assert.equal(storedProductionExport?.source, expectedProductionExport.source);
  assert.equal(
    storedProductionExport?.project?.dimensions?.widthMm,
    expectedProductionExport.project.dimensions.widthMm,
  );
  assert.equal(
    storedProductionExport?.project?.dimensions?.heightMm,
    expectedProductionExport.project.dimensions.heightMm,
  );
  assert.equal(
    storedProductionExport?.project?.dimensions?.depthMm,
    expectedProductionExport.project.dimensions.depthMm,
  );
  assert.equal(
    storedProductionExport?.project?.structure?.sectionCount,
    expectedProductionExport.project.structure.sectionCount,
  );
  assert.equal(
    storedProductionExport?.project?.structure?.hardwareMode,
    expectedProductionExport.project.structure.hardwareMode,
  );
  assert.equal(
    storedProductionExport?.project?.material?.bodyMaterialId,
    expectedProductionExport.project.material.bodyMaterialId,
  );
  assert.equal(
    storedProductionExport?.project?.material?.facadeMaterialId,
    expectedProductionExport.project.material.facadeMaterialId,
  );
  assert.doesNotMatch(JSON.stringify(storedProductionExport), /"totalPrice"|"priceBreakdown"/);
});

test("P0-13 stored order snapshot parity: delivery and assembly persistence must use server recalculation, not lower client payload", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock();
  const order = makeValidOrder({
    orderId: "RZ-20260620-4102",
    delivery: {
      enabled: true,
      address: "Московская область, Химки, за МКАД 20 км",
      price: 1,
    },
    assembly: {
      enabled: true,
      price: 1,
      rate: 0.1,
      basePrice: 1,
    },
    totalPrice: 101,
    priceBreakdown: {
      body: 1,
      facades: 1,
      filling: 1,
      hardware: 1,
      production: 1,
      materials: 1,
      edgeBanding: 1,
      services: 1,
      delivery: 1,
      assembly: 1,
    },
  });
  const serverPrice = calculateServerPrice(order);
  const pricedOrder = withServerPrice(order, serverPrice);

  const result = await callOrderHandler(order, {
    idempotencyKey: "RZ-20260620-4102",
  });
  const storedInsert = getOrdersInsertPayload(records);

  assert.equal(result.statusCode, 200);
  assert.equal((result.json as { ok?: boolean }).ok, true);
  assert.equal(storedInsert.total_price, pricedOrder.totalPrice);
  assert.deepEqual(storedInsert.price_breakdown, pricedOrder.priceBreakdown);
  assert.equal(storedInsert.delivery_price, serverPrice.delivery);
  assert.equal(storedInsert.assembly_price, serverPrice.assembly ?? 0);
  assert.equal(storedInsert.assembly_rate, 0.1);
  assert.equal(
    storedInsert.assembly_base_price,
    serverPrice.total - serverPrice.delivery - (serverPrice.assembly ?? 0),
  );
});

test("P0-13 production-panel parity: server persisted snapshot must use server-applied production panel price", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock();
  const order = makeValidOrder({
    orderId: "RZ-20260620-4103",
    source: "production-panels",
    materials: {
      bodyId: "ldsp-egger-u780-seryy-monumentalnyy-st9",
      facadeId: "mdf-egger-r010-seryy-grafitovyy-ms",
      facadeKind: "mdf",
      backPanelId: "white-matt",
      backPanelKind: "hdf",
    },
    priceBreakdown: {
      body: 1,
      facades: 1,
      filling: 1,
      hardware: 1,
      production: 1,
      materials: 1,
      edgeBanding: 1,
      services: 1,
      delivery: 1,
      assembly: 1,
    },
    totalPrice: 101,
  });
  const expected = calculateExpectedServerProductionPanelPrice(order);
  const expectedProductionExport = buildProductionExportFromOrder(expected.finalPricedBody);

  const result = await callOrderHandler(order, {
    idempotencyKey: "RZ-20260620-4103",
  });
  const storedInsert = getOrdersInsertPayload(records);
  const storedProductionExport = storedInsert.production_export as
    | {
        schema?: string;
        source?: string;
        project?: {
          dimensions?: { widthMm?: number; heightMm?: number; depthMm?: number };
          structure?: { sectionCount?: number; hardwareMode?: string };
          material?: { bodyMaterialId?: string; facadeMaterialId?: string };
        };
      }
    | null;

  assert.equal(result.statusCode, 200);
  assert.equal((result.json as { ok?: boolean }).ok, true);
  assert.equal(expected.finalBasePrice.source, "production-panels");
  assert.deepEqual(storedInsert.price_breakdown, expected.finalPricedBody.priceBreakdown);
  assert.equal(storedInsert.total_price, expected.finalPricedBody.totalPrice);
  assert.equal(storedInsert.delivery_price, expected.finalServerPrice.delivery);
  assert.equal(storedInsert.assembly_price, expected.finalServerPrice.assembly ?? 0);
  assert.equal((storedInsert.price_breakdown as { body?: number }).body, expected.finalBasePrice.body);
  assert.equal((storedInsert.price_breakdown as { facades?: number }).facades, expected.finalBasePrice.facades);
  assert.equal((storedInsert.price_breakdown as { materials?: number }).materials, expected.finalBasePrice.materials);
  assert.equal((storedInsert.price_breakdown as { edgeBanding?: number }).edgeBanding, expected.finalBasePrice.edgeBanding);
  assert.equal((storedInsert.price_breakdown as { production?: number }).production, expected.finalBasePrice.production);
  assert.notEqual(storedInsert.total_price, order.totalPrice);
  assert.notDeepEqual(storedInsert.price_breakdown, order.priceBreakdown);
  assert.ok(storedProductionExport);
  assert.equal(storedProductionExport?.schema, expectedProductionExport.schema);
  assert.equal(storedProductionExport?.source, expectedProductionExport.source);
  assert.equal(storedProductionExport?.project?.dimensions?.widthMm, expectedProductionExport.project.dimensions.widthMm);
  assert.equal(storedProductionExport?.project?.dimensions?.heightMm, expectedProductionExport.project.dimensions.heightMm);
  assert.equal(storedProductionExport?.project?.dimensions?.depthMm, expectedProductionExport.project.dimensions.depthMm);
  assert.equal(storedProductionExport?.project?.structure?.sectionCount, expectedProductionExport.project.structure.sectionCount);
  assert.equal(storedProductionExport?.project?.structure?.hardwareMode, expectedProductionExport.project.structure.hardwareMode);
  assert.equal(storedProductionExport?.project?.material?.bodyMaterialId, expectedProductionExport.project.material.bodyMaterialId);
  assert.equal(storedProductionExport?.project?.material?.facadeMaterialId, expectedProductionExport.project.material.facadeMaterialId);
});

test("P0-13 production-panel parity: assembly base must use server production-panel base and ignore malicious client delivery and assembly", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock();
  const order = makeValidOrder({
    orderId: "RZ-20260620-4104",
    source: "production-panels",
    materials: {
      bodyId: "ldsp-egger-u780-seryy-monumentalnyy-st9",
      facadeId: "mdf-egger-r010-seryy-grafitovyy-ms",
      facadeKind: "mdf",
      backPanelId: "white-matt",
      backPanelKind: "hdf",
    },
    delivery: {
      enabled: true,
      address: "Московская область, Химки, за МКАД 20 км",
      price: 1,
    },
    assembly: {
      enabled: true,
      price: 1,
      rate: 0.1,
      basePrice: 1,
    },
    totalPrice: 101,
    priceBreakdown: {
      body: 1,
      facades: 1,
      filling: 1,
      hardware: 1,
      production: 1,
      materials: 1,
      edgeBanding: 1,
      services: 1,
      delivery: 1,
      assembly: 1,
    },
  });
  const expected = calculateExpectedServerProductionPanelPrice(order);

  const result = await callOrderHandler(order, {
    idempotencyKey: "RZ-20260620-4104",
  });
  const storedInsert = getOrdersInsertPayload(records);

  assert.equal(result.statusCode, 200);
  assert.equal((result.json as { ok?: boolean }).ok, true);
  assert.equal(expected.finalBasePrice.source, "production-panels");
  assert.equal(storedInsert.total_price, expected.finalPricedBody.totalPrice);
  assert.equal(storedInsert.delivery_price, expected.finalServerPrice.delivery);
  assert.equal(storedInsert.assembly_price, expected.finalServerPrice.assembly ?? 0);
  assert.equal(storedInsert.assembly_rate, 0.1);
  assert.equal(storedInsert.assembly_base_price, expected.finalBasePrice.total);
  assert.notEqual(storedInsert.delivery_price, order.delivery?.price);
  assert.notEqual(storedInsert.assembly_price, order.assembly?.price);
  assert.notEqual(storedInsert.assembly_base_price, order.assembly?.basePrice);
});

test("API idempotency replay with same key and same payload returns the same order without duplicate notifications", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock();
  const body = makeValidOrder({ orderId: "RZ-20260620-4001" });

  const first = await callOrderHandler(body, { idempotencyKey: "RZ-20260620-4001" });
  const replay = await callOrderHandler(body, { idempotencyKey: "RZ-20260620-4001" });

  assert.equal(first.statusCode, 200);
  assert.equal(replay.statusCode, 200);
  assert.equal((first.json as { orderId?: string }).orderId, "RZ-20260620-4001");
  assert.equal((replay.json as { orderId?: string }).orderId, "RZ-20260620-4001");
  assert.equal((replay.json as { email?: { manager?: string; customer?: string } }).email?.manager, "sent");
  assert.equal((replay.json as { email?: { manager?: string; customer?: string } }).email?.customer, "sent");
  assert.equal(records.filter((record) => record.url.includes("api.resend.com/emails")).length, 2);
});

test("API idempotency replay with same key and different payload returns 409 conflict and does not resend notifications", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock();
  const firstBody = makeValidOrder({ orderId: "RZ-20260620-4002" });
  const changedBody = makeValidOrder({
    orderId: "RZ-20260620-4002",
    customer: {
      name: "Иван Петров",
      phone: "+7 999 111-22-33",
      email: "client@example.com",
      comment: "Изменённый комментарий",
    },
  });

  const first = await callOrderHandler(firstBody, { idempotencyKey: "RZ-20260620-4002" });
  const conflict = await callOrderHandler(changedBody, { idempotencyKey: "RZ-20260620-4002" });

  assert.equal(first.statusCode, 200);
  assert.equal(conflict.statusCode, 409);
  assert.equal((conflict.json as { ok?: boolean }).ok, false);
  assert.match((conflict.json as { message?: string }).message ?? "", /conflict|idempotency|конфликт/i);
  assert.equal(records.filter((record) => record.url.includes("api.resend.com/emails")).length, 2);
});

test("API order flow without idempotency key keeps the existing safe behavior", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock();

  const result = await callOrderHandler(makeValidOrder({ orderId: "RZ-20260620-4003" }), {
    idempotencyKey: null,
  });

  assert.equal(result.statusCode, 200);
  assert.equal((result.json as { ok?: boolean }).ok, true);
  assert.equal(records.filter((record) => record.url.includes("api.resend.com/emails")).length, 2);
});

test("API idempotency replay with same key and different payload returns 409 conflict and does not resend notifications", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock();
  const firstBody = makeValidOrder({ orderId: "RZ-20260620-4002" });
  const changedBody = makeValidOrder({
    orderId: "RZ-20260620-4002",
    customer: {
      name: "Иван Петров",
      phone: "+7 999 111-22-33",
      email: "client@example.com",
      comment: "Изменённый комментарий",
    },
  });

  const first = await callOrderHandler(firstBody, { idempotencyKey: "RZ-20260620-4002" });
  const conflict = await callOrderHandler(changedBody, { idempotencyKey: "RZ-20260620-4002" });

  assert.equal(first.statusCode, 200);
  assert.equal(conflict.statusCode, 409);
  assert.equal((conflict.json as { ok?: boolean }).ok, false);
  assert.match((conflict.json as { message?: string }).message ?? "", /conflict|idempotency|конфликт/i);
  assert.equal(records.filter((record) => record.url.includes("api.resend.com/emails")).length, 2);
});

test("API rejects mismatched idempotency key and body orderId before persistence", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock();

  const result = await callOrderHandler(makeValidOrder({ orderId: "RZ-20260620-4004" }), {
    idempotencyKey: "RZ-20260620-9999",
  });

  assert.equal(result.statusCode, 400);
  assert.equal((result.json as { ok?: boolean }).ok, false);
  assert.match((result.json as { message?: string }).message ?? "", /Idempotency-Key.*orderId/i);
  assert.equal(records.filter((record) => record.url.includes("/rest/v1/orders")).length, 0);
  assert.equal(records.filter((record) => record.url.includes("api.resend.com/emails")).length, 0);
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

test("API order flow stays successful when manager notification fails", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock({ failManagerEmail: true });

  const result = await callOrderHandler(makeValidOrder());

  assert.equal(result.statusCode, 200);
  assert.equal((result.json as { ok?: boolean }).ok, true);
  assert.equal((result.json as { email?: { manager?: string; customer?: string; managerError?: string | null } }).email?.manager, "failed");
  assert.equal((result.json as { email?: { manager?: string; customer?: string; managerError?: string | null } }).email?.customer, "sent");
  assert.equal((result.json as { email?: { manager?: string; customer?: string; managerError?: string | null } }).email?.managerError, "manager_notification_failed");
  assert.ok(records.some((record) => record.url.includes("/rest/v1/orders") && record.method === "POST"));
  assert.equal(records.filter((record) => record.url.includes("api.resend.com/emails")).length, 2);
});

test("policy lock: manager notification failure must keep order successful for customer and continue customer email path", async () => {
  setRequiredServerEnv();
  const records = installServerFetchMock({ failManagerEmail: true });

  const result = await callOrderHandler(makeValidOrder());

  assert.equal(result.statusCode, 200);
  assert.equal((result.json as { ok?: boolean }).ok, true);
  assert.equal((result.json as { email?: { manager?: string; customer?: string; managerError?: string | null } }).email?.manager, "failed");
  assert.equal((result.json as { email?: { manager?: string; customer?: string; managerError?: string | null } }).email?.customer, "sent");
  assert.equal((result.json as { email?: { manager?: string; customer?: string; managerError?: string | null } }).email?.managerError, "manager_notification_failed");
  assert.ok(records.some((record) => record.url.includes("/rest/v1/orders") && record.method === "POST"));
  assert.equal(records.filter((record) => record.url.includes("api.resend.com/emails")).length, 2);

  const emailStatusUpdates = records.filter(
    (record) => record.url.includes("/rest/v1/orders") && record.method === "PATCH",
  );
  assert.ok(
    emailStatusUpdates.some((record) => {
      const body = JSON.parse(record.body ?? "{}");
      return body.manager_email_status === "failed";
    }),
  );
});

test("policy lock: manager notification failure must emit observable internal marker", async () => {
  setRequiredServerEnv();
  installServerFetchMock({ failManagerEmail: true });

  const result = await callOrderHandler(makeValidOrder());

  assert.equal((result.json as { email?: { managerError?: string | null } }).email?.managerError, "manager_notification_failed");
});

test("policy lock: notification failure logs must not contain customer PII from provider error details", async () => {
  setRequiredServerEnv();
  const consoleCapture = captureConsole();

  try {
    installServerFetchMock({
      failCustomerEmail: true,
      customerEmailFailureText: "customer email failed for client@example.com +7 999 111-22-33 Иван",
    });

    const result = await callOrderHandler(makeValidOrder());

    assert.equal(result.statusCode, 200);
    assert.ok(consoleCapture.warns.length > 0);

    const output = consoleCapture.warns.join("\n");
    assert.doesNotMatch(output, /client@example\.com/i);
    assert.doesNotMatch(output, /\+7 999 111-22-33/);
    assert.doesNotMatch(output, /Иван/i);
  } finally {
    consoleCapture.restore();
  }
});

test("API order flow fails when order persistence fails", async () => {
  setRequiredServerEnv();
  installServerFetchMock({ failSupabaseInsert: true });

  const result = await callOrderHandler(makeValidOrder());

  assert.equal(result.statusCode, 502);
  assert.equal((result.json as { ok?: boolean }).ok, false);
  assert.ok(((result.json as { message?: string }).message ?? "").length > 0);
});

test("API order flow rejects invalid payload and unsupported methods", async () => {
  setRequiredServerEnv();
  installServerFetchMock();

  const invalidStyle = makeValidOrder({ style: { facadeStyleId: "missing-style", hardwareId: "base" } });
  const invalidResult = await callOrderHandler(invalidStyle);
  assert.equal(invalidResult.statusCode, 400);
  assert.equal((invalidResult.json as { ok?: boolean }).ok, false);
  assert.ok(((invalidResult.json as { message?: string }).message ?? "").length > 0);
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
  assert.equal((result?.json as { ok?: boolean }).ok, false);
  assert.ok((((result?.json as { message?: string }).message) ?? "").length > 0);
});

try {
  for (const item of tests) {
    await item.run();
    console.log(`РІСљвЂњ ${item.name}`);
  }
  console.log(`${tests.length} checkout/API/Supabase contract tests passed.`);
} finally {
  restoreEnvironment();
}
