import assert from "node:assert/strict";

import projectHandler from "../api/project";
import projectsHandler from "../api/projects";
import {
  canCreateActiveProject,
  isProjectOwnedByUser,
  validateProjectCreateBody,
  validateProjectPatchBody,
} from "../api/_shared/constructor-project-validation";
import {
  isActiveProject,
  isValidProjectId,
  isValidProjectSnapshot,
  MAX_ACTIVE_PROJECTS_PER_USER,
} from "../api/_shared/constructor-project-types";
import {
  buildProjectCreateInputFromLocalDraft,
  shouldImportLocalDraftAfterAuth,
} from "../src/shared/projects/projectSnapshot";

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

function createMockResponse() {
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

const sampleSnapshot = {
  version: 1 as const,
  draft: {
    dimensions: [600, 2000, 600],
    furnitureType: "Шкаф",
    material: "Белый",
    sections: 2,
    filling: "shelves",
  },
};

test("validateProjectCreateBody accepts versioned snapshot", () => {
  const result = validateProjectCreateBody({
    title: "Мой шкаф",
    furniture_type: "wardrobe",
    snapshot: sampleSnapshot,
  });
  assert.equal(result.ok, true);
});

test("validateProjectCreateBody rejects invalid snapshot", () => {
  const result = validateProjectCreateBody({
    furniture_type: "wardrobe",
    snapshot: { draft: {} },
  });
  assert.equal(result.ok, false);
});

test("validateProjectPatchBody rejects empty patch", () => {
  const result = validateProjectPatchBody({});
  assert.equal(result.ok, false);
});

test("max 3 active projects policy", () => {
  assert.equal(canCreateActiveProject(0), true);
  assert.equal(canCreateActiveProject(2), true);
  assert.equal(canCreateActiveProject(3), false);
  assert.equal(MAX_ACTIVE_PROJECTS_PER_USER, 3);
});

test("archived project is not active", () => {
  assert.equal(isActiveProject({ archived_at: null }), true);
  assert.equal(isActiveProject({ archived_at: "2026-07-03T00:00:00.000Z" }), false);
  assert.equal(canCreateActiveProject(2), true);
});

test("project ownership check", () => {
  assert.equal(isProjectOwnedByUser("user-a", "user-a"), true);
  assert.equal(isProjectOwnedByUser("user-a", "user-b"), false);
});

test("project id validation", () => {
  assert.equal(isValidProjectId("not-a-uuid"), false);
  assert.equal(
    isValidProjectId("550e8400-e29b-41d4-a716-446655440000"),
    true,
  );
});

test("projects GET returns 401 without bearer token", async () => {
  const { res, snapshot } = createMockResponse();
  await projectsHandler(
    {
      method: "GET",
      headers: { origin: "http://localhost:5173" },
      body: null,
    },
    res,
  );
  const result = snapshot();
  assert.equal(result.statusCode, 401);
});

test("project GET returns 401 without bearer token", async () => {
  const { res, snapshot } = createMockResponse();
  await projectHandler(
    {
      method: "GET",
      headers: { origin: "http://localhost:5173" },
      query: { id: "550e8400-e29b-41d4-a716-446655440000" },
      body: null,
    },
    res,
  );
  const result = snapshot();
  assert.equal(result.statusCode, 401);
});

test("project GET rejects invalid id", async () => {
  const { res, snapshot } = createMockResponse();
  await projectHandler(
    {
      method: "GET",
      headers: { origin: "http://localhost:5173" },
      query: { id: "bad-id" },
      body: null,
    },
    res,
  );
  const result = snapshot();
  assert.equal(result.statusCode, 400);
});

test("isValidProjectSnapshot guards persisted payload shape", () => {
  assert.equal(isValidProjectSnapshot(sampleSnapshot), true);
  assert.equal(isValidProjectSnapshot({ version: 2, draft: {} }), false);
});

test("anonymous local draft import is triggered only after auth transition", () => {
  assert.equal(
    shouldImportLocalDraftAfterAuth({
      wasAuthenticated: false,
      isAuthenticated: true,
      hasLocalDraft: true,
    }),
    true,
  );
  assert.equal(
    shouldImportLocalDraftAfterAuth({
      wasAuthenticated: true,
      isAuthenticated: true,
      hasLocalDraft: true,
    }),
    false,
  );
  assert.equal(
    shouldImportLocalDraftAfterAuth({
      wasAuthenticated: false,
      isAuthenticated: true,
      hasLocalDraft: false,
    }),
    false,
  );
});

test("local draft can be converted into server project create payload", () => {
  const payload = buildProjectCreateInputFromLocalDraft({
    version: 1,
    updatedAt: "2026-07-03T00:00:00.000Z",
    dimensions: [600, 2000, 600],
    furnitureType: "Шкаф",
    material: "Белый",
    sections: 2,
    filling: "shelves",
  });
  assert.equal(payload.furniture_type, "wardrobe");
  assert.equal(payload.snapshot.version, 1);
  assert.equal(payload.title, "Шкаф");
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
