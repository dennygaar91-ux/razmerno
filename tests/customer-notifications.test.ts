import assert from "node:assert/strict";

import notificationsHandler from "../api/customer/notifications";
import notificationReadHandler from "../api/customer/notification/read";
import notificationsReadAllHandler from "../api/customer/notifications/read-all";
import { CUSTOMER_UNAUTHORIZED_MESSAGE } from "../api/_shared/customer-api-auth";
import {
  createChangeRequestNotificationBestEffort,
  createOrderCreatedNotificationBestEffort,
} from "../api/_shared/customer-notification-events";
import {
  CUSTOMER_NOTIFICATION_FORBIDDEN_RESPONSE_KEYS,
  CUSTOMER_NOTIFICATION_TYPES,
  isCustomerNotificationType,
  mapCustomerNotification,
} from "../api/_shared/customer-notification-types";
import type { CustomerNotificationRow } from "../api/_shared/customer-notification-types";
import { listCustomerNotificationsForUser } from "../api/_shared/customer-notifications-store";

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_USER_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ORDER_ID = "660e8400-e29b-41d4-a716-446655440030";
const NOTIFICATION_ID = "880e8400-e29b-41d4-a716-446655440050";
const ACCESS_TOKEN = "notifications-test-token";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

const sampleNotificationRow: CustomerNotificationRow = {
  id: NOTIFICATION_ID,
  user_id: USER_ID,
  order_id: ORDER_ID,
  type: "order_created",
  title: "Заявка принята",
  message: "Ваша заявка RZM_0001 отправлена на проверку.",
  is_read: false,
  created_at: "2026-07-03T14:00:00.000Z",
};

const foreignNotificationRow: CustomerNotificationRow = {
  ...sampleNotificationRow,
  id: "880e8400-e29b-41d4-a716-446655440099",
  user_id: OTHER_USER_ID,
};

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

function installNotificationsFetchMock(options?: { empty?: boolean; dbError?: boolean }) {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes("/auth/v1/user")) {
      return jsonResponse({
        id: USER_ID,
        email: "ivan@example.com",
        user_metadata: { full_name: "Иван Петров" },
      });
    }

    if (url.includes("/rest/v1/order_notifications")) {
      if (options?.dbError) {
        return jsonResponse({ message: "db error" }, 500);
      }

      const parsed = new URL(url);
      const userFilter = parsed.searchParams.get("user_id");
      const userId = userFilter?.startsWith("eq.") ? decodeURIComponent(userFilter.slice(3)) : null;

      if (userId !== USER_ID) {
        return jsonResponse([]);
      }

      if (options?.empty) {
        return jsonResponse([]);
      }

      return jsonResponse([sampleNotificationRow]);
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;
}

test("notifications GET returns 401 without bearer token", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();

  await notificationsHandler(
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

test("notifications GET filters by authenticated user ownership", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installNotificationsFetchMock();
  const { res, snapshot } = createMockResponse();

  await notificationsHandler(
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
  const body = result.body as { ok: boolean; notifications: Array<Record<string, unknown>> };
  assert.equal(body.ok, true);
  assert.equal(body.notifications.length, 1);
  assert.notEqual(body.notifications[0]?.id, foreignNotificationRow.id);
});

test("notifications store applies user_id filter", async () => {
  restoreEnvironment();
  setRequiredServerEnv();

  let requestedUserId: string | null = null;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (url.includes("/rest/v1/order_notifications")) {
      const parsed = new URL(url);
      const userFilter = parsed.searchParams.get("user_id");
      requestedUserId = userFilter?.startsWith("eq.") ? decodeURIComponent(userFilter.slice(3)) : null;
      return jsonResponse([sampleNotificationRow]);
    }
    return jsonResponse([]);
  }) as typeof fetch;

  const listed = await listCustomerNotificationsForUser(USER_ID);
  assert.equal(listed.ok, true);
  if (listed.ok) {
    assert.equal(requestedUserId, USER_ID);
    assert.equal(listed.notifications.length, 1);
  }
});

test("notification mapper exposes safe read model fields", () => {
  const mapped = mapCustomerNotification(sampleNotificationRow);
  assert.equal(mapped.id, NOTIFICATION_ID);
  assert.equal(mapped.type, "order_created");
  assert.equal(mapped.title, "Заявка принята");
  assert.equal(mapped.message, sampleNotificationRow.message);
  assert.equal(mapped.isRead, false);
  assert.equal(mapped.createdAt, sampleNotificationRow.created_at);
  assert.equal(mapped.orderId, ORDER_ID);
  assert.equal("user_id" in mapped, false);
  assert.equal("is_read" in mapped, false);
});

