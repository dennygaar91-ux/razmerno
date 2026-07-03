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
  executeProjectServerSave,
  shouldKeepCurrentProjectIdAfterFailedSave,
} from "../src/shared/projects/projectSave";
import { shouldRebindResumedProject } from "../src/static-pages/constructor/hooks/useConstructorProjectSync";
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

const sampleConstructorSnapshot = {
  furniture: "wardrobe" as const,
  width: 600,
  height: 2000,
  depth: 600,
  fill: "shelves" as const,
  sections: 2,
  compartments: 2,
  handleless: false,
  material: "white",
  facadeMaterial: "white",
  deliveryEnabled: false,
  assemblyEnabled: false,
  deliveryAddress: "",
  contact: { name: "", phone: "", email: "", company: "" },
  consent: false,
};

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
  const sync = readFileSync("src/static-pages/constructor/hooks/useConstructorProjectSync.ts", "utf8");
  assert.match(page, /useConstructorProjectResume/);
  assert.match(page, /useConstructorProjectSync\(snapshot, hasStoredDraft, resumedProject\)/);
  assert.match(hook, /getCustomerProject/);
  assert.match(hook, /applyStoredConstructorDraftToStore/);
  assert.match(sync, /executeProjectServerSave/);
  assert.match(sync, /currentProjectId/);
});

test("save after resume uses PATCH through executeProjectServerSave", async () => {
  const calls: string[] = [];
  const sampleProject = {
    id: sampleProjectId,
    user_id: "user-1",
    title: "Шкаф в спальню",
    snapshot: { version: 1 as const, draft: { dimensions: [600, 2000, 600], furnitureType: "Шкаф", material: "Белый", sections: 2, filling: "shelves" } },
    furniture_type: "wardrobe",
    preview_path: null,
    archived_at: null,
    created_at: "2026-07-03T10:00:00.000Z",
    updated_at: "2026-07-03T10:00:00.000Z",
  };

  const result = await executeProjectServerSave(
    {
      accessToken: "token",
      snapshot: sampleConstructorSnapshot,
      currentProjectId: sampleProjectId,
      existingProjectTitle: sampleProject.title,
    },
    {
      createProject: async () => {
        calls.push("POST");
        return { ok: false, message: "should not create" };
      },
      updateProject: async () => {
        calls.push("PATCH");
        return { ok: true, data: sampleProject };
      },
    },
  );

  assert.equal(result.ok, true);
  assert.deepEqual(calls, ["PATCH"]);
  if (result.ok) {
    assert.equal(result.mode, "update");
    assert.equal(result.data.id, sampleProjectId);
  }
});

test("save new project uses POST through executeProjectServerSave", async () => {
  const calls: string[] = [];
  const sampleProject = {
    id: "660e8400-e29b-41d4-a716-446655440030",
    user_id: "user-1",
    title: "Шкаф",
    snapshot: { version: 1 as const, draft: {} },
    furniture_type: "wardrobe",
    preview_path: null,
    archived_at: null,
    created_at: "2026-07-03T10:00:00.000Z",
    updated_at: "2026-07-03T10:00:00.000Z",
  };

  const result = await executeProjectServerSave(
    {
      accessToken: "token",
      snapshot: sampleConstructorSnapshot,
      currentProjectId: null,
    },
    {
      createProject: async () => {
        calls.push("POST");
        return { ok: true, data: sampleProject };
      },
      updateProject: async () => {
        calls.push("PATCH");
        return { ok: false, message: "should not patch" };
      },
    },
  );

  assert.equal(result.ok, true);
  assert.deepEqual(calls, ["POST"]);
  if (result.ok) {
    assert.equal(result.mode, "create");
  }
});

test("failed PATCH keeps current project id semantics", () => {
  assert.equal(shouldKeepCurrentProjectIdAfterFailedSave(sampleProjectId, "update"), true);
  assert.equal(shouldKeepCurrentProjectIdAfterFailedSave(null, "create"), false);
});

test("resume-save path does not call POST when current project id is set", async () => {
  const syncSource = readFileSync("src/static-pages/constructor/hooks/useConstructorProjectSync.ts", "utf8");
  assert.match(syncSource, /executeProjectServerSave/);
  assert.match(syncSource, /shouldKeepCurrentProjectIdAfterFailedSave/);
  assert.doesNotMatch(syncSource, /createCustomerProject\(\s*accessToken,\s*buildProjectCreateInputFromConstructor/);
});

test("constructor draft row shows update copy for existing server project", () => {
  const draftRow = readFileSync("src/static-pages/constructor/components/ConstructorDraftRow.tsx", "utf8");
  const projectSave = readFileSync("src/shared/projects/projectSave.ts", "utf8");
  assert.match(draftRow, /hasExistingServerProject/);
  assert.match(draftRow, /getProjectServerSaveButtonLabel/);
  assert.match(projectSave, /Сохранить изменения/);
  assert.match(projectSave, /Сохранить на сервер/);
});

test("reset after resume clears server project identity and next save uses POST", async () => {
  const calls: string[] = [];
  const sampleProject = {
    id: sampleProjectId,
    user_id: "user-1",
    title: "Шкаф в спальню",
    snapshot: { version: 1 as const, draft: { dimensions: [600, 2000, 600], furnitureType: "Шкаф", material: "Белый", sections: 2, filling: "shelves" } },
    furniture_type: "wardrobe",
    preview_path: null,
    archived_at: null,
    created_at: "2026-07-03T10:00:00.000Z",
    updated_at: "2026-07-03T10:00:00.000Z",
  };

  assert.equal(
    shouldRebindResumedProject({
      detachedFromResumedProjectId: sampleProjectId,
      resumedProjectId: sampleProjectId,
    }),
    false,
  );
  assert.equal(
    shouldRebindResumedProject({
      detachedFromResumedProjectId: sampleProjectId,
      resumedProjectId: "660e8400-e29b-41d4-a716-446655440030",
    }),
    true,
  );

  const page = readFileSync("src/static-pages/Constructor3DPage.tsx", "utf8");
  const sync = readFileSync("src/static-pages/constructor/hooks/useConstructorProjectSync.ts", "utf8");
  assert.match(page, /handleResetConfirm/);
  assert.match(page, /clearServerProjectIdentity/);
  assert.match(sync, /clearServerProjectIdentity/);
  assert.match(sync, /detachedFromResumedProjectIdRef/);

  const result = await executeProjectServerSave(
    {
      accessToken: "token",
      snapshot: sampleConstructorSnapshot,
      currentProjectId: null,
      existingProjectTitle: sampleProject.title,
    },
    {
      createProject: async () => {
        calls.push("POST");
        return { ok: true, data: { ...sampleProject, id: "660e8400-e29b-41d4-a716-446655440030" } };
      },
      updateProject: async () => {
        calls.push("PATCH");
        return { ok: false, message: "should not patch after reset" };
      },
    },
  );

  assert.equal(result.ok, true);
  assert.deepEqual(calls, ["POST"]);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
