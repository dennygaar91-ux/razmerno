import { useCallback, useEffect, useState } from "react";
import { useSessionContext } from "../auth/SessionProvider";
import { useAuth } from "../auth/useAuth";
import { fetchCustomerWorkspace } from "./workspaceApi";
import type { CustomerWorkspace, CustomerWorkspaceProfile } from "./types";

export type CustomerWorkspaceLoadState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "unauthorized";

export function useCustomerWorkspace(enabled: boolean) {
  const { session } = useSessionContext();
  const { loading: authLoading } = useAuth();
  const [state, setState] = useState<CustomerWorkspaceLoadState>("idle");
  const [workspace, setWorkspace] = useState<CustomerWorkspace | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      setWorkspace(null);
      setState("unauthorized");
      setErrorMessage(null);
      return;
    }

    setState("loading");
    setErrorMessage(null);

    const result = await fetchCustomerWorkspace(accessToken);
    if (!result.ok) {
      setWorkspace(null);
      if (result.status === 401) {
        setState("unauthorized");
        setErrorMessage("Сессия истекла. Войдите снова.");
      } else {
        setState("error");
        setErrorMessage(result.message);
      }
      return;
    }

    setWorkspace(result.data);
    setState("success");
  }, [session?.access_token]);

  const updateProfile = useCallback((profile: CustomerWorkspaceProfile) => {
    setWorkspace((current) => (current ? { ...current, profile } : current));
  }, []);

  useEffect(() => {
    if (!enabled || authLoading) return;
    void reload();
  }, [authLoading, enabled, reload]);

  return {
    state,
    workspace,
    errorMessage,
    reload,
    updateProfile,
  };
}
