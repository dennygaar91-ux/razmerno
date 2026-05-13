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
    <section className="cp-price-breakdown" aria-label="Детализация стоимости">
      <div className="cp-price-breakdown-head">
        <strong>Из чего складывается цена</strong>
        <small>До НДС: {formatPrice(subtotal)}</small>
      </div>

      <div className="cp-price-breakdown-list">
        {PRICE_ROWS.map(([key, label]) => (
          <div key={key}>
            <span>{label}</span>
            <b>{formatPrice(price[key])}</b>
          </div>
        ))}
      </div>

      <div className="cp-price-breakdown-note">
        <span>Расчёт предварительный</span>
        <span>обновляется автоматически</span>
      </div>
    </section>
  );
}
