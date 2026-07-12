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
  buildProjectCreateInputFromLocalDraft,
  shouldImportLocalDraftAfterAuth,
} from "../../../shared/projects/projectSnapshot";
import {
  executeProjectServerSave,
  getProjectServerSaveSuccessMessage,
  shouldKeepCurrentProjectIdAfterFailedSave,
} from "../../../shared/projects/projectSave";
import type { ConstructorProject, ProjectSyncStatus } from "../../../shared/projects/types";

export function shouldRebindResumedProject(input: {
  detachedFromResumedProjectId: string | null;
  resumedProjectId: string | null | undefined;
}): boolean {
  if (!input.resumedProjectId) return false;
  return input.detachedFromResumedProjectId !== input.resumedProjectId;
}

export function useConstructorProjectSync(
  snapshot: ConstructorSnapshot,
  hasStoredDraft: boolean,
  resumedProject: ConstructorProject | null = null,
) {
  const { isAuthenticated } = useAuth();
  const { session } = useSessionContext();
  const [syncStatus, setSyncStatus] = useState<ProjectSyncStatus>("idle");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [lastSavedProject, setLastSavedProject] = useState<ConstructorProject | null>(null);
  const wasAuthenticatedRef = useRef(isAuthenticated);
  const importAttemptedRef = useRef(false);
  const detachedFromResumedProjectIdRef = useRef<string | null>(null);

  const accessToken = session?.access_token ?? null;

  useEffect(() => {
    if (
      !shouldRebindResumedProject({
        detachedFromResumedProjectId: detachedFromResumedProjectIdRef.current,
        resumedProjectId: resumedProject?.id,
      })
    ) {
      return;
    }

    setCurrentProjectId(resumedProject!.id);
    setLastSavedProject(resumedProject);
  }, [resumedProject]);

  const clearServerProjectIdentity = useCallback(() => {
    const detachedProjectId = currentProjectId ?? resumedProject?.id ?? null;
    if (detachedProjectId) {
      detachedFromResumedProjectIdRef.current = detachedProjectId;
    }

    setCurrentProjectId(null);
    setLastSavedProject(null);
    setSyncStatus("idle");
    setSyncMessage(null);
  }, [currentProjectId, resumedProject?.id]);

  const saveCurrentAsProject = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setSyncStatus("error");
      setSyncMessage("Для сохранения проекта на сервере нужна авторизация.");
      return { ok: false as const, message: "Требуется авторизация." };
    }

    setSyncStatus("saving");
    setSyncMessage(null);

    const result = await executeProjectServerSave({
      accessToken,
      snapshot,
      currentProjectId,
      existingProjectTitle: lastSavedProject?.title ?? resumedProject?.title ?? null,
    });

    if (!result.ok) {
      setSyncStatus("error");
      setSyncMessage(result.message);
      if (!shouldKeepCurrentProjectIdAfterFailedSave(currentProjectId, result.mode)) {
        setCurrentProjectId(null);
        setLastSavedProject(null);
      }
      return result;
    }

    setCurrentProjectId(result.data.id);
    setLastSavedProject(result.data);
    setSyncStatus("saved");
    setSyncMessage(getProjectServerSaveSuccessMessage(result.data.title, result.mode));
    return { ok: true as const, data: result.data };
  }, [
    accessToken,
    currentProjectId,
    isAuthenticated,
    lastSavedProject?.title,
    resumedProject?.title,
    snapshot,
  ]);

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

      setCurrentProjectId(result.data.id);
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
      importAttemptedRef.current ||
      currentProjectId
    ) {
      return;
    }

    importAttemptedRef.current = true;
    void importLocalDraftAsProject();
  }, [currentProjectId, hasStoredDraft, importLocalDraftAsProject, isAuthenticated]);

  return {
    syncStatus,
    syncMessage,
    currentProjectId,
    lastSavedProject,
    hasExistingServerProject: Boolean(currentProjectId),
    saveCurrentAsProject,
    importLocalDraftAsProject,
    clearServerProjectIdentity,
    canSaveToServer: isAuthenticated,
  };
}
