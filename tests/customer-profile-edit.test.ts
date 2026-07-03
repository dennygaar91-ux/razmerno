import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import profileHandler from "../api/profile";
import { validateCustomerProfilePatch } from "../api/_shared/customer-profile";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

test("profile section supports view and edit modes", () => {
  const section = readFileSync("src/static-pages/account/CustomerProfileSection.tsx", "utf8");
  const cabinet = readFileSync("src/static-pages/account/CustomerAccountCabinet.tsx", "utf8");

  assert.match(section, /Редактировать/);
  assert.match(section, /Сохранить/);
  assert.match(section, /Отмена/);
  assert.match(section, /readOnly/);
  assert.match(section, /patchCustomerProfile/);
  assert.match(cabinet, /CustomerProfileSection/);
  assert.match(cabinet, /onProfileUpdated=\{updateProfile\}/);
});

test("profile edit sends only full_name and phone to PATCH API", () => {
  const section = readFileSync("src/static-pages/account/CustomerProfileSection.tsx", "utf8");
  const profileApi = readFileSync("src/shared/auth/profileApi.ts", "utf8");

  assert.match(
    section,
    /patchCustomerProfile\(accessToken, \{\s*full_name: trimmedName,\s*phone: phone\.trim\(\) \|\| null,\s*\}\)/,
  );
  assert.match(profileApi, /PATCH/);
  assert.match(profileApi, /\/api\/profile/);
});

test("profile PATCH API rejects email changes", async () => {
  const state = { statusCode: 200, body: null as unknown };
  const res = {
    setHeader() {},
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

  await profileHandler(
    {
      method: "PATCH",
      headers: {
        origin: "http://localhost:5173",
        authorization: "Bearer test-token",
      },
      body: { email: "new@example.com" },
    },
    res,
  );

  assert.equal(state.statusCode, 400);
  const body = state.body as { ok: boolean; message: string };
  assert.equal(body.ok, false);
  assert.match(body.message, /Email cannot be changed/i);
});

test("validateCustomerProfilePatch accepts editable profile fields", () => {
  const result = validateCustomerProfilePatch({
    full_name: "Мария Смирнова",
    phone: "+7 901 222-33-44",
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.patch.full_name, "Мария Смирнова");
    assert.equal(result.patch.phone, "+7 901 222-33-44");
  }
});

test("workspace hook exposes updateProfile for local cabinet refresh", () => {
  const hook = readFileSync("src/shared/workspace/useCustomerWorkspace.ts", "utf8");
  assert.match(hook, /updateProfile/);
  assert.match(hook, /setWorkspace\(\(current\)/);
});

test("profile edit UI has no out-of-scope actions", () => {
  const section = readFileSync("src/static-pages/account/CustomerProfileSection.tsx", "utf8");

  assert.doesNotMatch(section, /Оплат/i);
  assert.doesNotMatch(section, /Отменить заказ/i);
  assert.doesNotMatch(section, /verification/i);
  assert.doesNotMatch(section, /password/i);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
