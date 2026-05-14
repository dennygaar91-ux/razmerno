import { CONSTRUCTOR_DRAFT_STORAGE_KEY } from "../config/constructorUiConfig";

export function saveConstructorDraft({ config, price }) {
  if (typeof window === "undefined") return false;

  window.localStorage.setItem(
    CONSTRUCTOR_DRAFT_STORAGE_KEY,
    JSON.stringify({ config, price, updatedAt: new Date().toISOString() })
  );

  return true;
}

export function loadConstructorDraft() {
  if (typeof window === "undefined") return null;

  try {
    const rawDraft = window.localStorage.getItem(CONSTRUCTOR_DRAFT_STORAGE_KEY);
    return rawDraft ? JSON.parse(rawDraft) : null;
  } catch {
    return null;
  }
}

export function hasConstructorDraft() {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(CONSTRUCTOR_DRAFT_STORAGE_KEY));
}
