import { formatPrice } from "../../shared/lib/price";
import type { DeliveryQuote } from "../../pricing/delivery";
import type { CheckoutErrors } from "./useCheckoutSubmit";
import { CheckoutField } from "./CheckoutField";

export function CheckoutDeliveryBlock({
  enabled,
  address,
  quote,
  error,
  onEnabledChange,
  onAddressChange,
  clearError,
}: {
  enabled: boolean;
  address: string;
  quote: DeliveryQuote;
  error?: string;
  onEnabledChange: (value: boolean) => void;
  onAddressChange: (value: string) => void;
  clearError: (key: keyof CheckoutErrors) => void;
}) {
  return (
    <div className="rounded-[18px] border border-[var(--rzm-line-soft)] bg-white p-3.5">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => {
            onEnabledChange(event.target.checked);
            if (error) clearError("deliveryAddress");
          }}
          className="mt-1 h-4 w-4 accent-[var(--rzm-text-main)]"
        />
        <span>
          <span className="block text-[13px] font-medium text-[var(--rzm-text-main)]">Нужна доставка</span>
          <span className="block mt-0.5 text-[12px] leading-snug text-[var(--rzm-text-muted)]">
            Внутри МКАД — 6 000 ₽. За пределами МКАД — +50 ₽/км. Адрес нужен для расчёта.
          </span>
        </span>
      </label>

      {enabled && (
        <div className="mt-3">
          <CheckoutField
            label="Адрес доставки"
            value={address}
            onChange={(value) => {
              onAddressChange(value);
              if (error) clearError("deliveryAddress");
            }}
            error={error}
            placeholder="Москва, улица, дом, квартира"
            autoComplete="street-address"
            required
          />
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="text-[var(--rzm-text-muted)]">{quote.message}</span>
            <span className="font-medium text-[var(--rzm-text-main)]">{formatPrice(quote.price)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
