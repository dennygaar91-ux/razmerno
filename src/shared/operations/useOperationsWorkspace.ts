import { useCallback, useEffect, useState } from "react";
import { fetchOperationsWorkspace } from "./operationsApi";
import type { OperationsWorkspace, OperationsWorkspaceLoadState } from "./types";

export function useOperationsWorkspace(accessToken: string | null, enabled: boolean) {
  const [state, setState] = useState<OperationsWorkspaceLoadState>("idle");
  const [workspace, setWorkspace] = useState<OperationsWorkspace | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!accessToken) {
      setWorkspace(null);
      setState("unauthorized");
      setErrorMessage(null);
      return;
    }

    setState("loading");
    setErrorMessage(null);

    const result = await fetchOperationsWorkspace(accessToken);
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
  }, [accessToken]);

  useEffect(() => {
    if (!enabled) return;
    void reload();
  }, [enabled, reload]);

  return {
    state,
    workspace,
    errorMessage,
    reload,
  };
}
