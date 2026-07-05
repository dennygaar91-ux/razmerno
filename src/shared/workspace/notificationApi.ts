import type { CustomerNotification, CustomerNotificationListApiResult } from "./notificationTypes";

const DEFAULT_NOTIFICATIONS_API_URL = "/api/customer/notifications";

function getNotificationsApiUrl(): string {
  const configured = import.meta.env.VITE_CUSTOMER_NOTIFICATIONS_API_URL?.trim();
  return configured || DEFAULT_NOTIFICATIONS_API_URL;
}

export async function fetchCustomerNotifications(
  accessToken: string,
): Promise<CustomerNotificationListApiResult> {
  try {
    const response = await fetch(getNotificationsApiUrl(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; notifications?: CustomerNotification[]; message?: string }
      | null;

    if (!response.ok || !payload?.ok || !Array.isArray(payload.notifications)) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось загрузить уведомления.",
      };
    }

    return { ok: true, data: payload.notifications };
  } catch {
    return { ok: false, message: "Сетевая ошибка при загрузке уведомлений." };
  }
}
