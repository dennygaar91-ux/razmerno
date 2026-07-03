import { useCallback, useEffect, useState } from "react";
import { useSessionContext } from "../auth/SessionProvider";
import { useAuth } from "../auth/useAuth";
import { fetchCustomerOrderDetail } from "./orderDetailApi";
import type { CustomerOrderDetail } from "./orderDetailTypes";

export type CustomerOrderDetailLoadState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "not_found"
  | "unauthorized";

export function useCustomerOrderDetail(orderId: string | null, enabled: boolean) {
  const { session } = useSessionContext();
  const { loading: authLoading } = useAuth();
  const [state, setState] = useState<CustomerOrderDetailLoadState>("idle");
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const accessToken = session?.access_token;
    if (!orderId) {
      setOrder(null);
      setState("not_found");
      setErrorMessage("Заказ не найден.");
      return;
    }

    if (!accessToken) {
      setOrder(null);
      setState("unauthorized");
      setErrorMessage("Войдите снова, чтобы открыть заказ.");
      return;
    }

    setState("loading");
    setErrorMessage(null);

    const result = await fetchCustomerOrderDetail(accessToken, orderId);
    if (!result.ok) {
      setOrder(null);
      if (result.status === 401) {
        setState("unauthorized");
        setErrorMessage("Сессия истекла. Войдите снова.");
      } else if (result.status === 404) {
        setState("not_found");
        setErrorMessage("Заказ не найден или недоступен.");
      } else {
        setState("error");
        setErrorMessage(result.message);
      }
      return;
    }

    setOrder(result.data);
    setState("success");
  }, [orderId, session?.access_token]);

  useEffect(() => {
    if (!enabled || authLoading) return;
    void reload();
  }, [authLoading, enabled, reload]);

  return {
    state,
    order,
    errorMessage,
    reload,
  };
}
