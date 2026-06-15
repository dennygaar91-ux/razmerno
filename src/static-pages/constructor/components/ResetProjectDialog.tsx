import { useEffect, useRef, type KeyboardEvent } from "react";

export function ResetProjectDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousActiveElement = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();
    return () => {
      previousActiveElement?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      onConfirm();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = [
      cancelButtonRef.current,
      confirmButtonRef.current,
    ].filter(Boolean) as HTMLButtonElement[];
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="rzm-3d-reset-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        className="rzm-3d-reset-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rzm-3d-reset-dialog-title"
        aria-describedby="rzm-3d-reset-dialog-description"
        onKeyDown={handleKeyDown}
      >
        <span className="rzm-3d-reset-dialog-kicker">Сброс проекта</span>
        <h2 id="rzm-3d-reset-dialog-title">Сбросить параметры?</h2>
        <p id="rzm-3d-reset-dialog-description">
          Проект вернётся к состоянию первого открытия конструктора. Сбросятся
          параметры мебели, контакты, доставка, сборка и согласие.
        </p>
        <ul>
          <li>Размеры, секции и зоны вернутся к значениям по умолчанию.</li>
          <li>Материалы, фасады, полки, ящики и штанги будут сброшены.</li>
          <li>Контакты, адрес доставки, сборка и согласие будут очищены.</li>
        </ul>
        <div className="rzm-3d-reset-dialog-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="rzm-ui-btn rzm-ui-btn--secondary"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className="rzm-ui-btn rzm-ui-btn--danger"
            onClick={onConfirm}
          >
            Сбросить
          </button>
        </div>
      </div>
    </div>
  );
}
