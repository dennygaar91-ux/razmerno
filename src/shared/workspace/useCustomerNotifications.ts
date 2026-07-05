import { useCallback, useEffect, useState } from "react";
import { useSessionContext } from "../auth/SessionProvider";
import { useAuth } from "../auth/useAuth";
import { fetchCustomerNotifications } from "./notificationApi";
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

  useEffect(() => {
    if (!enabled || authLoading) return;
    void retry();
  }, [authLoading, enabled, retry]);

  return {
    state,
    notifications,
    errorMessage,
    retry,
  };
}
