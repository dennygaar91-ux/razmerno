import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import workspaceHandler from "../api/customer/workspace";
import { CUSTOMER_UNAUTHORIZED_MESSAGE } from "../api/_shared/customer-api-auth";
import { buildCustomerWorkspaceForUser } from "../api/_shared/customer-workspace";
import {
  buildCustomerWorkspace,
  mapWorkspaceOrder,
  mapWorkspaceProfile,
  mapWorkspaceProject,
} from "../api/_shared/customer-workspace-types";
import { PUBLIC_ORDER_NUMBER_PATTERN } from "../api/_shared/order-domain";
import type { ConstructorProject } from "../api/_shared/constructor-project-types";
import type { CustomerProfile } from "../api/_shared/customer-profile";
import type { CustomerOrderListRow } from "../api/_shared/customer-orders-store";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const WORKSPACE_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_USER_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ACCESS_TOKEN = "workspace-test-access-token";

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
  process.env.ALLOWED_ORIGINS = "http://localhost:5173,https://razmerno.ru";
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

function installWorkspaceFetchMock() {
  const requests: Array<{ url: string; method: string }> = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";
    requests.push({ url, method });

    if (url.includes("/auth/v1/user")) {
      return jsonResponse({
        id: WORKSPACE_USER_ID,
        email: "workspace@example.com",
        user_metadata: { full_name: "Workspace User" },
      });
    }

    if (url.includes("/rest/v1/profiles")) {
      if (method === "GET") {
        return jsonResponse({
          user_id: WORKSPACE_USER_ID,
          full_name: "Workspace User",
          email: "workspace@example.com",
          phone: "+7 900 111-22-33",
          created_at: "2026-07-03T10:00:00.000Z",
          updated_at: "2026-07-03T10:00:00.000Z",
        });
      }
    }

    if (url.includes("/rest/v1/constructor_projects")) {
      const parsed = new URL(url);
      const userFilter = parsed.searchParams.get("user_id");
      const userId = userFilter?.startsWith("eq.") ? decodeURIComponent(userFilter.slice(3)) : null;
      if (userId !== WORKSPACE_USER_ID) {
        return jsonResponse([]);
      }
      return jsonResponse([
        {
          id: "550e8400-e29b-41d4-a716-446655440020",
          user_id: WORKSPACE_USER_ID,
          title: "Активный проект",
          snapshot: { version: 1, draft: { furnitureType: "Шкаф" } },
          furniture_type: "wardrobe",
          preview_path: "/preview/active.png",
          archived_at: null,
          created_at: "2026-07-03T10:00:00.000Z",
          updated_at: "2026-07-03T11:00:00.000Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440021",
          user_id: WORKSPACE_USER_ID,
          title: "Архивный проект",
          snapshot: { version: 1, draft: { furnitureType: "Шкаф" } },
          furniture_type: "wardrobe",
          preview_path: null,
          archived_at: "2026-07-03T09:00:00.000Z",
          created_at: "2026-07-02T10:00:00.000Z",
          updated_at: "2026-07-02T10:00:00.000Z",
        },
      ]);
    }

    if (url.includes("/rest/v1/orders")) {
      const parsed = new URL(url);
      const userFilter = parsed.searchParams.get("user_id");
      const userId = userFilter?.startsWith("eq.") ? decodeURIComponent(userFilter.slice(3)) : null;
      if (userId !== WORKSPACE_USER_ID) {
        return jsonResponse([]);
      }
      return jsonResponse([
        {
          id: "660e8400-e29b-41d4-a716-446655440030",
          order_id: "RZ-20260703-3001",
          public_order_number: "RZM_0001",
          domain_status: "Проверка",
          created_at: "2026-07-03T12:00:00.000Z",
          total_price: 79_800,
          customer_name: "Workspace User",
          delivery_address: "Москва, ул. Пример, 1",
          delivery_enabled: true,
        },
        {
          id: "660e8400-e29b-41d4-a716-446655440031",
          order_id: "RZ-20260703-3002",
          public_order_number: "RZM_0002",
          domain_status: "Проверка",
          created_at: "2026-07-02T12:00:00.000Z",
          total_price: 55_000,
          customer_name: "Workspace User",
          delivery_address: "hidden",
          delivery_enabled: false,
        },
      ]);
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;

  return requests;
}

const sampleProfile: CustomerProfile = {
  user_id: WORKSPACE_USER_ID,
  full_name: "Workspace User",
  email: "workspace@example.com",
  phone: "+7 900 111-22-33",
  created_at: "2026-07-03T10:00:00.000Z",
  updated_at: "2026-07-03T10:00:00.000Z",
};

const sampleProject: ConstructorProject = {
  id: "550e8400-e29b-41d4-a716-446655440020",
  user_id: WORKSPACE_USER_ID,
  title: "Активный проект",
  snapshot: { version: 1, draft: { furnitureType: "Шкаф" } },
  furniture_type: "wardrobe",
  preview_path: "/preview/active.png",
  archived_at: null,
  created_at: "2026-07-03T10:00:00.000Z",
  updated_at: "2026-07-03T11:00:00.000Z",
};

const sampleOrder: CustomerOrderListRow = {
  id: "660e8400-e29b-41d4-a716-446655440030",
  order_id: "RZ-20260703-3001",
  public_order_number: "RZM_0001",
  domain_status: "Проверка",
  created_at: "2026-07-03T12:00:00.000Z",
  total_price: 79_800,
  customer_name: "Workspace User",
  delivery_address: "Москва, ул. Пример, 1",
  delivery_enabled: true,
};

test("workspace mappers expose only customer-safe fields", () => {
  assert.deepEqual(mapWorkspaceProfile(sampleProfile), {
    fullName: "Workspace User",
    email: "workspace@example.com",
    phone: "+7 900 111-22-33",
  });

  assert.deepEqual(mapWorkspaceProject(sampleProject), {
    id: sampleProject.id,
    title: "Активный проект",
    furnitureType: "wardrobe",
    updatedAt: "2026-07-03T11:00:00.000Z",
    previewPath: "/preview/active.png",
  });

  assert.deepEqual(mapWorkspaceOrder(sampleOrder), {
    id: sampleOrder.id,
    publicOrderNumber: "RZM_0001",
    status: {
      label: "На проверке",
      stage: "review",
      description: "Мы проверяем заявку и уточняем детали перед следующим шагом.",
      nextStep: "После проверки вы получите уведомление о дальнейших действиях.",
    },
    createdAt: "2026-07-03T12:00:00.000Z",
    totalPrice: 79_800,
    customerName: "Workspace User",
    deliveryAddress: "Москва, ул. Пример, 1",
  });

  assert.deepEqual(
    mapWorkspaceOrder({
      ...sampleOrder,
      delivery_enabled: false,
      delivery_address: "hidden",
    }),
    {
      id: sampleOrder.id,
      publicOrderNumber: "RZM_0001",
      status: {
        label: "На проверке",
        stage: "review",
        description: "Мы проверяем заявку и уточняем детали перед следующим шагом.",
        nextStep: "После проверки вы получите уведомление о дальнейших действиях.",
      },
      createdAt: "2026-07-03T12:00:00.000Z",
      totalPrice: 79_800,
      customerName: "Workspace User",
      deliveryAddress: null,
    },
  );
});

test("buildCustomerWorkspace computes stats from provided collections", () => {
  const workspace = buildCustomerWorkspace({
    profile: sampleProfile,
    projects: [sampleProject],
    orders: [sampleOrder],
  });

  assert.equal(workspace.stats.activeProjects, 1);
  assert.equal(workspace.stats.orders, 1);
  assert.equal(workspace.projects.length, 1);
  assert.equal(workspace.orders.length, 1);
  assert.equal(JSON.stringify(workspace).includes("snapshot"), false);
  assert.equal(JSON.stringify(workspace).includes("production_export"), false);
  assert.equal(JSON.stringify(workspace).includes("pricing_source"), false);
});

test("workspace GET returns 401 without bearer token", async () => {
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();
  await workspaceHandler(
    {
      method: "GET",
      headers: { origin: "http://localhost:5173" },
      body: null,
    },
    res,
  );
  const result = snapshot();
  assert.equal(result.statusCode, 401);
  assert.deepEqual(result.body, { ok: false, message: CUSTOMER_UNAUTHORIZED_MESSAGE });
});

test("workspace GET returns customer-owned read model for authenticated user", async () => {
  setRequiredServerEnv();
  const requests = installWorkspaceFetchMock();
  const { res, snapshot } = createMockResponse();

  await workspaceHandler(
    {
      method: "GET",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: null,
    },
    res,
  );

  const result = snapshot();
  assert.equal(result.statusCode, 200);
  const body = result.body as {
    ok: boolean;
    workspace: {
      profile: { fullName: string; email: string; phone: string | null };
      projects: Array<{ id: string; title: string }>;
      orders: Array<{ publicOrderNumber: string | null; status: { label: string; stage: string } }>;
      stats: { activeProjects: number; orders: number };
    };
  };

  assert.equal(body.ok, true);
  assert.equal(body.workspace.profile.fullName, "Workspace User");
  assert.equal(body.workspace.projects.length, 1);
  assert.equal(body.workspace.projects[0]?.title, "Активный проект");
  assert.equal(body.workspace.orders.length, 2);
  assert.equal(body.workspace.orders[0]?.publicOrderNumber, "RZM_0001");
  assert.equal(body.workspace.orders[0]?.status.label, "На проверке");
  assert.equal(body.workspace.orders[0]?.status.stage, "review");
  assert.equal(body.workspace.stats.activeProjects, 1);
  assert.equal(body.workspace.stats.orders, 2);

  const ordersRequest = requests.find((item) => item.url.includes("/rest/v1/orders"));
  assert.ok(ordersRequest?.url.includes(`user_id=eq.${WORKSPACE_USER_ID}`));
  const projectsRequest = requests.find((item) => item.url.includes("/rest/v1/constructor_projects"));
  assert.ok(projectsRequest?.url.includes(`user_id=eq.${WORKSPACE_USER_ID}`));

  const serialized = JSON.stringify(body.workspace);
  assert.equal(serialized.includes("snapshot"), false);
  assert.equal(serialized.includes("production_export"), false);
  assert.equal(serialized.includes("domainStatus"), false);
  assert.equal(serialized.includes("domain_status"), false);
  assert.equal(serialized.includes(OTHER_USER_ID), false);
});

test("buildCustomerWorkspaceForUser excludes archived projects from workspace list", async () => {
  setRequiredServerEnv();
  installWorkspaceFetchMock();

  const built = await buildCustomerWorkspaceForUser({
    userId: WORKSPACE_USER_ID,
    email: "workspace@example.com",
    fullName: "Workspace User",
  });

  assert.equal(built.ok, true);
  if (!built.ok) return;
  assert.equal(built.workspace.projects.length, 1);
  assert.equal(built.workspace.stats.activeProjects, 1);
  assert.equal(built.workspace.projects[0]?.title, "Активный проект");
});

test("workspace order DTO uses publicOrderNumber pattern distinct from business order id", () => {
  const mapped = mapWorkspaceOrder({
    id: "660e8400-e29b-41d4-a716-446655440030",
    public_order_number: "RZM_0001",
    order_id: "RZ-20260703-3001",
    domain_status: "На проверке",
    created_at: "2026-07-03T10:00:00.000Z",
    total_price: 86400,
    product_type: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    delivery_enabled: false,
    delivery_price: 0,
    delivery_address: null,
    assembly_enabled: false,
    assembly_price: 0,
  } as CustomerOrderListRow);

  assert.match(mapped.publicOrderNumber ?? "", PUBLIC_ORDER_NUMBER_PATTERN);
  assert.equal(mapped.publicOrderNumber, "RZM_0001");
  assert.notEqual(mapped.publicOrderNumber, mapped.id);
  assert.doesNotMatch(mapped.publicOrderNumber ?? "", /^RZ-\d{8}-\d{4}$/);
});

test("customer workspace and detail share accepted publicOrderNumber format", () => {
  const workspaceTypes = readFileSync("api/_shared/customer-workspace-types.ts", "utf8");
  const detailTypes = readFileSync("api/_shared/customer-order-detail-types.ts", "utf8");
  const notifications = readFileSync("api/_shared/customer-notification-events.ts", "utf8");
  assert.match(workspaceTypes, /publicOrderNumber/);
  assert.match(detailTypes, /publicOrderNumber/);
  assert.match(notifications, /publicOrderNumber|public_order_number/);
  assert.match(String(PUBLIC_ORDER_NUMBER_PATTERN), /RZM_/);
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
