import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  formatFurnitureTypeLabel,
  formatWorkspaceDate,
  formatWorkspacePrice,
  getAccountDashboardTitle,
  getAccountOrdersEmptyMessage,
  getAccountProjectsEmptyMessage,
  isWorkspaceFullyEmpty,
} from "../src/shared/workspace/formatWorkspace";
import type { CustomerWorkspace } from "../src/shared/workspace/types";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const sampleWorkspace: CustomerWorkspace = {
  profile: {
    fullName: "Иван Петров",
    email: "ivan@example.com",
    phone: "+7 900 111-22-33",
  },
  projects: [
    {
      id: "550e8400-e29b-41d4-a716-446655440020",
      title: "Шкаф в спальню",
      furnitureType: "wardrobe",
      updatedAt: "2026-07-03T11:00:00.000Z",
      previewPath: null,
    },
  ],
  orders: [
    {
      id: "660e8400-e29b-41d4-a716-446655440030",
      publicOrderNumber: "RZM_0001",
      domainStatus: "Проверка",
      createdAt: "2026-07-03T12:00:00.000Z",
      totalPrice: 79_800,
      customerName: "Иван Петров",
      deliveryAddress: "Москва, ул. Пример, 1",
    },
  ],
  stats: {
    activeProjects: 1,
    orders: 1,
  },
};

test("formatWorkspacePrice uses RUB locale", () => {
  const formatted = formatWorkspacePrice(79_800);
  assert.match(formatted, /79/);
  assert.match(formatted, /800|79800|79\s?800/);
});

test("formatWorkspaceDate renders Russian date", () => {
  const formatted = formatWorkspaceDate("2026-07-03T12:00:00.000Z");
  assert.match(formatted, /2026/);
  assert.match(formatted, /июл/i);
});

test("formatFurnitureTypeLabel maps known furniture keys", () => {
  assert.equal(formatFurnitureTypeLabel("wardrobe"), "Шкаф");
  assert.equal(formatFurnitureTypeLabel("custom"), "custom");
});

test("empty state copy is defined for projects and orders", () => {
  assert.match(getAccountProjectsEmptyMessage(), /проект/i);
  assert.match(getAccountOrdersEmptyMessage(), /заказ/i);
});

test("isWorkspaceFullyEmpty detects empty workspace stats", () => {
  assert.equal(isWorkspaceFullyEmpty(sampleWorkspace), false);
  assert.equal(
    isWorkspaceFullyEmpty({
      ...sampleWorkspace,
      projects: [],
      orders: [],
      stats: { activeProjects: 0, orders: 0 },
    }),
    true,
  );
});

test("getAccountDashboardTitle greets by profile name", () => {
  assert.equal(getAccountDashboardTitle("Иван Петров"), "Здравствуйте, Иван Петров");
  assert.equal(getAccountDashboardTitle(" "), "Личный кабинет");
});

test("App routes /account to AccountPage", () => {
  const appSource = readFileSync("src/App.tsx", "utf8");
  assert.match(appSource, /pathname === "\/account"/);
  assert.match(appSource, /LazyAccountPage/);
  assert.match(appSource, /staticPage === "account"/);
});

test("AccountPage uses auth gate and cabinet sections", () => {
  const accountPage = readFileSync("src/static-pages/AccountPage.tsx", "utf8");
  const cabinet = readFileSync("src/static-pages/account/CustomerAccountCabinet.tsx", "utf8");
  const gate = readFileSync("src/static-pages/account/AccountPageGate.tsx", "utf8");

  assert.match(accountPage, /AccountPageGate/);
  assert.match(accountPage, /CustomerAccountCabinet/);
  assert.match(gate, /AuthModal/);
  assert.match(gate, /resolveCheckoutAuthGateDecision/);
  assert.match(cabinet, /Проекты/);
  assert.match(cabinet, /Заказы/);
  assert.match(cabinet, /CustomerProfileSection/);
  assert.match(cabinet, /publicOrderNumber/);
  assert.match(cabinet, /getAccountProjectsEmptyMessage/);
  assert.match(cabinet, /getAccountOrdersEmptyMessage/);
});

test("HeaderAuthControls links authenticated users to /account", () => {
  const headerAuth = readFileSync("src/shared/auth/HeaderAuthControls.tsx", "utf8");
  assert.match(headerAuth, /href="\/account"/);
  assert.match(headerAuth, /Выйти/);
  assert.match(headerAuth, /Войти/);
});

test("workspace API client keeps customer workspace contract", () => {
  const workspaceApi = readFileSync("src/shared/workspace/workspaceApi.ts", "utf8");
  assert.match(workspaceApi, /\/api\/customer\/workspace/);
  assert.match(workspaceApi, /Authorization/);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
