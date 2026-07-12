import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../shared/auth/useAuth";
import { useSessionContext } from "../../../shared/auth/SessionProvider";
import { getCustomerProject } from "../../../shared/projects/projectApi";
import type { ConstructorProject } from "../../../shared/projects/types";
import {
  clearProjectResumeQueryParam,
  parseProjectSnapshotDraft,
  readProjectResumeIdFromLocation,
} from "../../../shared/projects/projectResume";
import {
  applyStoredConstructorDraftToStore,
  saveStoredConstructorDraft,
} from "../store/constructorDraft";

export type ConstructorProjectResumeStatus =
  | "idle"
  | "loading"
  | "loaded"
  | "auth_required"
  | "error";

export function useConstructorProjectResume() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { session } = useSessionContext();
  const [status, setStatus] = useState<ConstructorProjectResumeStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [loadedProject, setLoadedProject] = useState<ConstructorProject | null>(null);
  const loadedProjectIdRef = useRef<string | null>(null);
  const inFlightProjectIdRef = useRef<string | null>(null);

  const resumeProject = useCallback(async (projectId: string) => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      setStatus("auth_required");
      setMessage("Войдите, чтобы открыть сохранённый проект.");
      return null;
    }

    setStatus("loading");
    setMessage(null);

    const result = await getCustomerProject(accessToken, projectId);
    if (!result.ok) {
      setLoadedProject(null);
      loadedProjectIdRef.current = null;
      if (result.status === 401) {
        setStatus("auth_required");
        setMessage("Сессия истекла. Войдите снова, чтобы открыть проект.");
      } else if (result.status === 404) {
        setStatus("error");
        setMessage("Проект не найден или недоступен.");
      } else {
        setStatus("error");
        setMessage(result.message);
      }
      return null;
    }

    const draft = parseProjectSnapshotDraft(result.data.snapshot, result.data.updated_at);
    if (!draft) {
      setLoadedProject(null);
      loadedProjectIdRef.current = null;
      setStatus("error");
      setMessage("Не удалось восстановить конфигурацию проекта.");
      return null;
    }

    try {
      applyStoredConstructorDraftToStore(draft);
      saveStoredConstructorDraft(draft);
    } catch {
      setLoadedProject(null);
      loadedProjectIdRef.current = null;
      setStatus("error");
      setMessage("Не удалось применить конфигурацию проекта в конструкторе.");
      return null;
    }

    setLoadedProject(result.data);
    loadedProjectIdRef.current = result.data.id;
    setStatus("loaded");
    setMessage(`Проект «${result.data.title}» открыт в конструкторе.`);
    clearProjectResumeQueryParam();
    return result.data;
  }, [session?.access_token]);

  useEffect(() => {
    if (authLoading) return;

    const projectId = readProjectResumeIdFromLocation();
    if (!projectId) {
      if (status !== "loaded") {
        setStatus("idle");
        setMessage(null);
      }
      return;
    }

    if (!isAuthenticated) {
      setStatus("auth_required");
      setMessage("Войдите, чтобы открыть сохранённый проект.");
      return;
    }

    if (loadedProjectIdRef.current === projectId) {
      return;
    }

    if (inFlightProjectIdRef.current === projectId) {
      return;
    }

    inFlightProjectIdRef.current = projectId;
    void resumeProject(projectId).finally(() => {
      if (inFlightProjectIdRef.current === projectId) {
        inFlightProjectIdRef.current = null;
      }
    });
  }, [authLoading, isAuthenticated, resumeProject, status]);

  return {
    status,
    message,
    loadedProject,
    resumeProject,
  };
}
