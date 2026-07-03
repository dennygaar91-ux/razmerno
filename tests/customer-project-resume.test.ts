import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildConfiguratorResumeUrl,
  isValidCustomerProjectId,
  parseProjectSnapshotDraft,
  readProjectResumeIdFromSearch,
  PROJECT_RESUME_QUERY_PARAM,
} from "../src/shared/projects/projectResume";
import {
  applyStoredConstructorDraftToStore,
  isStoredConstructorDraft,
} from "../src/static-pages/constructor/store/constructorDraft";
import { useConstructorStore } from "../src/static-pages/constructor/store/constructorStore";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const sampleProjectId = "550e8400-e29b-41d4-a716-446655440020";

test("buildConfiguratorResumeUrl uses projectId query param", () => {
  const url = buildConfiguratorResumeUrl(sampleProjectId);
  assert.equal(url, `/configurator?${PROJECT_RESUME_QUERY_PARAM}=${sampleProjectId}`);
});

test("readProjectResumeIdFromSearch validates uuid", () => {
  assert.equal(
    readProjectResumeIdFromSearch(`?${PROJECT_RESUME_QUERY_PARAM}=${sampleProjectId}`),
    sampleProjectId,
  );
  assert.equal(readProjectResumeIdFromSearch("?projectId=bad-id"), null);
  assert.equal(isValidCustomerProjectId(sampleProjectId), true);
  assert.equal(isValidCustomerProjectId("bad-id"), false);
});

test("parseProjectSnapshotDraft accepts stored constructor draft shape", () => {
  const parsed = parseProjectSnapshotDraft(
    {
      version: 1,
      draft: {
        version: 1,
        updatedAt: "2026-07-03T10:00:00.000Z",
        dimensions: [600, 2000, 600],
        furnitureType: "Шкаф",
        material: "Белый",
        sections: 2,
        filling: "shelves",
      },
    },
    "2026-07-03T10:00:00.000Z",
  );

  assert.ok(parsed);
  assert.equal(isStoredConstructorDraft(parsed), true);
});

test("parseProjectSnapshotDraft normalizes constructor draft without metadata", () => {
  const parsed = parseProjectSnapshotDraft(
    {
      version: 1,
      draft: {
        dimensions: [800, 2200, 600],
        furnitureType: "Шкаф",
        material: "Белый",
        sections: 3,
        filling: "drawers",
        handleless: true,
      },
    },
    "2026-07-03T11:00:00.000Z",
  );

  assert.ok(parsed);
  assert.equal(parsed?.sections, 3);
  assert.equal(parsed?.updatedAt, "2026-07-03T11:00:00.000Z");
});

test("parseProjectSnapshotDraft rejects invalid snapshot draft", () => {
  const parsed = parseProjectSnapshotDraft({ version: 1, draft: { invalid: true } });
  assert.equal(parsed, null);
});

test("applyStoredConstructorDraftToStore restores project draft into constructor store", () => {
  useConstructorStore.getState().reset();

  const draft = parseProjectSnapshotDraft(
    {
      version: 1,
      draft: {
        dimensions: [900, 2100, 550],
        furnitureType: "Шкаф",
        material: "Белый",
        sections: 2,
        filling: "shelves",
      },
    },
    "2026-07-03T12:00:00.000Z",
  );

  assert.ok(draft);
  applyStoredConstructorDraftToStore(draft);
  const state = useConstructorStore.getState();
  assert.equal(state.width, 900);
  assert.equal(state.height, 2100);
  assert.equal(state.depth, 550);
  assert.equal(state.sections, 2);
});

test("project GET API returns full project with snapshot", () => {
  const projectApi = readFileSync("api/project.ts", "utf8");
  assert.match(projectApi, /getConstructorProjectById/);
  assert.match(projectApi, /project: loaded\.project/);
});

test("cabinet projects section links to configurator resume url", () => {
  const cabinet = readFileSync("src/static-pages/account/CustomerAccountCabinet.tsx", "utf8");
  assert.match(cabinet, /buildConfiguratorResumeUrl/);
  assert.match(cabinet, /Открыть в конструкторе/);
});

test("Constructor3DPage wires project resume hook", () => {
  const page = readFileSync("src/static-pages/Constructor3DPage.tsx", "utf8");
  const hook = readFileSync("src/static-pages/constructor/hooks/useConstructorProjectResume.ts", "utf8");
  assert.match(page, /useConstructorProjectResume/);
  assert.match(hook, /getCustomerProject/);
  assert.match(hook, /applyStoredConstructorDraftToStore/);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
