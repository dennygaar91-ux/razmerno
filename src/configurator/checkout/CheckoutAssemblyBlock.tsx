import { formatPrice } from "../../shared/lib/price";
import type { AssemblyQuote } from "../../pricing/assembly";

export function CheckoutAssemblyBlock({
  enabled,
  quote,
  onEnabledChange,
}: {
  enabled: boolean;
  quote: AssemblyQuote;
  onEnabledChange: (value: boolean) => void;
}) {
  return (
    <div className="rounded-[18px] border border-[var(--rzm-line-soft)] bg-[var(--rzm-surface-base)] p-3.5">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
          className="mt-1 h-4 w-4 accent-[var(--rzm-text-main)]"
        />
        <span>
          <span className="block text-[13px] font-medium text-[var(--rzm-text-main)]">Заказать сборку</span>
          <span className="block mt-0.5 text-[12px] leading-snug text-[var(--rzm-text-muted)]">
            +10% от стоимости шкафа без доставки: {formatPrice(quote.price)}
          </span>
        </span>
      </label>
    </div>
  );
}
