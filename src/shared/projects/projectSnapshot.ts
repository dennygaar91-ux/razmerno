import { buildConstructorDraft } from "../../static-pages/constructor/adapters/constructorPayload";
import type { ConstructorSnapshot } from "../../static-pages/constructor/adapters/constructorPayload";
import type { StoredConstructorDraft } from "../../static-pages/constructor/store/constructorDraft";
import type { ConstructorProjectCreateInput, ConstructorProjectPatchInput, ConstructorProjectSnapshot } from "./types";

export function buildProjectSnapshotFromConstructor(
  snapshot: ConstructorSnapshot,
): ConstructorProjectSnapshot {
  return {
    version: 1,
    draft: buildConstructorDraft(snapshot) as unknown as Record<string, unknown>,
  };
}

export function buildProjectCreateInputFromConstructor(
  snapshot: ConstructorSnapshot,
  title?: string,
): ConstructorProjectCreateInput {
  return {
    title: title?.trim() || defaultProjectTitle(snapshot),
    furniture_type: snapshot.furniture,
    snapshot: buildProjectSnapshotFromConstructor(snapshot),
  };
}

export function buildProjectPatchInputFromConstructor(
  snapshot: ConstructorSnapshot,
  title?: string,
): ConstructorProjectPatchInput {
  return {
    ...(title?.trim() ? { title: title.trim() } : {}),
    furniture_type: snapshot.furniture,
    snapshot: buildProjectSnapshotFromConstructor(snapshot),
  };
}

export function buildProjectCreateInputFromLocalDraft(
  draft: StoredConstructorDraft,
  title?: string,
): ConstructorProjectCreateInput {
  const furnitureType = inferFurnitureTypeFromDraft(draft);
  return {
    title: title?.trim() || draft.furnitureType || "Проект",
    furniture_type: furnitureType,
    snapshot: {
      version: 1,
      draft: draft as unknown as Record<string, unknown>,
    },
  };
}

export function defaultProjectTitle(snapshot: Pick<ConstructorSnapshot, "furniture">): string {
  if (snapshot.furniture === "dresser") return "Комод";
  if (snapshot.furniture === "nightstand") return "Тумба";
  return "Шкаф";
}

function inferFurnitureTypeFromDraft(draft: StoredConstructorDraft): string {
  const label = draft.furnitureType.toLowerCase();
  if (label.includes("комод")) return "dresser";
  if (label.includes("тумба")) return "nightstand";
  return "wardrobe";
}

export function shouldImportLocalDraftAfterAuth(input: {
  wasAuthenticated: boolean;
  isAuthenticated: boolean;
  hasLocalDraft: boolean;
}): boolean {
  return !input.wasAuthenticated && input.isAuthenticated && input.hasLocalDraft;
}
