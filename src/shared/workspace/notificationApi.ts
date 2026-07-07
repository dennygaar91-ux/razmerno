import type {
  CustomerNotification,
  CustomerNotificationListApiResult,
  CustomerNotificationReadAllApiResult,
  CustomerNotificationReadApiResult,
  CustomerNotificationUnreadCountApiResult,
} from "./notificationTypes";

const DEFAULT_NOTIFICATIONS_API_URL = "/api/customer/notifications";
const DEFAULT_NOTIFICATION_READ_API_URL = "/api/customer/notification/read";
const DEFAULT_NOTIFICATIONS_READ_ALL_API_URL = "/api/customer/notifications/read-all";
const DEFAULT_NOTIFICATIONS_UNREAD_COUNT_API_URL = "/api/customer/notifications/unread-count";

function getNotificationsApiUrl(): string {
  const configured = import.meta.env.VITE_CUSTOMER_NOTIFICATIONS_API_URL?.trim();
  return configured || DEFAULT_NOTIFICATIONS_API_URL;
}

function getNotificationReadApiUrl(): string {
  const configured = import.meta.env.VITE_CUSTOMER_NOTIFICATION_READ_API_URL?.trim();
  return configured || DEFAULT_NOTIFICATION_READ_API_URL;
}

function getNotificationsReadAllApiUrl(): string {
  const configured = import.meta.env.VITE_CUSTOMER_NOTIFICATIONS_READ_ALL_API_URL?.trim();
  return configured || DEFAULT_NOTIFICATIONS_READ_ALL_API_URL;
}

function getNotificationsUnreadCountApiUrl(): string {
  const configured = import.meta.env.VITE_CUSTOMER_NOTIFICATIONS_UNREAD_COUNT_API_URL?.trim();
  return configured || DEFAULT_NOTIFICATIONS_UNREAD_COUNT_API_URL;
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

export async function markCustomerNotificationRead(
  accessToken: string,
  notificationId: string,
): Promise<CustomerNotificationReadApiResult> {
  try {
    const response = await fetch(getNotificationReadApiUrl(), {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ notificationId }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; notification?: CustomerNotification; message?: string }
      | null;

    if (!response.ok || !payload?.ok || !payload.notification) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось отметить уведомление прочитанным.",
      };
    }

    return { ok: true, data: payload.notification };
  } catch {
    return { ok: false, message: "Сетевая ошибка при обновлении уведомления." };
  }
}

export async function markAllCustomerNotificationsRead(
  accessToken: string,
): Promise<CustomerNotificationReadAllApiResult> {
  try {
    const response = await fetch(getNotificationsReadAllApiUrl(), {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; updatedCount?: number; message?: string }
      | null;

    if (!response.ok || !payload?.ok || typeof payload.updatedCount !== "number") {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось отметить все уведомления прочитанными.",
      };
    }

    return { ok: true, updatedCount: payload.updatedCount };
  } catch {
    return { ok: false, message: "Сетевая ошибка при обновлении уведомлений." };
  }
}

export async function fetchCustomerNotificationUnreadCount(
  accessToken: string,
): Promise<CustomerNotificationUnreadCountApiResult> {
  try {
    const response = await fetch(getNotificationsUnreadCountApiUrl(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; unreadCount?: number; message?: string }
      | null;

    if (!response.ok || !payload?.ok || typeof payload.unreadCount !== "number") {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось загрузить счётчик уведомлений.",
      };
    }

    return { ok: true, unreadCount: payload.unreadCount };
  } catch {
    return { ok: false, message: "Сетевая ошибка при загрузке счётчика уведомлений." };
  }
}
