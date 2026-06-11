import { useState } from "react";
import { STEPS, hasErrors } from "./context";
import { formatPrice, hasCatalogBreakdown } from "../shared/lib/price";
import { trackEvent } from "../shared/lib/analytics";
import { cn } from "../utils/cn";
import { useConfigBridge } from "./store/useConfigBridge";

/**
 * Summary panel (п.6.6 ТЗ).
 * Компактная: одна карточка с ценой + CTA + раскрывающийся состав.
 * Снапшот удалён — он дублируется в Review-шаге и CheckoutDrawer.
 */
export function PriceCard() {
  const { state, actions, price, validation } = useConfigBridge();
  const blocked = hasErrors(validation);
  const isLastStep = state.activeStep === STEPS.length - 1;
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const warnings = validation.filter((v) => v.kind !== "error");
  const catalogPrice = hasCatalogBreakdown(price) ? price : null;
  const errors = validation.filter((v) => v.kind === "error");

  const handleSubmit = () => {
    trackEvent("order_form_opened", {
      total: price.total,
      source: isLastStep ? "review" : "side-panel",
    });
    actions.openCheckout("order");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main price card */}
      <div className="bg-[var(--rzm-surface-soft)] rounded-[28px] p-4 xl:p-5 border border-[var(--rzm-line-soft)]/70">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[12px] leading-none text-[var(--rzm-text-muted)]">Стоимость шкафа</div>
            <div className="font-display font-bold text-[28px] xl:text-[30px] tabular-nums text-[var(--rzm-text-main)] leading-none mt-2">
              {formatPrice(price.total)}
            </div>
          </div>
        </div>
        <p className="mt-2 text-[12px] leading-snug text-[var(--rzm-text-muted)]">
          Цена пересчитывается сразу. Заявку отправим с текущей конфигурацией.
        </p>
        {blocked && (
          <div className="status-row mt-3 text-[12px] leading-snug text-[var(--color-accent-ink)] bg-[var(--color-accent-soft)]">
            Исправьте подсказки — после этого можно отправить заявку.
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={blocked}
          className="btn btn-primary w-full mt-4 focus-ring motion-soft"
        >
          {isLastStep ? "Открыть заявку" : "Перейти к заявке"}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Состав цены раскрывается только по запросу */}
        <div className="mt-4 pt-3 border-t border-[var(--rzm-line-soft)]/70">
          <button
            type="button"
            aria-expanded={breakdownOpen}
            onClick={() => setBreakdownOpen((v) => !v)}
            className="w-full flex items-center justify-between text-[12px] text-[var(--rzm-text-muted)] hover:text-[var(--rzm-text-main)] motion-soft focus-ring"
          >
            <span className="font-mono tracking-[0.15em] uppercase">Состав цены</span>
            <svg
              width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"
              className={cn("transition-transform", breakdownOpen && "rotate-180")}
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {breakdownOpen && (
            <ul className="mt-3 space-y-1.5 text-[13px]">
              {catalogPrice && <Row label="Материалы" value={catalogPrice.materials} />}
              <Row label="Корпус" value={price.body} />
              <Row label="Фасады" value={price.facades} />
              {catalogPrice && <Row label="Кромка" value={catalogPrice.edgeBanding} />}
              <Row label="Наполнение" value={price.filling} />
              <Row label="Фурнитура" value={price.hardware} />
              {catalogPrice && <Row label="Услуги" value={catalogPrice.services} />}
              <Row label="Работы" value={price.production} />
              {price.delivery > 0 && <Row label="Доставка" value={price.delivery} />}
            </ul>
          )}
        </div>
      </div>

      {/* Warnings — только если есть */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div
          className={cn(
            "rounded-[22px] p-3 motion-soft border",
            errors.length > 0
              ? "bg-[#fff3ed] border-[rgba(217,74,43,0.18)]"
              : "bg-[var(--rzm-surface-soft)] border-[var(--rzm-line-soft)]/70",
          )}
        >
          <div className="text-[12px] font-semibold text-[var(--rzm-text-main)] mb-1.5">
            {errors.length > 0 ? "Нужно поправить" : "Подсказка"}
          </div>
          <ul className="space-y-1.5">
            {[...errors, ...warnings].slice(0, 2).map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug">
                <span
                  className={cn(
                    "shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full",
                    v.kind === "error" ? "bg-[var(--color-accent)]" : "bg-[#d8a73a]",
                  )}
                />
                <span className="text-[var(--rzm-text-main)]">{v.text}</span>
              </li>
            ))}
          </ul>
          {[...errors, ...warnings].length > 2 && (
            <div className="mt-2 text-[12px] text-[var(--rzm-text-muted)]">
              Еще {[...errors, ...warnings].length - 2} подсказки видно на нужных шагах.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex items-center justify-between text-[var(--rzm-text-muted)]">
      <span>{label}</span>
      <span className="tabular-nums text-[var(--rzm-text-main)]">{formatPrice(value)}</span>
    </li>
  );
}
