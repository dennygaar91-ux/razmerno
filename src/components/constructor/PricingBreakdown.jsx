export default function PricingBreakdown({ price = 0, sectionsCount = 1, shelves = 0, drawers = 0, rails = 0 }) {
  const material = Math.round(price * 0.46);
  const hardware = Math.round(price * 0.18);
  const services = Math.round(price * 0.16);
  const logistics = Math.round(price * 0.08);
  const tax = Math.max(0, price - material - hardware - services - logistics);

  const rows = [
    ["Материалы", material],
    ["Фурнитура", hardware],
    ["Работы", services],
    ["Логистика", logistics],
    ["НДС", tax],
  ];

  return (
    <div className="cp-price-breakdown">
      <div className="cp-price-breakdown-head">
        <strong>Расчёт стоимости</strong>
        <small>{sectionsCount} секц. · {shelves} полк. · {drawers} ящ.</small>
      </div>

      <div className="cp-price-breakdown-list">
        {rows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <b>{value.toLocaleString("ru-RU")} ₽</b>
          </div>
        ))}
      </div>

      <div className="cp-price-breakdown-note">
        <span>Штанги: {rails}</span>
        <span>Итог обновляется автоматически</span>
      </div>
    </div>
  );
}
