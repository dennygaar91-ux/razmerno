import type { OperationsWorkspace, OperationsWorkspaceApiResult } from "./types";

const DEFAULT_OPERATIONS_WORKSPACE_API_URL = "/api/operations/workspace";

function getOperationsWorkspaceApiUrl(): string {
  const configured = import.meta.env.VITE_OPERATIONS_WORKSPACE_API_URL?.trim();
  return configured || DEFAULT_OPERATIONS_WORKSPACE_API_URL;
}

export async function fetchOperationsWorkspace(accessToken: string): Promise<OperationsWorkspaceApiResult> {
  try {
    const response = await fetch(getOperationsWorkspaceApiUrl(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; workspace?: OperationsWorkspace; message?: string }
      | null;

    if (!response.ok || !payload?.ok || !payload.workspace) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось загрузить operations workspace.",
      };
    }

    return { ok: true, data: payload.workspace };
  } catch {
    return { ok: false, message: "Сетевая ошибка при загрузке operations workspace." };
  }
}
