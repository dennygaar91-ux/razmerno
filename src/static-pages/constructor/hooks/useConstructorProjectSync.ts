import { useCallback, useEffect, useRef, useState } from "react";
import type { ConstructorSnapshot } from "../adapters/constructorPayload";
import {
  loadConstructorDraft,
  type StoredConstructorDraft,
} from "../store/constructorDraft";
import { useAuth } from "../../../shared/auth/useAuth";
import { useSessionContext } from "../../../shared/auth/SessionProvider";
import { createCustomerProject } from "../../../shared/projects/projectApi";
import {
  buildProjectCreateInputFromConstructor,
  buildProjectCreateInputFromLocalDraft,
  shouldImportLocalDraftAfterAuth,
} from "../../../shared/projects/projectSnapshot";
import type { ConstructorProject, ProjectSyncStatus } from "../../../shared/projects/types";

export function useConstructorProjectSync(snapshot: ConstructorSnapshot, hasStoredDraft: boolean) {
  const { isAuthenticated } = useAuth();
  const { session } = useSessionContext();
  const [syncStatus, setSyncStatus] = useState<ProjectSyncStatus>("idle");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [lastSavedProject, setLastSavedProject] = useState<ConstructorProject | null>(null);
  const wasAuthenticatedRef = useRef(isAuthenticated);
  const importAttemptedRef = useRef(false);

  const accessToken = session?.access_token ?? null;

  const saveCurrentAsProject = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setSyncStatus("error");
      setSyncMessage("Для сохранения проекта на сервере нужна авторизация.");
      return { ok: false as const, message: "Требуется авторизация." };
    }

    setSyncStatus("saving");
    setSyncMessage(null);
    const result = await createCustomerProject(
      accessToken,
      buildProjectCreateInputFromConstructor(snapshot),
    );

    if (!result.ok) {
      setSyncStatus("error");
      setSyncMessage(result.message);
      return result;
    }

    setLastSavedProject(result.data);
    setSyncStatus("saved");
    setSyncMessage(`Проект «${result.data.title}» сохранён на сервере.`);
    return result;
  }, [accessToken, isAuthenticated, snapshot]);

  const importLocalDraftAsProject = useCallback(
    async (draft: StoredConstructorDraft | null = loadConstructorDraft()) => {
      if (!draft) {
        return { ok: false as const, message: "Локальный черновик не найден." };
      }
      if (!isAuthenticated || !accessToken) {
        return { ok: false as const, message: "Требуется авторизация." };
      }

      setSyncStatus("importing");
      setSyncMessage(null);
      const result = await createCustomerProject(
        accessToken,
        buildProjectCreateInputFromLocalDraft(draft),
      );

      if (!result.ok) {
        setSyncStatus("error");
        setSyncMessage(result.message);
        return result;
      }

      setLastSavedProject(result.data);
      setSyncStatus("imported");
      setSyncMessage(`Локальный черновик импортирован как проект «${result.data.title}».`);
      return result;
    },
    [accessToken, isAuthenticated],
  );

  useEffect(() => {
    const wasAuthenticated = wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = isAuthenticated;

    if (
      !shouldImportLocalDraftAfterAuth({
        wasAuthenticated,
        isAuthenticated,
        hasLocalDraft: hasStoredDraft,
      }) ||
      importAttemptedRef.current
    ) {
      return;
    }

    importAttemptedRef.current = true;
    void importLocalDraftAsProject();
  }, [hasStoredDraft, importLocalDraftAsProject, isAuthenticated]);

  return {
    syncStatus,
    syncMessage,
    lastSavedProject,
    saveCurrentAsProject,
    importLocalDraftAsProject,
    canSaveToServer: isAuthenticated,
  };
}
