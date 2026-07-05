import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getCustomerNotificationReadLabel,
  getCustomerNotificationTypeLabel,
  getCustomerNotificationsEmptyMessage,
  getCustomerNotificationsErrorMessage,
} from "../src/shared/workspace/notificationTypes";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

test("notification section exists in account cabinet", () => {
  const cabinet = readFileSync("src/static-pages/account/CustomerAccountCabinet.tsx", "utf8");
  const section = readFileSync("src/static-pages/account/CustomerNotificationsSection.tsx", "utf8");

  assert.match(cabinet, /CustomerNotificationsSection/);
  assert.match(section, /Уведомления/);
  assert.match(cabinet, /AccountSummaryCards[\s\S]*CustomerNotificationsSection[\s\S]*AccountProjectsSection/);
});

test("empty state text exists", () => {
  const section = readFileSync("src/static-pages/account/CustomerNotificationsSection.tsx", "utf8");
  assert.equal(getCustomerNotificationsEmptyMessage(), "Пока уведомлений нет.");
  assert.match(section, /getCustomerNotificationsEmptyMessage/);
  assert.match(section, /state === "empty"/);
});

test("loading state exists", () => {
  const section = readFileSync("src/static-pages/account/CustomerNotificationsSection.tsx", "utf8");
  assert.match(section, /state === "loading"/);
  assert.match(section, /Загружаем уведомления/);
});

test("retry button exists and calls retry", () => {
  const section = readFileSync("src/static-pages/account/CustomerNotificationsSection.tsx", "utf8");
  const hook = readFileSync("src/shared/workspace/useCustomerNotifications.ts", "utf8");

  assert.match(section, /Повторить/);
  assert.match(section, /void retry\(\)/);
  assert.match(hook, /retry/);
  assert.match(section, /getCustomerNotificationsErrorMessage/);
  assert.equal(getCustomerNotificationsErrorMessage(), "Не удалось загрузить уведомления.");
});

test("notification type labels map to API values", () => {
  const section = readFileSync("src/static-pages/account/CustomerNotificationsSection.tsx", "utf8");

  assert.equal(getCustomerNotificationTypeLabel("order_created"), "Заказ создан");
  assert.equal(getCustomerNotificationTypeLabel("order_updated"), "Заказ обновлён");
  assert.equal(getCustomerNotificationTypeLabel("change_request"), "Запрос на изменение");
  assert.equal(getCustomerNotificationTypeLabel("system"), "Системное уведомление");
  assert.match(section, /getCustomerNotificationTypeLabel/);
});

test("read and unread rendering exists", () => {
  const section = readFileSync("src/static-pages/account/CustomerNotificationsSection.tsx", "utf8");

  assert.equal(getCustomerNotificationReadLabel(false), "Непрочитано");
  assert.equal(getCustomerNotificationReadLabel(true), "Прочитано");
  assert.match(section, /rzm-account-notification-item--unread/);
  assert.match(section, /rzm-account-notification-item--read/);
  assert.match(section, /notification\.isRead/);
  assert.match(section, /getCustomerNotificationReadLabel/);
});

test("API client sends Bearer token", () => {
  const api = readFileSync("src/shared/workspace/notificationApi.ts", "utf8");

  assert.match(api, /Authorization/);
  assert.match(api, /Bearer \$\{accessToken\}/);
  assert.match(api, /\/api\/customer\/notifications/);
  assert.match(api, /fetchCustomerNotifications/);
});

test("no mark-as-read UI", () => {
  const section = readFileSync("src/static-pages/account/CustomerNotificationsSection.tsx", "utf8");
  const hook = readFileSync("src/shared/workspace/useCustomerNotifications.ts", "utf8");
  const api = readFileSync("src/shared/workspace/notificationApi.ts", "utf8");

  assert.doesNotMatch(section, /markAsRead|mark-as-read|mark_read|Прочитать|Отметить/i);
  assert.doesNotMatch(hook, /PATCH|POST|markAsRead|isRead\s*:/);
  assert.doesNotMatch(api, /PATCH|POST/);
});

test("no bell UI", () => {
  const section = readFileSync("src/static-pages/account/CustomerNotificationsSection.tsx", "utf8");
  const cabinet = readFileSync("src/static-pages/account/CustomerAccountCabinet.tsx", "utf8");

  assert.doesNotMatch(section, /notification-bell|header-bell|unread-badge|🔔/i);
  assert.doesNotMatch(cabinet, /notification-bell|header-bell|unread-badge|🔔/i);
});

test("no realtime or polling", () => {
  const hook = readFileSync("src/shared/workspace/useCustomerNotifications.ts", "utf8");
  const section = readFileSync("src/static-pages/account/CustomerNotificationsSection.tsx", "utf8");

  assert.doesNotMatch(hook, /setInterval|setTimeout|websocket|WebSocket|EventSource|polling|subscribe/i);
  assert.doesNotMatch(section, /setInterval|setTimeout|websocket|WebSocket|EventSource|polling|subscribe/i);
});

test("no forbidden buttons or actions", () => {
  const section = readFileSync("src/static-pages/account/CustomerNotificationsSection.tsx", "utf8");

  assert.doesNotMatch(section, /approve|reject|Оплат|manager_notes|production_export|price_breakdown/i);
  assert.doesNotMatch(section, /user_id|userId|admin_notes/i);
  assert.match(section, /notification\.title/);
  assert.match(section, /notification\.message/);
  assert.match(section, /notification\.createdAt/);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
