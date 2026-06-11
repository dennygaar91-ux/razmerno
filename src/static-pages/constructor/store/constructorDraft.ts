import type { ConstructorDraft } from "../types";
import type { ConstructorSnapshot } from "../adapters/constructorPayload";
import { buildConstructorDraft } from "../adapters/constructorPayload";
import { resolveMaterialId, type MaterialToken } from "../../../shared/materials/materialCatalog";
import { useConstructorStore } from "./constructorStore";

export const CONSTRUCTOR_DRAFT_STORAGE_KEY = "razmerno-constructor-draft-v1";

export type StoredConstructorDraft = ConstructorDraft & {
  version: 1;
  updatedAt: string;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStoredConstructorDraft(value: unknown): value is StoredConstructorDraft {
  if (!value || typeof value !== "object") return false;

  const draft = value as Partial<StoredConstructorDraft>;
  return (
    draft.version === 1 &&
    Array.isArray(draft.dimensions) &&
    draft.dimensions.length === 3 &&
    draft.dimensions.every(isFiniteNumber) &&
    typeof draft.furnitureType === "string" &&
    typeof draft.material === "string" &&
    isFiniteNumber(draft.sections) &&
    typeof draft.filling === "string" &&
    typeof draft.updatedAt === "string"
  );
}

export function saveConstructorDraft(snapshot: ConstructorSnapshot, storage: Storage = window.localStorage) {
  const draft = buildConstructorDraft(snapshot);
  const storedDraft: StoredConstructorDraft = {
    ...draft,
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  storage.setItem(CONSTRUCTOR_DRAFT_STORAGE_KEY, JSON.stringify(storedDraft));
  return storedDraft;
}

export function loadConstructorDraft(storage: Storage = window.localStorage) {
  const raw = storage.getItem(CONSTRUCTOR_DRAFT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isStoredConstructorDraft(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearConstructorDraft(storage: Storage = window.localStorage) {
  storage.removeItem(CONSTRUCTOR_DRAFT_STORAGE_KEY);
}

export function restoreConstructorDraftToStore(storage: Storage = window.localStorage) {
  const draft = loadConstructorDraft(storage);
  if (!draft) return null;

  const [width, height, depth] = draft.dimensions;
  const filling = draft.filling === "shelves" || draft.filling === "drawers" || draft.filling === "rod" ? draft.filling : "shelves";

  const furnitureText = draft.furnitureType.toLowerCase();
  const furniture = furnitureText.includes("комод") ? "dresser" : furnitureText.includes("тумба") ? "nightstand" : "wardrobe";

  const materialText = draft.material.toLowerCase();
  const material = resolveMaterialId(
    draft.materialId ??
      (materialText.includes("h1910") || materialText.includes("бук") || materialText.includes("светлое дерево")
        ? "ldsp-egger-h1910-buk-lugovoy-st9"
        : materialText.includes("h3395") || materialText.includes("корбридж") || materialText.includes("дуб")
          ? "ldsp-egger-h3395-dub-korbridzh-naturalnyy-st12"
          : materialText.includes("h3734") || materialText.includes("орех") || materialText.includes("пес")
            ? "ldsp-egger-h3734-oreh-dizhon-naturalnyy-st9"
            : materialText.includes("u780") || materialText.includes("монумент")
              ? "ldsp-egger-u780-seryy-monumentalnyy-st9"
              : materialText.includes("u961") || materialText.includes("графит") || materialText.includes("чёр") || materialText.includes("чер")
                ? "ldsp-egger-u961-chernyy-grafit-st7"
                : materialText.includes("u708") || materialText.includes("светло-сер") || materialText.includes("сер")
                  ? "ldsp-egger-u708-svetlo-seryy-st9"
                  : materialText.includes("w960") || materialText.includes("бел")
                    ? "ldsp-egger-w960-belyy-klassicheskiy-sm"
                    : draft.material),
  ) as MaterialToken;
  const facadeMaterial = resolveMaterialId(draft.facadeMaterialId ?? material) as MaterialToken;

  useConstructorStore.getState().restoreDraft({
    width,
    height,
    depth,
    sections: draft.sections,
    compartments: draft.compartments,
    sectionLayout: draft.sectionLayout,
    compartmentLayout: draft.compartmentLayout,
    fillingLayout: draft.fillingLayout,
    facadeLayout: draft.facadeLayout,
    filling,
    furniture,
    material,
    facadeMaterial,
  });

  return draft;
}
