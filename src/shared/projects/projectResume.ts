import type { ConstructorDraft } from "../../static-pages/constructor/types";
import {
  isStoredConstructorDraft,
  type StoredConstructorDraft,
} from "../../static-pages/constructor/store/constructorDraft";
import type { ConstructorProjectSnapshot } from "./types";

export const PROJECT_RESUME_QUERY_PARAM = "projectId";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidCustomerProjectId(value: string): boolean {
  return UUID_PATTERN.test(value.trim());
}

export function buildConfiguratorResumeUrl(projectId: string): string {
  return `/configurator?${PROJECT_RESUME_QUERY_PARAM}=${encodeURIComponent(projectId)}`;
}

export function readProjectResumeIdFromSearch(search: string): string | null {
  const normalized = search.startsWith("?") ? search.slice(1) : search;
  const projectId = new URLSearchParams(normalized).get(PROJECT_RESUME_QUERY_PARAM)?.trim();
  if (!projectId || !isValidCustomerProjectId(projectId)) return null;
  return projectId;
}

export function readProjectResumeIdFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  return readProjectResumeIdFromSearch(window.location.search);
}

export function clearProjectResumeQueryParam(): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete(PROJECT_RESUME_QUERY_PARAM);
    window.history.replaceState({}, "", url.toString());
  } catch {
    // noop
  }
}

function isConstructorDraftShape(value: unknown): value is ConstructorDraft {
  if (!value || typeof value !== "object") return false;

  const draft = value as Partial<ConstructorDraft>;
  return (
    Array.isArray(draft.dimensions) &&
    draft.dimensions.length === 3 &&
    draft.dimensions.every((item) => typeof item === "number" && Number.isFinite(item)) &&
    typeof draft.furnitureType === "string" &&
    typeof draft.material === "string" &&
    typeof draft.sections === "number" &&
    typeof draft.filling === "string"
  );
}

export function parseProjectSnapshotDraft(
  snapshot: ConstructorProjectSnapshot,
  fallbackUpdatedAt?: string,
): StoredConstructorDraft | null {
  const raw = snapshot.draft;
  if (isStoredConstructorDraft(raw)) {
    return raw;
  }

  if (!isConstructorDraftShape(raw)) {
    return null;
  }

  return {
    ...raw,
    version: 1,
    updatedAt: fallbackUpdatedAt ?? new Date().toISOString(),
  };
}
