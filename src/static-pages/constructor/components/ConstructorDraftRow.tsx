import type { ConstructorDraftStatus } from "../hooks/useConstructorDraftLifecycle";

export function ConstructorDraftRow({
  draftStatus,
  onClearDraft,
}: {
  draftStatus: ConstructorDraftStatus;
  onClearDraft: () => void;
}) {
  return (
    <div className="rzm-constructor-draft-row">
      <span>
        {draftStatus === "disabled"
          ? "Автосохранение отключено"
          : draftStatus === "restored"
            ? "Черновик восстановлен"
            : draftStatus === "saved"
              ? "Черновик сохранён"
              : draftStatus === "cleared"
                ? "Черновик сброшен"
                : "Черновик не сохраняется"}
      </span>
      <button type="button" onClick={onClearDraft}>Очистить старый черновик</button>
    </div>
  );
}
