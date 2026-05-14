import "../styles/constructor-v2-size-panel.css";

const DIMENSION_LIMITS = {
  height: { label: "Высота, мм", range: "200 — 2800", min: 200, max: 2800, step: 50 },
  width: { label: "Ширина, мм", range: "400 — 3000", min: 400, max: 3000, step: 50 },
  depth: { label: "Глубина, мм", range: "300 — 800", min: 300, max: 800, step: 25 },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function SizePanel({ dimensions, sections, onUpdateDimension, onSetSectionCount }) {
  const sectionCount = sections.length;

  function stepDimension(key, delta) {
    const limit = DIMENSION_LIMITS[key];
    const next = clamp(Number(dimensions[key]) + delta, limit.min, limit.max);
    onUpdateDimension(key, next);
  }

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
          {Object.entries(DIMENSION_LIMITS).map(([key, row]) => (
            <div className="rv2-size-row" key={key}>
              <div>
                <strong>{row.label}</strong>
                <span>{row.range}</span>
              </div>

              <div className="rv2-stepper">
                <button type="button" onClick={() => stepDimension(key, -row.step)}>−</button>
                <b>{dimensions[key]}</b>
                <button type="button" onClick={() => stepDimension(key, row.step)}>+</button>
              </div>
            </div>
          ))}

          <div className="rv2-size-row">
            <div>
              <strong>Количество секций</strong>
              <span>от 1 до 6</span>
            </div>

            <div className="rv2-stepper">
              <button type="button" onClick={() => onSetSectionCount(sectionCount - 1)}>−</button>
              <b>{sectionCount}</b>
              <button type="button" onClick={() => onSetSectionCount(sectionCount + 1)}>+</button>
            </div>
          </div>
        </div>

        <div className="rv2-section-widths">
          <strong>Ширина секции</strong>
          <span>Автоматическое распределение</span>

          <div>
            {sections.map((section, index) => (
              <button type="button" key={section.id}>
                {Math.round(section.width)} мм
              </button>
            ))}
          </div>
        </div>

        <div className="rv2-panel-note">Размеры можно изменить на любом шаге</div>
      </div>
    </aside>
  );
}
