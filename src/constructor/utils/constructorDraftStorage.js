import { CONSTRUCTOR_DRAFT_STORAGE_KEY } from "../config/constructorUiConfig";

function isValidConstructorDraft(draft) {
  return Boolean(
    draft &&
      draft.config &&
      draft.config.dimensions &&
      Array.isArray(draft.config.sections) &&
      draft.config.materials &&
      draft.config.options
  );
}

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
    const parsedDraft = rawDraft ? JSON.parse(rawDraft) : null;
    return isValidConstructorDraft(parsedDraft) ? parsedDraft : null;
  } catch {
    return null;
  }
}

export function hasConstructorDraft() {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(CONSTRUCTOR_DRAFT_STORAGE_KEY));
}

export function clearConstructorDraft() {
  if (typeof window === "undefined") return false;

  window.localStorage.removeItem(CONSTRUCTOR_DRAFT_STORAGE_KEY);
  return true;
}
