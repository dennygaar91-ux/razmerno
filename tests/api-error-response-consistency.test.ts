import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import profileHandler from "../api/profile";
import workspaceHandler from "../api/customer/workspace";
import operationsWorkspaceHandler from "../api/operations/workspace";
import { CUSTOMER_UNAUTHORIZED_MESSAGE } from "../api/_shared/customer-api-auth";
import { createAdminSessionToken } from "../api/_shared/admin-auth";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const ADMIN_API_KEY = "test-admin-api-key-with-minimum-length";
const ORIGINAL_ENV = { ...process.env };

function restoreEnvironment() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
}

function setCustomerEnv() {
  process.env.ALLOWED_ORIGINS = "http://localhost:5173,https://razmerno.ru";
  process.env.SUPABASE_URL = "https://supabase.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
}

function setOperationsEnv() {
  process.env.ADMIN_API_KEY = ADMIN_API_KEY;
  process.env.SUPABASE_URL = "https://supabase.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
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

function assertSafeErrorBody(body: unknown, label: string) {
  const serialized = JSON.stringify(body);
  assert.match(serialized, /"ok":false/);
  assert.match(serialized, /"message":/);
  assert.doesNotMatch(serialized, /stack|SUPABASE_SERVICE_ROLE_KEY|ADMIN_API_KEY|Invalid JWT/i);
}

test("customer profile GET uses ok/message envelope on 401", async () => {
  const { res, snapshot } = createMockResponse();
  await profileHandler({ method: "GET", headers: { origin: "http://localhost:5173" }, body: null }, res);
  const result = snapshot();
  assert.equal(result.statusCode, 401);
  assert.deepEqual(result.body, { ok: false, message: CUSTOMER_UNAUTHORIZED_MESSAGE });
  assertSafeErrorBody(result.body, "customer profile 401");
});

test("customer workspace GET uses ok/message envelope on 401", async () => {
  setCustomerEnv();
  const { res, snapshot } = createMockResponse();
  await workspaceHandler(
    { method: "GET", headers: { origin: "http://localhost:5173" }, body: null },
    res,
  );
  const result = snapshot();
  assert.equal(result.statusCode, 401);
  assert.deepEqual(result.body, { ok: false, message: CUSTOMER_UNAUTHORIZED_MESSAGE });
  assertSafeErrorBody(result.body, "customer workspace 401");
});

test("operations workspace GET uses ok/message envelope on 401", async () => {
  setOperationsEnv();
  const { res, snapshot } = createMockResponse();
  await operationsWorkspaceHandler({ method: "GET", headers: {}, body: null }, res);
  const result = snapshot();
  assert.equal(result.statusCode, 401);
  assert.deepEqual(result.body, { ok: false, message: "Unauthorized" });
  assertSafeErrorBody(result.body, "operations workspace 401");
});

test("operations workspace GET uses ok/message envelope on unsupported method", async () => {
  setOperationsEnv();
  const token = createAdminSessionToken(Date.now());
  const { res, snapshot } = createMockResponse();
  await operationsWorkspaceHandler(
    { method: "POST", headers: { authorization: `Bearer ${token}` }, body: null },
    res,
  );
  const result = snapshot();
  assert.equal(result.statusCode, 405);
  assertSafeErrorBody(result.body, "operations workspace 405");
});

test("representative API handlers share ok/message error envelope contract", () => {
  const customerAuth = readFileSync("api/_shared/customer-api-auth.ts", "utf8");
  const adminAuth = readFileSync("api/_shared/admin-auth.ts", "utf8");
  const customerWorkspace = readFileSync("api/customer/workspace.ts", "utf8");
  const operationsWorkspace = readFileSync("api/operations/workspace.ts", "utf8");

  assert.match(customerAuth, /ok: false, message:/);
  assert.match(adminAuth, /ok: false as const, status: 401, message: 'Unauthorized'/);
  assert.match(customerWorkspace, /ok: false, message:/);
  assert.match(operationsWorkspace, /auth\.status\)\.json\(\{ ok: false, message: auth\.message \}\)/);
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
