import { hasErrors, firstErrorStep } from "../context";
import { useConfigBridge } from "../store/useConfigBridge";
import { trackEvent } from "../../shared/lib/analytics";
import { cn } from "../../utils/cn";
import { AssemblyCue, StepShell } from "./StepShell";
import { SummaryRows } from "./StepControls";

export function ReviewStep() {
  const { state, price, actions, bodyMaterial, facadeMaterial, facadeStyle, hardware, validation } = useConfigBridge();
  if (!state.type) return null;

  const typeName = state.type === "wardrobe" ? "Шкаф" : state.type === "dresser" ? "Комод" : "Тумба";
  const errorMessages = validation.filter((m) => m.kind === "error");
  const hasBlockingErrors = hasErrors(validation);

  const openCheckout = () => {
    if (hasBlockingErrors) {
      const targetStep = firstErrorStep(validation);
      trackEvent("validation_error_seen", { source: "review-checkout", targetStep, errors: errorMessages.length });
      actions.setStep(targetStep);
      return;
    }
    trackEvent("order_form_opened", { total: price.total });
    actions.openCheckout("order");
  };

  const rows: Array<[string, string]> = [
    ["Изделие", typeName],
    ["Размеры", `${state.width} × ${state.height} × ${state.depth} мм`],
    ["Секции", String(state.sections)],
    ["Полки / ящики", `${state.filling.shelves} / ${state.filling.drawers}`],
    ["Штанга", state.filling.hangingRod ? "Да" : "Нет"],
    ["Корпус", bodyMaterial.name],
    ["Фасады", `${facadeMaterial.name} · ${facadeStyle.name}`],
    ["Фурнитура", hardware.name],
  ];

  return (
    <StepShell
      title="Проверьте перед отправкой"
      description="Убедитесь, что всё верно. Изменить можно до подтверждения заявки."
      onBack={() => actions.setStep(2)}
    >
      <AssemblyCue
        items={[
          { label: "Размер", value: `${state.width} × ${state.height}` },
          { label: "Наполнение", value: `${state.filling.shelves} пол. / ${state.filling.drawers} ящ.` },
          { label: "Вид", value: facadeStyle.name, active: true },
        ]}
      />

      <SummaryRows rows={rows} />

      <div className="mt-4 rounded-[18px] border border-[var(--rzm-line-soft)]/70 bg-white/58 px-4 py-3 text-[12px] leading-snug text-[var(--rzm-text-muted)]">
        Цена и состав остаются справа. В заявке можно добавить доставку и сборку — итог пересчитается автоматически.
      </div>

      {errorMessages.length > 0 && (
        <div className="mt-4 rounded-[18px] bg-[var(--rzm-error-soft)] px-4 py-3 text-[13px] leading-snug text-[var(--rzm-error-ink)]">
          <div className="font-medium text-[var(--rzm-text-main)] mb-1">Сначала нужно исправить ошибки</div>
          <div>{errorMessages[0].text}</div>
          <button
            type="button"
            onClick={() => actions.setStep(firstErrorStep(validation))}
            className="mt-3 btn btn-outline btn-sm focus-ring"
          >
            Исправить первую ошибку
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={openCheckout}
        className={cn("btn w-full mt-5 focus-ring", hasBlockingErrors ? "btn-outline" : "btn-primary")}
      >
        {hasBlockingErrors ? "Перейти к ошибке" : "Открыть заявку"}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <p className="mt-3 text-center text-[12px] text-[var(--rzm-text-muted)]">
        Получите номер заказа на почту. Дальше — короткий звонок, чтобы свериться.
      </p>
    </StepShell>
  );
}

// ─────────────────────────────────────────
// Активный шаг
// ─────────────────────────────────────────