test("notifications GET response excludes forbidden fields", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installNotificationsFetchMock();
  const { res, snapshot } = createMockResponse();

  await notificationsHandler(
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
  const body = result.body as { ok: boolean; notifications: Array<Record<string, unknown>> };
  for (const notification of body.notifications) {
    for (const forbiddenKey of CUSTOMER_NOTIFICATION_FORBIDDEN_RESPONSE_KEYS) {
      assert.equal(forbiddenKey in notification, false, `forbidden field leaked: ${forbiddenKey}`);
    }
  }
});

test("notifications GET returns empty list with 200", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installNotificationsFetchMock({ empty: true });
  const { res, snapshot } = createMockResponse();

  await notificationsHandler(
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
  const body = result.body as { ok: boolean; notifications: unknown[] };
  assert.equal(body.ok, true);
  assert.deepEqual(body.notifications, []);
});

test("notification types mapping accepts controlled set", () => {
  for (const type of CUSTOMER_NOTIFICATION_TYPES) {
    assert.equal(isCustomerNotificationType(type), true);
    const mapped = mapCustomerNotification({ ...sampleNotificationRow, type });
    assert.equal(mapped.type, type);
  }
  assert.equal(isCustomerNotificationType("manager_alert"), false);
});

test("notifications GET returns 500 on database error", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installNotificationsFetchMock({ dbError: true });
  const { res, snapshot } = createMockResponse();

  await notificationsHandler(
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

  assert.equal(snapshot().statusCode, 500);
});

test("notifications API contract returns ok and notifications array", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installNotificationsFetchMock();
  const { res, snapshot } = createMockResponse();

  await notificationsHandler(
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

  const body = snapshot().body as {
    ok: boolean;
    notifications: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      isRead: boolean;
      createdAt: string;
      orderId: string | null;
    }>;
  };

  assert.equal(body.ok, true);
  assert.ok(Array.isArray(body.notifications));
  assert.equal(typeof body.notifications[0]?.id, "string");
  assert.equal(typeof body.notifications[0]?.isRead, "boolean");
});

function installNotificationStoreMock() {
  const rows = new Map<string, CustomerNotificationRow>([
    [NOTIFICATION_ID, { ...sampleNotificationRow }],
    [
      foreignNotificationRow.id,
      { ...foreignNotificationRow },
    ],
  ]);
  const inserts: CustomerNotificationRow[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";

    if (url.includes("/auth/v1/user")) {
      return jsonResponse({
        id: USER_ID,
        email: "ivan@example.com",
        user_metadata: { full_name: "Иван Петров" },
      });
    }

    if (url.includes("/rest/v1/orders")) {
      const parsed = new URL(url);
      const orderIdFilter = parsed.searchParams.get("order_id");
      if (orderIdFilter?.startsWith("eq.")) {
        return jsonResponse({
          id: ORDER_ID,
          user_id: USER_ID,
        });
      }
    }

    if (url.includes("/rest/v1/order_notifications")) {
      if (method === "POST") {
        const body = init?.body ? JSON.parse(String(init.body)) : {};
        const row: CustomerNotificationRow = {
          id: "990e8400-e29b-41d4-a716-446655440060",
          user_id: body.user_id,
          order_id: body.order_id ?? null,
          type: body.type,
          title: body.title,
          message: body.message,
          is_read: false,
          created_at: "2026-07-05T14:00:00.000Z",
        };
        rows.set(row.id, row);
        inserts.push(row);
        return jsonResponse(row);
      }

      if (method === "PATCH") {
        const parsed = new URL(url);
        const idFilter = parsed.searchParams.get("id");
        const userFilter = parsed.searchParams.get("user_id");
        const isReadFilter = parsed.searchParams.get("is_read");
        const notificationId = idFilter?.startsWith("eq.") ? decodeURIComponent(idFilter.slice(3)) : null;
        const userId = userFilter?.startsWith("eq.") ? decodeURIComponent(userFilter.slice(3)) : null;

        if (notificationId) {
          const row = rows.get(notificationId);
          if (!row || row.user_id !== userId) {
            return jsonResponse(null, 200);
          }
          const updated = { ...row, is_read: true };
          rows.set(notificationId, updated);
          return jsonResponse(updated);
        }

        if (userId && isReadFilter === "eq.false") {
          const updatedRows: Array<{ id: string }> = [];
          for (const row of rows.values()) {
            if (row.user_id === userId && !row.is_read) {
              const updated = { ...row, is_read: true };
              rows.set(row.id, updated);
              updatedRows.push({ id: row.id });
            }
          }
          return jsonResponse(updatedRows);
        }
      }

      const parsed = new URL(url);
      const userFilter = parsed.searchParams.get("user_id");
      const userId = userFilter?.startsWith("eq.") ? decodeURIComponent(userFilter.slice(3)) : null;
      if (userId !== USER_ID) return jsonResponse([]);
      return jsonResponse(
        [...rows.values()].filter((row) => row.user_id === USER_ID).sort((a, b) => b.created_at.localeCompare(a.created_at)),
      );
    }

    return jsonResponse({ ok: true });
  }) as typeof fetch;

  return {
    getInserts: () => inserts,
  };
}

