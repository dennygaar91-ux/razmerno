import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import profileHandler from "../api/profile";
import { validateCustomerProfilePatch } from "../api/_shared/customer-profile";
import { extractBearerToken } from "../api/_shared/customer-cors";
import {
  isProductionAuthMisconfigured,
  resolveCheckoutAuthGateDecision,
  resolveCheckoutSubmitAfterAuth,
  shouldRequireAuthBeforeCheckoutSubmit,
  shouldRestoreAnonymousConstructorState,
} from "../src/shared/auth/checkoutAuthGate";
import { isCustomerAuthConfigured } from "../src/shared/auth/supabaseBrowser";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

type MockResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
};

function createMockResponse(): {
  res: {
    setHeader(name: string, value: string): void;
    status(code: number): { json(payload: unknown): void; end(): void };
  };
  snapshot: () => MockResponse;
} {
  const state: MockResponse = { statusCode: 200, headers: {}, body: null };
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
  return {
    res,
    snapshot: () => ({ ...state, headers: { ...state.headers } }),
  };
}

test("validateCustomerProfilePatch rejects email changes", () => {
  const result = validateCustomerProfilePatch({ email: "new@example.com" });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.message, /Email cannot be changed/i);
  }
});

test("validateCustomerProfilePatch accepts full_name and phone edits", () => {
  const result = validateCustomerProfilePatch({
    full_name: "Иван Иванов",
    phone: "+7 900 000-00-00",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.patch.full_name, "Иван Иванов");
    assert.equal(result.patch.phone, "+7 900 000-00-00");
  }
});

test("validateCustomerProfilePatch reserves verification extension point", () => {
  const result = validateCustomerProfilePatch({ verification_code: "1234" });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.message, /verification/i);
  }
});

test("extractBearerToken parses Authorization header", () => {
  assert.equal(
    extractBearerToken({
      headers: { authorization: "Bearer test-token" },
      body: null,
    }),
    "test-token",
  );
  assert.equal(
    extractBearerToken({
      headers: { authorization: "Basic abc" },
      body: null,
    }),
    null,
  );
});

test("checkout auth gate requires auth only when configured and guest", () => {
  assert.equal(
    shouldRequireAuthBeforeCheckoutSubmit({ isAuthConfigured: true, isAuthenticated: false }),
    true,
  );
  assert.equal(
    shouldRequireAuthBeforeCheckoutSubmit({ isAuthConfigured: true, isAuthenticated: true }),
    false,
  );
  assert.equal(
    shouldRequireAuthBeforeCheckoutSubmit({ isAuthConfigured: false, isAuthenticated: false }),
    false,
  );
});

test("production auth policy blocks checkout when client auth env is missing", () => {
  assert.equal(
    resolveCheckoutAuthGateDecision({
      isProduction: true,
      isAuthConfigured: false,
      isAuthenticated: false,
    }),
    "blocked_misconfigured",
  );
  assert.equal(
    isProductionAuthMisconfigured({ isProduction: true, isAuthConfigured: false }),
    true,
  );
});

test("development auth policy allows checkout without client auth env", () => {
  assert.equal(
    resolveCheckoutAuthGateDecision({
      isProduction: false,
      isAuthConfigured: false,
      isAuthenticated: false,
    }),
    "submit",
  );
  assert.equal(
    isProductionAuthMisconfigured({ isProduction: false, isAuthConfigured: false }),
    false,
  );
});

test("legacy and primary constructors share checkout auth gate hook", () => {
  const source3d = readFileSync("src/static-pages/Constructor3DPage.tsx", "utf8");
  const sourceLegacy = readFileSync("src/static-pages/ConstructorPage.tsx", "utf8");
  const hookSource = readFileSync("src/shared/auth/useCheckoutAuthGate.tsx", "utf8");

  assert.match(source3d, /useCheckoutAuthGate/);
  assert.match(sourceLegacy, /useCheckoutAuthGate/);
  assert.match(hookSource, /resolveCheckoutAuthGateDecision/);
  assert.match(hookSource, /blocked_misconfigured/);
});

test("resolveCheckoutSubmitAfterAuth resumes pending submit after authentication", () => {
  assert.equal(
    resolveCheckoutSubmitAfterAuth({ pendingSubmit: true, isAuthenticated: true }),
    "submit",
  );
  assert.equal(
    resolveCheckoutSubmitAfterAuth({ pendingSubmit: true, isAuthenticated: false }),
    "idle",
  );
});

test("anonymous constructor state remains after auth transition", () => {
  assert.equal(
    shouldRestoreAnonymousConstructorState({ hadSessionBeforeAuth: false, isAuthenticated: true }),
    true,
  );
  assert.equal(
    shouldRestoreAnonymousConstructorState({ hadSessionBeforeAuth: true, isAuthenticated: true }),
    false,
  );
});

test("profile GET returns 401 without bearer token", async () => {
  const { res, snapshot } = createMockResponse();
  await profileHandler(
    {
      method: "GET",
      headers: { origin: "http://localhost:5173" },
      body: null,
    },
    res,
  );
  const result = snapshot();
  assert.equal(result.statusCode, 401);
  assert.deepEqual(result.body, { ok: false, message: "Требуется авторизация." });
});

test("profile GET returns 401 for malformed Authorization header", async () => {
  const { res, snapshot } = createMockResponse();
  await profileHandler(
    {
      method: "GET",
      headers: { origin: "http://localhost:5173", authorization: "Token malformed" },
      body: null,
    },
    res,
  );
  const result = snapshot();
  assert.equal(result.statusCode, 401);
  assert.equal((result.body as { ok: boolean }).ok, false);
});

test("profile PATCH rejects email in request body", async () => {
  const { res, snapshot } = createMockResponse();
  await profileHandler(
    {
      method: "PATCH",
      headers: {
        origin: "http://localhost:5173",
        authorization: "Bearer fake-token",
      },
      body: { email: "new@example.com" },
    },
    res,
  );
  const result = snapshot();
  assert.equal(result.statusCode, 400);
  assert.equal((result.body as { ok: boolean }).ok, false);
});

test("isCustomerAuthConfigured is false without Vite env", () => {
  assert.equal(isCustomerAuthConfigured(), false);
});

async function run() {
  let passed = 0;
  for (const item of tests) {
    await item.run();
    passed += 1;
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${passed} passed`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
