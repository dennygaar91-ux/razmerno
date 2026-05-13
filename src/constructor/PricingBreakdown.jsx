const PRICE_ROWS = [
  ["materials", "Материалы"],
  ["hardware", "Фурнитура"],
  ["cutting", "Распил"],
  ["edging", "Кромление"],
  ["drilling", "Присадка"],
  ["packaging", "Упаковка"],
  ["delivery", "Доставка"],
  ["vat", "НДС"],
];

function formatPrice(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("ru-RU")} ₽`;
}

export default function PricingBreakdown({ price }) {
  if (!price) return null;

  const subtotal = PRICE_ROWS.reduce((sum, [key]) => {
    if (key === "vat") return sum;
    return sum + (Number(price[key]) || 0);
  }, 0);

  return (
    <section className="cp-pricing-breakdown" aria-label="Детализация стоимости">
      <button type="button" className="cp-pricing-breakdown__head">
        <span>Из чего складывается цена</span>
        <b>{formatPrice(subtotal)}</b>
      </button>

      <div className="cp-pricing-breakdown__list">
        {PRICE_ROWS.map(([key, label]) => (
          <div key={key} className={key === "vat" ? "is-muted" : ""}>
            <span>{label}</span>
            <b>{formatPrice(price[key])}</b>
          </div>
        ))}
      </div>
    </section>
  );
}
