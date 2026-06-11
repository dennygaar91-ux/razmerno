import { useState } from "react";
import { STEPS, hasErrors, firstErrorStep } from "./context";
import { useConfigBridge } from "./store/useConfigBridge";
import { formatPrice } from "../shared/lib/price";
import { trackEvent } from "../shared/lib/analytics";

const MOBILE_STEP_HINTS = [
  "Размеры меняют шкаф сразу в предпросмотре.",
  "Секции и наполнение можно уточнять по частям.",
  "Оставьте понятный внешний вид: корпус, фасады, ручки.",
  "Проверьте комплект и отправьте заявку на смету.",
] as const;

/**
 * Mobile sticky footer (п.5.5 ТЗ).
 * Стоимость + основная кнопка шага. Если есть валидационные ошибки —
 * показывается компактный индикатор и кнопка блокируется.
 */
export function MobileBottomBar() {
  const { state, actions, price, validation } = useConfigBridge();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const errors = validation.filter((v) => v.kind === "error");
  const blocked = hasErrors(validation);

  if (!state.type) return null;

  const isLast = state.activeStep === STEPS.length - 1;
  const stepProgress = Math.round(((state.activeStep + 1) / STEPS.length) * 100);
  const currentStep = STEPS[state.activeStep];
  const stepHint = MOBILE_STEP_HINTS[state.activeStep] ?? "Продолжайте сборку по шагам.";
  const actionLabel = blocked ? "Исправить" : isLast ? "Открыть заявку" : "Дальше";

  const onNext = () => {
    if (blocked) {
      const targetStep = firstErrorStep(validation);
      trackEvent("validation_error_seen", { source: "mobile-bar", targetStep, errors: errors.length });
      actions.setStep(targetStep);
      window.requestAnimationFrame(() => {
        document.querySelector("[data-configurator-step]")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    if (isLast) {
      trackEvent("order_form_opened", { source: "mobile-bar", total: price.total });
      actions.openCheckout("order");
    } else {
      trackEvent("constructor_step_next", { step: state.activeStep, source: "mobile-bar" });
      actions.setStep(state.activeStep + 1);
    }
  };

  return (
    <div className="lg:hidden fixed left-0 right-0 bottom-0 z-40 rzm-bottom-surface rzm-mobile-sheet" data-mobile-summary="guided-bottom-sheet">
      <div className="rzm-mobile-sheet-handle" aria-hidden="true" />
      {/* Полоса ошибки показывается только когда действие заблокировано */}
      {errors.length > 0 && (
        <button
          type="button"
          onClick={onNext}
          className="w-full text-left px-4 py-1.5 rzm-status rounded-none border-x-0 border-t-0 focus-ring"
          data-status="error"
        >
          <span className="leading-snug">{errors[0].text}</span>
        </button>
      )}

      <div className="h-1 bg-[var(--rzm-line-soft)]">
        <div
          className="h-full bg-[var(--rzm-text-main)] transition-[width] duration-300"
          style={{ width: `${stepProgress}%` }}
        />
      </div>

      <div className="px-4 pt-2 pb-1.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <button
          type="button"
          onClick={() => setDetailsOpen((value) => !value)}
          className="min-w-0 text-left focus-ring rounded-[14px] rzm-mobile-price-trigger"
          aria-expanded={detailsOpen}
          aria-label="Показать пояснение текущего шага"
        >
          <div className="flex items-center gap-2 text-[10px] leading-none text-[var(--rzm-text-muted)]">
            <span className="font-medium">Стоимость шкафа</span>
            <span aria-hidden="true" className="w-1 h-1 rounded-full bg-[var(--rzm-line)]" />
            <span className="truncate">Шаг {state.activeStep + 1}/{STEPS.length}</span>
          </div>
          <div className="mt-1 flex min-w-0 items-end gap-2">
            <div className="font-display font-bold text-[18px] tabular-nums text-[var(--rzm-text-main)] leading-tight">
              {formatPrice(price.total)}
            </div>
            <div className="min-w-0 flex-1 truncate pb-[1px] text-[11px] leading-tight text-[var(--rzm-text-muted)]">
              {currentStep?.label ?? "Настройка"}
            </div>
            <span className="shrink-0 pb-[3px] text-[10px] leading-none text-[var(--rzm-text-muted)]" aria-hidden="true">
              {detailsOpen ? "Свернуть" : "Пояснить"}
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary btn-sm h-10 px-3.5 focus-ring shrink-0 motion-soft rzm-touch-target rzm-mobile-next-button"
          aria-label={blocked ? "Перейти к ошибке" : actionLabel}
        >
          <span>{actionLabel}</span>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {detailsOpen && (
        <div className="px-4 pb-2.5 -mt-0.5 rzm-mobile-sheet-details">
          <div className="rzm-mobile-panel px-3 py-2">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2.5">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--rzm-text-main)] text-[10px] font-semibold text-white tabular-nums">
                {state.activeStep + 1}
              </span>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-[var(--rzm-text-main)] truncate">
                  {currentStep?.label ?? "Настройка"}
                </div>
                <p className="mt-1 text-[12px] leading-snug text-[var(--rzm-text-muted)]">
                  {blocked ? "Сначала исправьте подсказку. После этого можно продолжить." : stepHint}
                </p>
              </div>
              <span className="shrink-0 text-[11px] tabular-nums text-[var(--rzm-text-muted)]">
                {state.activeStep + 1}/{STEPS.length}
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }} />
    </div>
  );
}
