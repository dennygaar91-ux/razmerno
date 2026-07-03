export type ConstructorProjectSnapshot = {
  version: 1;
  draft: Record<string, unknown>;
};

export type ConstructorProject = {
  id: string;
  user_id: string;
  title: string;
  snapshot: ConstructorProjectSnapshot;
  furniture_type: string;
  preview_path: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ConstructorProjectCreateInput = {
  title?: string;
  snapshot: ConstructorProjectSnapshot;
  furniture_type: string;
  preview_path?: string | null;
};

export type ConstructorProjectPatchInput = {
  title?: string;
  snapshot?: ConstructorProjectSnapshot;
  furniture_type?: string;
  preview_path?: string | null;
};

export type ProjectApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; status?: number };

export type ProjectSyncStatus = "idle" | "saving" | "saved" | "importing" | "imported" | "error";
