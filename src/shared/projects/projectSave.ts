import type { ConstructorSnapshot } from "../../static-pages/constructor/adapters/constructorPayload";
import {
  createCustomerProject,
  updateCustomerProject,
} from "./projectApi";
import {
  buildProjectCreateInputFromConstructor,
  buildProjectPatchInputFromConstructor,
} from "./projectSnapshot";
import type { ConstructorProject } from "./types";

export type ProjectSaveMode = "create" | "update";

export function resolveProjectSaveMode(currentProjectId: string | null | undefined): ProjectSaveMode {
  return currentProjectId ? "update" : "create";
}

export function getProjectServerSaveButtonLabel(
  mode: ProjectSaveMode,
  isSaving: boolean,
): string {
  if (isSaving) {
    return mode === "update" ? "Сохраняем изменения…" : "Сохраняем на сервер…";
  }
  return mode === "update" ? "Сохранить изменения" : "Сохранить на сервер";
}

export function getProjectServerSaveSuccessMessage(
  projectTitle: string,
  mode: ProjectSaveMode,
): string {
  return mode === "update"
    ? `Проект «${projectTitle}» обновлён на сервере.`
    : `Проект «${projectTitle}» сохранён на сервере.`;
}

type ProjectSaveClient = {
  createProject: typeof createCustomerProject;
  updateProject: typeof updateCustomerProject;
};

const defaultProjectSaveClient: ProjectSaveClient = {
  createProject: createCustomerProject,
  updateProject: updateCustomerProject,
};

export async function executeProjectServerSave(
  input: {
    accessToken: string;
    snapshot: ConstructorSnapshot;
    currentProjectId: string | null;
    existingProjectTitle?: string | null;
  },
  client: ProjectSaveClient = defaultProjectSaveClient,
): Promise<
  | { ok: true; data: ConstructorProject; mode: ProjectSaveMode }
  | { ok: false; message: string; status?: number; mode: ProjectSaveMode }
> {
  const mode = resolveProjectSaveMode(input.currentProjectId);

  if (mode === "update" && input.currentProjectId) {
    const result = await client.updateProject(
      input.accessToken,
      input.currentProjectId,
      buildProjectPatchInputFromConstructor(
        input.snapshot,
        input.existingProjectTitle ?? undefined,
      ),
    );

    if (!result.ok) {
      return { ok: false, message: result.message, status: result.status, mode };
    }

    return { ok: true, data: result.data, mode };
  }

  const result = await client.createProject(
    input.accessToken,
    buildProjectCreateInputFromConstructor(input.snapshot),
  );

  if (!result.ok) {
    return { ok: false, message: result.message, status: result.status, mode };
  }

  return { ok: true, data: result.data, mode };
}

export type ProjectServerSaveResult = Awaited<ReturnType<typeof executeProjectServerSave>>;

export function shouldKeepCurrentProjectIdAfterFailedSave(
  currentProjectId: string | null,
  failedMode: ProjectSaveMode,
): boolean {
  return Boolean(currentProjectId) && failedMode === "update";
}
