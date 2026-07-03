import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  CUSTOMER_CHANGE_REQUEST_TYPE_OPTIONS,
  getCustomerChangeRequestStatusLabel,
  getCustomerChangeRequestSuccessMessage,
  getCustomerChangeRequestsEmptyMessage,
} from "../src/shared/workspace/changeRequestTypes";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

test("change request section exists on order detail", () => {
  const orderCard = readFileSync("src/static-pages/account/CustomerOrderDetailCard.tsx", "utf8");
  const section = readFileSync("src/static-pages/account/CustomerOrderChangeRequestsSection.tsx", "utf8");

  assert.match(orderCard, /CustomerOrderChangeRequestsSection/);
  assert.match(section, /Изменения заказа/);
});

test("empty state text exists", () => {
  const section = readFileSync("src/static-pages/account/CustomerOrderChangeRequestsSection.tsx", "utf8");
  assert.equal(getCustomerChangeRequestsEmptyMessage(), "Пока нет запросов на изменение заказа.");
  assert.match(section, /getCustomerChangeRequestsEmptyMessage/);
});

test("request button exists", () => {
  const section = readFileSync("src/static-pages/account/CustomerOrderChangeRequestsSection.tsx", "utf8");
  assert.match(section, /Запросить изменение/);
});

test("request type labels map to API values", () => {
  const section = readFileSync("src/static-pages/account/CustomerOrderChangeRequestsSection.tsx", "utf8");

  assert.deepEqual(
    CUSTOMER_CHANGE_REQUEST_TYPE_OPTIONS.map((option) => option.label),
    ["Размеры", "Материалы", "Комплектация", "Доставка", "Другое"],
  );
  assert.deepEqual(
    CUSTOMER_CHANGE_REQUEST_TYPE_OPTIONS.map((option) => option.value),
    ["dimensions", "materials", "configuration", "delivery", "other"],
  );
  assert.match(section, /CUSTOMER_CHANGE_REQUEST_TYPE_OPTIONS/);
});

test("empty message validation exists", () => {
  const section = readFileSync("src/static-pages/account/CustomerOrderChangeRequestsSection.tsx", "utf8");
  assert.match(section, /message\.trim\(\)/);
  assert.match(section, /Сообщение не может быть пустым/);
});

test("success message text exists", () => {
  const section = readFileSync("src/static-pages/account/CustomerOrderChangeRequestsSection.tsx", "utf8");
  assert.equal(getCustomerChangeRequestSuccessMessage(), "Запрос отправлен менеджеру.");
  assert.match(section, /getCustomerChangeRequestSuccessMessage/);
});

test("submitted status maps to customer label", () => {
  const section = readFileSync("src/static-pages/account/CustomerOrderChangeRequestsSection.tsx", "utf8");
  assert.equal(getCustomerChangeRequestStatusLabel("submitted"), "Отправлен");
  assert.match(section, /getCustomerChangeRequestStatusLabel/);
});

test("history renders safe fields only", () => {
  const section = readFileSync("src/static-pages/account/CustomerOrderChangeRequestsSection.tsx", "utf8");
  assert.match(section, /request\.message/);
  assert.match(section, /request\.createdAt/);
  assert.match(section, /request\.requestType/);
  assert.match(section, /request\.status/);
  assert.doesNotMatch(section, /user_id|userId|admin_notes|production_export|price_breakdown/i);
});

test("UI does not include forbidden actions", () => {
  const section = readFileSync("src/static-pages/account/CustomerOrderChangeRequestsSection.tsx", "utf8");
  assert.doesNotMatch(section, /approve/i);
  assert.doesNotMatch(section, /reject/i);
  assert.doesNotMatch(section, /Оплат/i);
  assert.doesNotMatch(section, /production/i);
  assert.doesNotMatch(section, /manager_notes/i);
});

test("API client sends Bearer token", () => {
  const api = readFileSync("src/shared/workspace/changeRequestApi.ts", "utf8");
  assert.match(api, /Authorization/);
  assert.match(api, /Bearer \$\{accessToken\}/);
  assert.match(api, /\/api\/customer\/change-request/);
  assert.match(api, /\/api\/customer\/change-requests/);
});

test("POST prepends request locally without full reload", () => {
  const hook = readFileSync("src/shared/workspace/useCustomerChangeRequests.ts", "utf8");
  const section = readFileSync("src/static-pages/account/CustomerOrderChangeRequestsSection.tsx", "utf8");

  assert.match(hook, /setChangeRequests\(\(current\) => \[result\.data, \.\.\.current\]\)/);
  assert.doesNotMatch(section, /window\.location\.reload|location\.reload/);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
