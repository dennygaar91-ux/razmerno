const TYPE_LABELS = {
  danger: "Критично",
  warning: "Проверить",
  success: "Готово",
  info: "Совет",
};

export default function IntelligenceSummary({ items }) {
  if (!items?.length) return null;

  return (
    <section className="cp-intelligence" aria-label="Инженерные подсказки">
      <div className="cp-intelligence__head">
        <span>Инженерная проверка</span>
        <b>{items.length}</b>
      </div>

      <div className="cp-intelligence__list">
        {items.map((item, index) => (
          <article className={`cp-intelligence__item is-${item.type}`} key={`${item.title}-${index}`}>
            <div>
              <small>{TYPE_LABELS[item.type] || "Совет"}</small>
              <strong>{item.title}</strong>
            </div>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
