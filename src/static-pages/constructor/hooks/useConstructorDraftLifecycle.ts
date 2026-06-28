import { useCallback, useEffect, useState } from "react";
import {
  clearConstructorDraft,
  loadConstructorDraft,
  restoreConstructorDraftToStore,
  saveConstructorDraft,
} from "../store/constructorDraft";
import type { ConstructorSnapshot } from "../adapters/constructorPayload";

export type ConstructorDraftStatus = "idle" | "restored" | "saved" | "cleared" | "unavailable" | "disabled";

function hasLocalStorageAccess() {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function useConstructorDraftLifecycle(snapshot: ConstructorSnapshot) {
  const [draftStatus, setDraftStatus] = useState<ConstructorDraftStatus>("idle");
  const [hasStoredDraft, setHasStoredDraft] = useState(false);

  useEffect(() => {
    if (!hasLocalStorageAccess()) {
      setDraftStatus("unavailable");
      setHasStoredDraft(false);
      return;
    }

    try {
      setHasStoredDraft(loadConstructorDraft() !== null);
      setDraftStatus("idle");
    } catch {
      setDraftStatus("unavailable");
      setHasStoredDraft(false);
    }
  }, []);

  const saveDraft = useCallback(() => {
    if (!hasLocalStorageAccess()) {
      setDraftStatus("unavailable");
      return null;
    }

    try {
      const draft = saveConstructorDraft(snapshot);
      setHasStoredDraft(true);
      setDraftStatus("saved");
      return draft;
    } catch {
      setDraftStatus("unavailable");
      return null;
    }
  }, [snapshot]);

  const restoreDraft = useCallback(() => {
    if (!hasLocalStorageAccess()) {
      setDraftStatus("unavailable");
      return null;
    }

    try {
      const draft = restoreConstructorDraftToStore();
      if (!draft) {
        setHasStoredDraft(false);
        setDraftStatus("idle");
        return null;
      }

      setHasStoredDraft(true);
      setDraftStatus("restored");
      return draft;
    } catch {
      setDraftStatus("unavailable");
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    if (!hasLocalStorageAccess()) {
      setDraftStatus("unavailable");
      return;
    }

    try {
      clearConstructorDraft();
      setHasStoredDraft(false);
      setDraftStatus("cleared");
    } catch {
      setDraftStatus("unavailable");
    }
  }, []);

  return {
    draftStatus,
    hasStoredDraft,
    saveDraft,
    restoreDraft,
    clearDraft,
  };
}
