import { useCallback, useEffect, useState } from "react";
import { useSessionContext } from "../auth/SessionProvider";
import { useAuth } from "../auth/useAuth";
import {
  createCustomerChangeRequest,
  fetchCustomerChangeRequests,
} from "./changeRequestApi";
import type {
  CustomerChangeRequest,
  CustomerChangeRequestCreateInput,
  CustomerChangeRequestType,
} from "./changeRequestTypes";

export type CustomerChangeRequestsLoadState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "unauthorized";

export function useCustomerChangeRequests(orderId: string | null, enabled: boolean) {
  const { session } = useSessionContext();
  const { loading: authLoading } = useAuth();
  const [state, setState] = useState<CustomerChangeRequestsLoadState>("idle");
  const [changeRequests, setChangeRequests] = useState<CustomerChangeRequest[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(async () => {
    const accessToken = session?.access_token;
    if (!orderId) {
      setChangeRequests([]);
      setState("error");
      setErrorMessage("Заказ не найден.");
      return;
    }

    if (!accessToken) {
      setChangeRequests([]);
      setState("unauthorized");
      setErrorMessage("Войдите снова, чтобы открыть запросы на изменение.");
      return;
    }

    setState("loading");
    setErrorMessage(null);

    const result = await fetchCustomerChangeRequests(accessToken, orderId);
    if (!result.ok) {
      setChangeRequests([]);
      if (result.status === 401) {
        setState("unauthorized");
        setErrorMessage("Сессия истекла. Войдите снова.");
      } else if (result.status === 404) {
        setState("error");
        setErrorMessage("Заказ не найден или недоступен.");
      } else {
        setState("error");
        setErrorMessage(result.message);
      }
      return;
    }

    setChangeRequests(result.data);
    setState("success");
  }, [orderId, session?.access_token]);

  const submitChangeRequest = useCallback(
    async (input: { requestType: CustomerChangeRequestType; message: string }) => {
      const accessToken = session?.access_token;
      if (!orderId) {
        return { ok: false as const, message: "Заказ не найден." };
      }

      if (!accessToken) {
        return { ok: false as const, message: "Сессия истекла. Войдите снова." };
      }

      setSubmitting(true);

      const payload: CustomerChangeRequestCreateInput = {
        orderId,
        requestType: input.requestType,
        message: input.message,
      };

      const result = await createCustomerChangeRequest(accessToken, payload);
      setSubmitting(false);

      if (!result.ok) {
        return { ok: false as const, message: result.message };
      }

      setChangeRequests((current) => [result.data, ...current]);
      setState("success");
      return { ok: true as const, data: result.data };
    },
    [orderId, session?.access_token],
  );

  useEffect(() => {
    if (!enabled || authLoading) return;
    void reload();
  }, [authLoading, enabled, reload]);

  return {
    state,
    changeRequests,
    errorMessage,
    submitting,
    reload,
    submitChangeRequest,
  };
}
