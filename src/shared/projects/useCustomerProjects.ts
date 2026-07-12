import { useCallback, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useSessionContext } from "../auth/SessionProvider";
import {
  archiveCustomerProject,
  createCustomerProject,
  getCustomerProject,
  listCustomerProjects,
  updateCustomerProject,
} from "./projectApi";
import type {
  ConstructorProject,
  ConstructorProjectCreateInput,
  ConstructorProjectPatchInput,
} from "./types";

export function useCustomerProjects() {
  const { isAuthenticated } = useAuth();
  const { session } = useSessionContext();
  const [projects, setProjects] = useState<ConstructorProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = session?.access_token ?? null;

  const refreshProjects = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setProjects([]);
      setError(null);
      return { ok: false as const, message: "Требуется авторизация." };
    }

    setLoading(true);
    const result = await listCustomerProjects(accessToken);
    if (result.ok) {
      setProjects(result.data);
      setError(null);
    } else {
      setProjects([]);
      setError(result.message);
    }
    setLoading(false);
    return result;
  }, [accessToken, isAuthenticated]);

  const createProject = useCallback(
    async (input: ConstructorProjectCreateInput) => {
      if (!accessToken) return { ok: false as const, message: "Требуется авторизация." };
      const result = await createCustomerProject(accessToken, input);
      if (result.ok) {
        setProjects((current) => [result.data, ...current.filter((item) => item.id !== result.data.id)]);
        setError(null);
      } else {
        setError(result.message);
      }
      return result;
    },
    [accessToken],
  );

  const loadProject = useCallback(
    async (projectId: string) => {
      if (!accessToken) return { ok: false as const, message: "Требуется авторизация." };
      return getCustomerProject(accessToken, projectId);
    },
    [accessToken],
  );

  const saveProject = useCallback(
    async (projectId: string, patch: ConstructorProjectPatchInput) => {
      if (!accessToken) return { ok: false as const, message: "Требуется авторизация." };
      const result = await updateCustomerProject(accessToken, projectId, patch);
      if (result.ok) {
        setProjects((current) =>
          current.map((item) => (item.id === projectId ? result.data : item)),
        );
        setError(null);
      } else {
        setError(result.message);
      }
      return result;
    },
    [accessToken],
  );

  const archiveProject = useCallback(
    async (projectId: string) => {
      if (!accessToken) return { ok: false as const, message: "Требуется авторизация." };
      const result = await archiveCustomerProject(accessToken, projectId);
      if (result.ok) {
        setProjects((current) => current.filter((item) => item.id !== projectId));
        setError(null);
      } else {
        setError(result.message);
      }
      return result;
    },
    [accessToken],
  );

  return {
    projects,
    loading,
    error,
    refreshProjects,
    createProject,
    loadProject,
    saveProject,
    archiveProject,
  };
}
