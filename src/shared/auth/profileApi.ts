import type { CustomerProfile, CustomerProfilePatch, ProfileApiResult } from "./types";

const DEFAULT_PROFILE_API_URL = "/api/profile";

function getProfileApiUrl(): string {
  const configured = import.meta.env.VITE_PROFILE_API_URL?.trim();
  return configured || DEFAULT_PROFILE_API_URL;
}

async function requestProfile<T>(
  accessToken: string,
  init: RequestInit,
): Promise<ProfileApiResult<T>> {
  try {
    const response = await fetch(getProfileApiUrl(), {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; profile?: T; message?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось загрузить профиль.",
      };
    }

    if (!payload.profile) {
      return { ok: false, status: response.status, message: "Профиль не найден." };
    }

    return { ok: true, data: payload.profile };
  } catch {
    return { ok: false, message: "Сетевая ошибка при обращении к профилю." };
  }
}

export async function fetchCustomerProfile(accessToken: string): Promise<ProfileApiResult<CustomerProfile>> {
  return requestProfile<CustomerProfile>(accessToken, { method: "GET" });
}

export async function patchCustomerProfile(
  accessToken: string,
  patch: CustomerProfilePatch,
): Promise<ProfileApiResult<CustomerProfile>> {
  return requestProfile<CustomerProfile>(accessToken, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