test("order submit creates order_created notification best-effort", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  const store = installNotificationStoreMock();

  await createOrderCreatedNotificationBestEffort({
    requestId: "req-order-created",
    userId: USER_ID,
    businessOrderId: "RZ-20260705-1001",
    publicOrderNumber: "RZM_0007",
  });

  const inserts = store.getInserts();
  assert.equal(inserts.length, 1);
  assert.equal(inserts[0]?.type, "order_created");
  assert.equal(inserts[0]?.title, "Заказ оформлен");
  assert.equal(inserts[0]?.message, "Ваш заказ RZM_0007 отправлен на проверку.");
  assert.equal(inserts[0]?.order_id, ORDER_ID);
});

test("change request creates change_request notification best-effort", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  const store = installNotificationStoreMock();

  await createChangeRequestNotificationBestEffort({
    requestId: "req-change-request",
    userId: USER_ID,
    orderId: ORDER_ID,
    publicOrderNumber: "RZM_0008",
  });

  const inserts = store.getInserts();
  assert.equal(inserts.length, 1);
  assert.equal(inserts[0]?.type, "change_request");
  assert.equal(inserts[0]?.title, "Запрос на изменение отправлен");
  assert.equal(inserts[0]?.message, "Ваш запрос по заказу RZM_0008 передан менеджеру.");
});

test("notification generation failure does not throw for primary helper", async () => {
  restoreEnvironment();
  setRequiredServerEnv();

  globalThis.fetch = (async () => jsonResponse({ message: "insert failed" }, 500)) as typeof fetch;

  await assert.doesNotReject(async () => {
    await createChangeRequestNotificationBestEffort({
      requestId: "req-change-request-fail",
      userId: USER_ID,
      orderId: ORDER_ID,
      publicOrderNumber: "RZM_0009",
    });
  });
});

test("mark one read returns 401 without bearer token", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();

  await notificationReadHandler(
    {
      method: "PATCH",
      headers: { origin: "http://localhost:5173" },
      body: { notificationId: NOTIFICATION_ID },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 401);
});

test("mark one read returns 404 for foreign notification", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installNotificationStoreMock();
  const { res, snapshot } = createMockResponse();

  await notificationReadHandler(
    {
      method: "PATCH",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: { notificationId: foreignNotificationRow.id },
    },
    res,
  );

  assert.equal(snapshot().statusCode, 404);
});

test("mark one read updates own notification and returns safe model", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installNotificationStoreMock();
  const { res, snapshot } = createMockResponse();

  await notificationReadHandler(
    {
      method: "PATCH",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: { notificationId: NOTIFICATION_ID },
    },
    res,
  );

  const body = snapshot().body as { ok: boolean; notification: { id: string; isRead: boolean } };
  assert.equal(snapshot().statusCode, 200);
  assert.equal(body.ok, true);
  assert.equal(body.notification.id, NOTIFICATION_ID);
  assert.equal(body.notification.isRead, true);
});

test("read-all requires auth", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  const { res, snapshot } = createMockResponse();

  await notificationsReadAllHandler(
    {
      method: "PATCH",
      headers: { origin: "http://localhost:5173" },
      body: null,
    },
    res,
  );

  assert.equal(snapshot().statusCode, 401);
});

test("read-all updates only current user unread notifications", async () => {
  restoreEnvironment();
  setRequiredServerEnv();
  installNotificationStoreMock();
  const { res, snapshot } = createMockResponse();

  await notificationsReadAllHandler(
    {
      method: "PATCH",
      headers: {
        origin: "http://localhost:5173",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: null,
    },
    res,
  );

  const body = snapshot().body as { ok: boolean; updatedCount: number };
  assert.equal(snapshot().statusCode, 200);
  assert.equal(body.ok, true);
  assert.equal(body.updatedCount, 1);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests().finally(() => {
  restoreEnvironment();
});
