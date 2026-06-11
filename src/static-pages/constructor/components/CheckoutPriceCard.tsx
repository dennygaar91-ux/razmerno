import type { QuoteState } from "../types";

export function CheckoutPriceCard({
  quote,
  quoteError,
  formatPrice,
}: {
  quote: QuoteState | null;
  quoteError: string;
  formatPrice: (value: number) => string;
}) {
  const pricingNotice = quote?.pricingNotice ?? null;
  const noticeText = quoteError || pricingNotice?.clientMessage || quote?.message || "Стоимость обновляется после выбора доставки и сборки.";
  const priceText = (value: number | undefined) => (quote && typeof value === "number" ? formatPrice(value) : "Считаем");

  const rows = [
    { label: "Материалы", value: priceText(quote?.materials) },
    { label: "Фурнитура", value: priceText(quote?.hardwareAndFilling) },
    { label: "Работы", value: priceText(quote?.services) },
    { label: "Доставка / сборка", value: priceText(quote?.extra) },
  ];

  return (
    <section className="rzm-constructor-card rzm-constructor-breakdown-card rzm-checkout-price-card rzm-r18-price-card rzm-r28-price-card" aria-live="polite">
      <div className="rzm-r28-price-summary">
        <div>
          <span className="rzm-r18-section-kicker">Смета</span>
          <h2 className="rzm-constructor-card-title">Итоговая стоимость</h2>
        </div>
        <strong>{quote ? formatPrice(quote.total) : "Считаем"}</strong>
      </div>

      <p className="rzm-r18-muted-line rzm-r28-muted-line">{noticeText}</p>

      {pricingNotice ? (
        <div className={`rzm-pricing-notice rzm-pricing-notice--${pricingNotice.level} rzm-r18-pricing-notice rzm-r28-pricing-notice`}>
          <strong>{pricingNotice.clientLabel}</strong>
          <span>{pricingNotice.level === "fallback" ? "Менеджер проверит прайс перед запуском." : "Материалы учтены в текущей смете."}</span>
        </div>
      ) : null}

      <div className="rzm-r18-price-list rzm-r28-price-list" aria-label="Разбивка стоимости">
        {rows.map((row) => (
          <span key={row.label}>
            <b>{row.label}</b>
            <strong>{row.value}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}
