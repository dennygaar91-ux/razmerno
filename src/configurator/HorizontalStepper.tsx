import { STEPS, hasErrors, getStepStatuses } from "./context";
import { useConfigBridge } from "./store/useConfigBridge";
import { cn } from "../utils/cn";

function stepTitle(status: "ok" | "warning" | "error", canJump: boolean, label: string) {
  if (!canJump) return "Сначала исправьте ошибки текущего шага";
  if (status === "error") return "Есть ошибка: нажмите, чтобы перейти к шагу";
  if (status === "warning") return "Есть предупреждение: проверьте шаг";
  return label;
}

export function HorizontalStepper() {
  const { state, validation, actions } = useConfigBridge();
  const blocked = hasErrors(validation);
  const statuses = getStepStatuses(validation);

  return (
    <nav
      aria-label="Этапы конструктора"
      className="flex gap-1.5 items-center overflow-x-auto no-scrollbar"
    >
      {STEPS.map((s, i) => {
        const active = i === state.activeStep;
        const done = i < state.activeStep;
        const canJump = i <= state.activeStep || (i === state.activeStep + 1 && !blocked);
        const status = statuses[i];

        return (
          <button
            key={s.id}
            type="button"
            disabled={!canJump}
            onClick={() => actions.setStep(i)}
            data-status={status}
            data-active={active ? "true" : undefined}
            className={cn(
              "group flex items-center justify-center gap-2 h-9 px-2.5 sm:px-3 rounded-full text-[12px] md:text-[12.5px] font-semibold rzm-step-motion focus-ring border",
              active ? "min-w-[118px]" : "w-9 sm:w-auto shrink-0",
              status === "ok" && active && "bg-[var(--rzm-text-main)] text-white border-[var(--rzm-text-main)]",
              status === "ok" && !active && done && "bg-white/70 text-[var(--rzm-text-main)] border-[var(--rzm-line-soft)]",
              status === "ok" && !active && !done && canJump && "bg-white/60 text-[var(--rzm-text-muted)] border-[var(--rzm-line-soft)] hover:bg-white hover:text-[var(--rzm-text-main)]",
              status === "error" && "bg-[var(--rzm-error-soft)] text-[var(--rzm-error-ink)] border-[rgba(217,74,43,0.26)]",
              status === "warning" && "bg-[var(--rzm-warning-soft)] text-[var(--rzm-warning-ink)] border-[rgba(216,167,58,0.30)]",
              !canJump && "bg-white/36 text-[var(--rzm-text-subtle)] border-[var(--rzm-line-soft)] cursor-not-allowed opacity-70",
              "lg:flex-1 lg:min-w-0 lg:w-auto",
            )}
            aria-current={active ? "step" : undefined}
            title={stepTitle(status, canJump, s.label)}
          >
            <span
              className={cn(
                "shrink-0 w-5.5 h-5.5 rounded-full grid place-items-center text-[10px] tabular-nums font-mono rzm-step-motion",
                status === "error" && "bg-[var(--rzm-error)] text-white",
                status === "warning" && "bg-[var(--rzm-warning)] text-white",
                status === "ok" && active && "bg-white/16 text-white",
                status === "ok" && !active && done && "bg-[var(--rzm-surface-soft)] text-[var(--rzm-text-main)]",
                status === "ok" && !active && !done && "bg-[var(--rzm-surface-soft)] text-[var(--rzm-text-muted)]",
              )}
            >
              {status === "error" ? "!" : status === "warning" ? "?" : done ? (
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span className={cn("truncate", !active && "hidden sm:inline", active && "sm:inline")}>{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
