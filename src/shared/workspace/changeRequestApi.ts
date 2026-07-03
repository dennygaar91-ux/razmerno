import type {
  CustomerChangeRequest,
  CustomerChangeRequestCreateApiResult,
  CustomerChangeRequestCreateInput,
  CustomerChangeRequestListApiResult,
} from "./changeRequestTypes";

const DEFAULT_CHANGE_REQUEST_API_URL = "/api/customer/change-request";
const DEFAULT_CHANGE_REQUESTS_API_URL = "/api/customer/change-requests";

function getChangeRequestApiUrl(): string {
  const configured = import.meta.env.VITE_CUSTOMER_CHANGE_REQUEST_API_URL?.trim();
  return configured || DEFAULT_CHANGE_REQUEST_API_URL;
}

function getChangeRequestsApiUrl(): string {
  const configured = import.meta.env.VITE_CUSTOMER_CHANGE_REQUESTS_API_URL?.trim();
  return configured || DEFAULT_CHANGE_REQUESTS_API_URL;
}

export async function fetchCustomerChangeRequests(
  accessToken: string,
  orderId: string,
): Promise<CustomerChangeRequestListApiResult> {
  try {
    const response = await fetch(
      `${getChangeRequestsApiUrl()}?orderId=${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; changeRequests?: CustomerChangeRequest[]; message?: string }
      | null;

    if (!response.ok || !payload?.ok || !Array.isArray(payload.changeRequests)) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось загрузить запросы на изменение.",
      };
    }

    return { ok: true, data: payload.changeRequests };
  } catch {
    return { ok: false, message: "Сетевая ошибка при загрузке запросов на изменение." };
  }
}

export async function createCustomerChangeRequest(
  accessToken: string,
  input: CustomerChangeRequestCreateInput,
): Promise<CustomerChangeRequestCreateApiResult> {
  try {
    const response = await fetch(getChangeRequestApiUrl(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        orderId: input.orderId,
        requestType: input.requestType,
        message: input.message,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; changeRequest?: CustomerChangeRequest; message?: string }
      | null;

    if (!response.ok || !payload?.ok || !payload.changeRequest) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось отправить запрос на изменение.",
      };
    }

    return { ok: true, data: payload.changeRequest };
  } catch {
    return { ok: false, message: "Сетевая ошибка при отправке запроса на изменение." };
  }
}
