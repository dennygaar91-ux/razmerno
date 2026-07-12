import type { ConstructorDraftStatus } from "../hooks/useConstructorDraftLifecycle";
import { getProjectServerSaveButtonLabel } from "../../../shared/projects/projectSave";

export function ConstructorDraftRow({
  draftStatus,
  hasStoredDraft,
  onSaveDraft,
  onRestoreDraft,
  onClearDraft,
  canSaveToServer = false,
  onSaveToServer,
  hasExistingServerProject = false,
  serverSyncMessage,
  serverSyncStatus = "idle",
}: {
  draftStatus: ConstructorDraftStatus;
  hasStoredDraft: boolean;
  onSaveDraft: () => void;
  onRestoreDraft: () => void;
  onClearDraft: () => void;
  canSaveToServer?: boolean;
  onSaveToServer?: () => void;
  hasExistingServerProject?: boolean;
  serverSyncMessage?: string | null;
  serverSyncStatus?: "idle" | "saving" | "saved" | "importing" | "imported" | "error";
}) {
  const saveMode = hasExistingServerProject ? "update" : "create";
  const isSaving = serverSyncStatus === "saving" || serverSyncStatus === "importing";

  return (
    <div className="rzm-constructor-draft-row">
      <span>
        {draftStatus === "disabled"
          ? "Локальный черновик отключён"
          : draftStatus === "unavailable"
            ? "Локальное хранилище недоступно"
            : draftStatus === "restored"
              ? "Черновик восстановлен"
              : draftStatus === "saved"
                ? "Черновик сохранён"
                : draftStatus === "cleared"
                  ? "Черновик удалён"
                  : hasStoredDraft
                    ? "Локальный черновик доступен"
                    : "Локальный черновик не сохранён"}
      </span>
      <div>
        <button type="button" onClick={onSaveDraft}>Сохранить проект</button>
        {canSaveToServer && onSaveToServer ? (
          <button
            type="button"
            onClick={onSaveToServer}
            disabled={isSaving}
          >
            {getProjectServerSaveButtonLabel(saveMode, isSaving)}
          </button>
        ) : null}
        <button type="button" onClick={onRestoreDraft} disabled={!hasStoredDraft}>Восстановить проект</button>
        <button type="button" onClick={onClearDraft} disabled={!hasStoredDraft}>Очистить черновик</button>
      </div>
      {serverSyncMessage ? <p className="rzm-constructor-draft-row-message">{serverSyncMessage}</p> : null}
    </div>
  );
}
