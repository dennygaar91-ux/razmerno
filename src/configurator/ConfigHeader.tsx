import { useState } from "react";
import { useConfigBridge } from "./store/useConfigBridge";

/**
 * Хедер конструктора. Светлый, минималистичный.
 */
export function ConfigHeader() {
  const { state, actions } = useConfigBridge();
  const [resetOpen, setResetOpen] = useState(false);

  const confirmReset = () => {
    actions.reset();
    setResetOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[rgba(255,253,248,0.86)] backdrop-blur-xl border-b border-[var(--rzm-line-soft)]">
        <div className="section-pad h-14 md:h-16 flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 focus-ring">
            <div className="w-8 h-8 rounded-lg bg-[var(--rzm-text-main)] grid place-items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="white" strokeWidth="1.6" />
                <rect x="13" y="4" width="7" height="7" rx="1.2" stroke="white" strokeWidth="1.6" />
                <rect x="4" y="13" width="7" height="7" rx="1.2" stroke="white" strokeWidth="1.6" />
                <rect x="13" y="13" width="7" height="7" rx="1.2" stroke="white" strokeWidth="1.6" />
              </svg>
            </div>
            <span className="font-display text-[17px] md:text-[18px] font-bold text-[var(--rzm-text-main)]">
              Размерно
            </span>
          </a>

          <div className="hidden md:block w-px h-6 bg-[var(--color-line)] mx-1" />
          <div className="hidden md:flex items-center gap-2 text-[13px] text-[var(--rzm-text-muted)]">
            <span>Собираем</span>
            {state.type && (
              <>
                <span className="text-[var(--rzm-text-subtle)]">·</span>
                <span className="text-[var(--rzm-text-main)]">
                  {state.type === "wardrobe" ? "шкаф" : state.type === "dresser" ? "комод" : "тумбу"}
                </span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {state.type && (
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                className="btn btn-ghost btn-sm focus-ring"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 8a6 6 0 1 0 1.5-4M2 3v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">Заново</span>
              </button>
            )}
            <a href="/" className="btn btn-outline btn-sm focus-ring">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">На главную</span>
            </a>
          </div>
        </div>
      </header>

      {resetOpen && (
        <div className="fixed inset-0 z-[90] grid place-items-center px-4">
          <button
            type="button"
            aria-label="Закрыть подтверждение"
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setResetOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            className="relative w-full max-w-[420px] rzm-card p-5 md:p-6"
          >
            <div className="w-11 h-11 rounded-full bg-[var(--rzm-surface-soft)] grid place-items-center mb-4">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8a6 6 0 1 0 1.5-4M2 3v3h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="reset-dialog-title" className="font-display text-[22px] font-bold tracking-[-0.02em] text-[var(--rzm-text-main)]">
              Начать заново?
            </h2>
            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--rzm-text-muted)]">
              Текущие размеры, наполнение и материалы сбросятся. Это действие нельзя отменить.
            </p>
            <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setResetOpen(false)}
                className="btn btn-outline btn-sm focus-ring"
              >
                Оставить как есть
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="btn btn-primary btn-sm focus-ring"
              >
                Сбросить набор
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
