import type {
  ConstructorProject,
  ConstructorProjectCreateInput,
  ConstructorProjectPatchInput,
  ProjectApiResult,
} from "./types";

const DEFAULT_PROJECTS_API_URL = "/api/projects";
const DEFAULT_PROJECT_API_URL = "/api/project";

function getProjectsApiUrl(): string {
  const configured = import.meta.env.VITE_PROJECTS_API_URL?.trim();
  return configured || DEFAULT_PROJECTS_API_URL;
}

function getProjectApiUrl(): string {
  const configured = import.meta.env.VITE_PROJECT_API_URL?.trim();
  return configured || DEFAULT_PROJECT_API_URL;
}

async function requestProjects<T>(
  accessToken: string,
  url: string,
  init: RequestInit,
): Promise<ProjectApiResult<T>> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; projects?: T; project?: T; message?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось выполнить запрос к проектам.",
      };
    }

    const data = (payload.projects ?? payload.project) as T | undefined;
    if (data === undefined) {
      return { ok: false, status: response.status, message: "Пустой ответ сервера проектов." };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, message: "Сетевая ошибка при обращении к проектам." };
  }
}

export async function listCustomerProjects(
  accessToken: string,
  options?: { includeArchived?: boolean },
): Promise<ProjectApiResult<ConstructorProject[]>> {
  const query = options?.includeArchived ? "?includeArchived=1" : "";
  return requestProjects<ConstructorProject[]>(accessToken, `${getProjectsApiUrl()}${query}`, {
    method: "GET",
  });
}

export async function createCustomerProject(
  accessToken: string,
  input: ConstructorProjectCreateInput,
): Promise<ProjectApiResult<ConstructorProject>> {
  return requestProjects<ConstructorProject>(accessToken, getProjectsApiUrl(), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCustomerProject(
  accessToken: string,
  projectId: string,
): Promise<ProjectApiResult<ConstructorProject>> {
  return requestProjects<ConstructorProject>(
    accessToken,
    `${getProjectApiUrl()}?id=${encodeURIComponent(projectId)}`,
    { method: "GET" },
  );
}

export async function updateCustomerProject(
  accessToken: string,
  projectId: string,
  patch: ConstructorProjectPatchInput,
): Promise<ProjectApiResult<ConstructorProject>> {
  return requestProjects<ConstructorProject>(
    accessToken,
    `${getProjectApiUrl()}?id=${encodeURIComponent(projectId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    },
  );
}

export async function archiveCustomerProject(
  accessToken: string,
  projectId: string,
): Promise<ProjectApiResult<ConstructorProject>> {
  return requestProjects<ConstructorProject>(
    accessToken,
    `${getProjectApiUrl()}?id=${encodeURIComponent(projectId)}`,
    { method: "DELETE" },
  );
}
