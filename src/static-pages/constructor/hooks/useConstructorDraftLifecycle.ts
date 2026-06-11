import { clearConstructorDraft } from "../store/constructorDraft";
import type { ConstructorSnapshot } from "../adapters/constructorPayload";

export type ConstructorDraftStatus = "idle" | "restored" | "saved" | "cleared" | "unavailable" | "disabled";

/**
 * Autosave/draft restore is intentionally disabled for the current MVP pass.
 *
 * Product decision before Stage 3: do not save or restore local drafts now.
 * The hook remains as a compatibility seam for older components/tests, but it
 * must not write configuration snapshots to localStorage or restore stale state.
 */
export function useConstructorDraftLifecycle(_snapshot: ConstructorSnapshot) {
  function clearDraft() {
    try {
      clearConstructorDraft();
    } catch {
      // Keep the hook non-blocking: draft storage is not part of the MVP path.
    }
  }

  return {
    draftStatus: "disabled" as ConstructorDraftStatus,
    hasStoredDraft: false,
    clearDraft,
  };
}
