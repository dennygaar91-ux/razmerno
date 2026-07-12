import type { CustomerWorkspace, CustomerWorkspaceApiResult } from "./types";

const DEFAULT_WORKSPACE_API_URL = "/api/customer/workspace";

function getWorkspaceApiUrl(): string {
  const configured = import.meta.env.VITE_CUSTOMER_WORKSPACE_API_URL?.trim();
  return configured || DEFAULT_WORKSPACE_API_URL;
}

export async function fetchCustomerWorkspace(accessToken: string): Promise<CustomerWorkspaceApiResult> {
  try {
    const response = await fetch(getWorkspaceApiUrl(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; workspace?: CustomerWorkspace; message?: string }
      | null;

    if (!response.ok || !payload?.ok || !payload.workspace) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось загрузить рабочую область.",
      };
    }

    return { ok: true, data: payload.workspace };
  } catch {
    return { ok: false, message: "Сетевая ошибка при загрузке рабочей области." };
  }
}
