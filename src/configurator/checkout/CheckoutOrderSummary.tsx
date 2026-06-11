import { formatPrice } from "../../shared/lib/price";
import type { ConfigState } from "../context";
import type { AssemblyQuote } from "../../pricing/assembly";
import { CheckoutSummaryRow } from "./CheckoutSummaryRow";

export function CheckoutOrderSummary({
  state,
  checkoutTotal,
  bodyMaterial,
  facadeMaterial,
  facadeStyle,
  hardware,
  assemblyEnabled,
  assemblyQuote,
}: {
  state: ConfigState;
  checkoutTotal: number;
  bodyMaterial: { name: string };
  facadeMaterial: { name: string };
  facadeStyle: { name: string };
  hardware: { name: string };
  assemblyEnabled: boolean;
  assemblyQuote: AssemblyQuote;
}) {
  if (!state.type) return null;

  return (
    <div className="bg-[var(--rzm-surface-soft)] rounded-[22px] p-3.5 md:p-4 mb-3 md:mb-4">
      <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--rzm-text-muted)] mb-2">
        Собранный комплект
      </div>
      <ul className="space-y-1 text-[12px]">
        <CheckoutSummaryRow label="Что собираем">
          {state.type === "wardrobe" ? "Шкаф" : state.type === "dresser" ? "Комод" : "Тумба"}
        </CheckoutSummaryRow>
        <CheckoutSummaryRow label="Габариты">{state.width} × {state.height} × {state.depth} мм</CheckoutSummaryRow>
        <CheckoutSummaryRow label="Каркас / фасады">{bodyMaterial.name} · {facadeMaterial.name}</CheckoutSummaryRow>
        <CheckoutSummaryRow label="Открывание">{facadeStyle.name} · {hardware.name}</CheckoutSummaryRow>
        <CheckoutSummaryRow label="Сборка">{assemblyEnabled ? formatPrice(assemblyQuote.price) : "Не нужна"}</CheckoutSummaryRow>
      </ul>
      <div className="mt-3 pt-3 flex items-baseline justify-between">
        <span className="text-[12px] text-[var(--rzm-text-muted)]">Итого</span>
        <span className="font-display font-bold text-[20px] tabular-nums text-[var(--rzm-text-main)]">
          {formatPrice(checkoutTotal)}
        </span>
      </div>
    </div>
  );
}
