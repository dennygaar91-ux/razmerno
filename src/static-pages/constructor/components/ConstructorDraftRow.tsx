import type { ConstructorDraftStatus } from "../hooks/useConstructorDraftLifecycle";

export function ConstructorDraftRow({
  draftStatus,
  hasStoredDraft,
  onSaveDraft,
  onRestoreDraft,
  onClearDraft,
}: {
  draftStatus: ConstructorDraftStatus;
  hasStoredDraft: boolean;
  onSaveDraft: () => void;
  onRestoreDraft: () => void;
  onClearDraft: () => void;
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
        <button type="button" onClick={onRestoreDraft} disabled={!hasStoredDraft}>Восстановить проект</button>
        <button type="button" onClick={onClearDraft} disabled={!hasStoredDraft}>Очистить черновик</button>
      </div>
    </div>
  );
}
