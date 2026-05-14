import "../styles/constructor-v2-size-panel.css";

const SIZE_ROWS = [
  { label: "Высота, мм", range: "200 — 2800", value: "2400" },
  { label: "Ширина, мм", range: "400 — 3000", value: "1800" },
  { label: "Глубина, мм", range: "300 — 800", value: "600" },
  { label: "Количество секций", range: "от 1 до 6", value: "3" },
];

export default function SizePanel() {
  return (
    <aside className="rv2-sidebar">
      <div className="rv2-card rv2-size-panel">
        <div className="rv2-panel-head">
          <span className="rv2-card-index">1</span>
          <div>
            <h3>Размеры и секции</h3>
            <p>Укажите габариты шкафа и количество секций. Конструктор сразу пересчитает проект.</p>
          </div>
        </div>

        <div className="rv2-size-list">
          {SIZE_ROWS.map((row) => (
            <div className="rv2-size-row" key={row.label}>
              <div>
                <strong>{row.label}</strong>
                <span>{row.range}</span>
              </div>

              <div className="rv2-stepper">
                <button type="button">−</button>
                <b>{row.value}</b>
                <button type="button">+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="rv2-section-widths">
          <strong>Ширина секции</strong>
          <span>Автоматическое распределение</span>

          <div>
            <button type="button">600 мм</button>
            <button type="button">600 мм</button>
            <button type="button">600 мм</button>
          </div>
        </div>

        <div className="rv2-panel-note">Размеры можно изменить на любом шаге</div>
      </div>
    </aside>
  );
}
