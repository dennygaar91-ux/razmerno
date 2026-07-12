import { useCallback, useEffect, useState } from "react";
import { useSessionContext } from "../auth/SessionProvider";
import { useAuth } from "../auth/useAuth";
import { fetchCustomerNotificationUnreadCount } from "./notificationApi";

export type CustomerNotificationUnreadCountState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "unauthorized";

export function useCustomerNotificationUnreadCount(enabled: boolean) {
  const { session } = useSessionContext();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [state, setState] = useState<CustomerNotificationUnreadCountState>("idle");
  const [unreadCount, setUnreadCount] = useState(0);

  const reload = useCallback(async () => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      setUnreadCount(0);
      setState("unauthorized");
      return;
    }

    setState("loading");
    const result = await fetchCustomerNotificationUnreadCount(accessToken);
    if (!result.ok) {
      setUnreadCount(0);
      setState(result.status === 401 ? "unauthorized" : "error");
      return;
    }

    setUnreadCount(Math.max(0, result.unreadCount));
    setState("success");
  }, [session?.access_token]);

  useEffect(() => {
    if (!enabled || authLoading) return;
    if (!isAuthenticated) {
      setUnreadCount(0);
      setState("idle");
      return;
    }
    void reload();
  }, [authLoading, enabled, isAuthenticated, reload]);

  return {
    state,
    unreadCount,
    reload,
  };
}
