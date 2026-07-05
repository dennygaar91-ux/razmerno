import { useCallback, useEffect, useMemo, useState } from "react";
import { useSessionContext } from "../auth/SessionProvider";
import { useAuth } from "../auth/useAuth";
import {
  fetchCustomerNotifications,
  markAllCustomerNotificationsRead,
  markCustomerNotificationRead,
} from "./notificationApi";
import type { CustomerNotification } from "./notificationTypes";

export type CustomerNotificationsLoadState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error"
  | "unauthorized";

export function useCustomerNotifications(enabled: boolean) {
  const { session } = useSessionContext();
  const { loading: authLoading } = useAuth();
  const [state, setState] = useState<CustomerNotificationsLoadState>("idle");
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [markingOneId, setMarkingOneId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const hasUnread = useMemo(
    () => notifications.some((notification) => !notification.isRead),
    [notifications],
  );

  const retry = useCallback(async () => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      setNotifications([]);
      setState("unauthorized");
      setErrorMessage("Войдите снова, чтобы открыть уведомления.");
      return;
    }

    setState("loading");
    setErrorMessage(null);

    const result = await fetchCustomerNotifications(accessToken);
    if (!result.ok) {
      setNotifications([]);
      if (result.status === 401) {
        setState("unauthorized");
        setErrorMessage("Сессия истекла. Войдите снова.");
      } else {
        setState("error");
        setErrorMessage(result.message);
      }
      return;
    }

    setNotifications(result.data);
    setState(result.data.length === 0 ? "empty" : "success");
  }, [session?.access_token]);

  const markOneAsRead = useCallback(
    async (notificationId: string) => {
      const accessToken = session?.access_token;
      if (!accessToken) {
        return { ok: false as const, message: "Сессия истекла. Войдите снова." };
      }

      setMarkingOneId(notificationId);
      const result = await markCustomerNotificationRead(accessToken, notificationId);
      setMarkingOneId(null);

      if (!result.ok) {
        return { ok: false as const, message: result.message };
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? result.data : notification,
        ),
      );
      return { ok: true as const, data: result.data };
    },
    [session?.access_token],
  );

  const markAllAsRead = useCallback(async () => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      return { ok: false as const, message: "Сессия истекла. Войдите снова." };
    }

    setMarkingAll(true);
    const result = await markAllCustomerNotificationsRead(accessToken);
    setMarkingAll(false);

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.isRead ? notification : { ...notification, isRead: true },
      ),
    );
    return { ok: true as const, updatedCount: result.updatedCount };
  }, [session?.access_token]);

  useEffect(() => {
    if (!enabled || authLoading) return;
    void retry();
  }, [authLoading, enabled, retry]);

  return {
    state,
    notifications,
    errorMessage,
    hasUnread,
    markingOneId,
    markingAll,
    retry,
    markOneAsRead,
    markAllAsRead,
  };
}
