import "../styles/constructor-v2-viewer.css";
import "../styles/constructor-v2-viewer-tools.css";

const SECTIONS = [
  {
    id: 1,
    title: "4П · 2Я",
    subtitle: "Полки и ящики",
    active: true,
  },
  {
    id: 2,
    title: "Ш",
    subtitle: "Штанга",
  },
  {
    id: 3,
    title: "3П",
    subtitle: "Полки",
  },
];

export default function ConstructorViewer() {
  return (
    <div className="rv2-viewer">
      <div className="rv2-viewer-toolbar">
        <div className="rv2-tabs">
          <button className="active">3D</button>
          <button>2D</button>
        </div>

        <div className="rv2-scale">
          <button>-</button>
          <strong>100%</strong>
          <button>+</button>
        </div>
      </div>

      <div className="rv2-stage">
        <div className="rv2-cabinet-placeholder" />
      </div>

      <div className="rv2-viewer-tools">
        <div className="rv2-quick-actions">
          <button type="button">+ Полка</button>
          <button type="button">+ Ящик</button>
          <button type="button">Штанга</button>
          <button type="button">Очистить</button>
        </div>

        <div className="rv2-section-map">
          <div className="rv2-section-map-head">
            <div>
              <strong>Карта секций</strong>
              <span>Наглядная схема наполнения по секциям</span>
            </div>
          </div>

          <div className="rv2-section-map-grid">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`rv2-section-tile ${section.active ? "active" : ""}`}
              >
                <div>
                  <b>{section.id}</b>
                </div>

                <div>
                  <strong>{section.title}</strong>
                  <span>{section.subtitle}</span>
                </div>

                <i />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
