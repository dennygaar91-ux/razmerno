import type { ConstructorDraftStatus } from "../hooks/useConstructorDraftLifecycle";

export function ConstructorDraftRow({
  draftStatus,
  hasStoredDraft,
  onSaveDraft,
  onRestoreDraft,
  onClearDraft,
  canSaveToServer = false,
  onSaveToServer,
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
  serverSyncMessage?: string | null;
  serverSyncStatus?: "idle" | "saving" | "saved" | "importing" | "imported" | "error";
}) {
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
            disabled={serverSyncStatus === "saving" || serverSyncStatus === "importing"}
          >
            {serverSyncStatus === "saving" ? "Сохраняем на сервер…" : "Сохранить на сервер"}
          </button>
        ) : null}
        <button type="button" onClick={onRestoreDraft} disabled={!hasStoredDraft}>Восстановить проект</button>
        <button type="button" onClick={onClearDraft} disabled={!hasStoredDraft}>Очистить черновик</button>
      </div>
      {serverSyncMessage ? <p className="rzm-constructor-draft-row-message">{serverSyncMessage}</p> : null}
    </div>
  );
}
