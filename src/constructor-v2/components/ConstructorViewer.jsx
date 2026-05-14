import SectionFillPreview from "./SectionFillPreview";
import "../styles/constructor-v2-viewer.css";
import "../styles/constructor-v2-viewer-tools.css";
import "../styles/constructor-v2-fill-preview.css";

function getItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}

function getSectionTitle(section) {
  const shelves = getItemCount(section, "shelf");
  const drawers = getItemCount(section, "drawer");
  const rails = getItemCount(section, "hanger_rail");

  const parts = [
    shelves ? `${shelves}П` : "",
    drawers ? `${drawers}Я` : "",
    rails ? "Ш" : "",
  ].filter(Boolean);

  return parts.length ? parts.join(" · ") : "Пусто";
}

function getSectionSubtitle(section) {
  const shelves = getItemCount(section, "shelf");
  const drawers = getItemCount(section, "drawer");
  const rails = getItemCount(section, "hanger_rail");

  if (rails && drawers) return "Комбинированная";
  if (rails) return "Штанга";
  if (drawers) return "Ящики";
  if (shelves) return "Полки";
  return "Добавьте наполнение";
}

export default function ConstructorViewer({
  config,
  activeSectionId,
  onSelectSection,
  onAddShelf,
  onAddDrawer,
  onToggleRail,
  onClearSection,
}) {
  const sections = config.sections;
  const dimensions = config.dimensions;

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
        <div className="rv2-dimension-label rv2-dimension-height">{dimensions.height} мм</div>
        <div className="rv2-dimension-label rv2-dimension-width">{dimensions.width} мм</div>

        <div className="rv2-cabinet-placeholder" style={{ gridTemplateColumns: sections.map((section) => `${section.width}fr`).join(" ") }}>
          {sections.map((section, index) => {
            const isActive = section.id === activeSectionId;

            return (
              <button
                type="button"
                className={`rv2-cabinet-section ${isActive ? "active" : ""}`}
                key={section.id}
                onClick={() => onSelectSection(section.id)}
              >
                <span>{index + 1}</span>

                <SectionFillPreview section={section} />

                <strong>{getSectionTitle(section)}</strong>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rv2-viewer-tools">
        <div className="rv2-quick-actions">
          <button type="button" onClick={onAddShelf}>+ Полка</button>
          <button type="button" onClick={onAddDrawer}>+ Ящик</button>
          <button type="button" onClick={onToggleRail}>Штанга</button>
          <button type="button" onClick={onClearSection}>Очистить</button>
        </div>

        <div className="rv2-section-map">
          <div className="rv2-section-map-head">
            <div>
              <strong>Карта секций</strong>
              <span>Наглядная схема наполнения по секциям</span>
            </div>
          </div>

          <div className="rv2-section-map-grid" style={{ gridTemplateColumns: `repeat(${sections.length}, minmax(0, 1fr))` }}>
            {sections.map((section, index) => {
              const isActive = section.id === activeSectionId;

              return (
                <button
                  key={section.id}
                  type="button"
                  className={`rv2-section-tile ${isActive ? "active" : ""}`}
                  onClick={() => onSelectSection(section.id)}
                >
                  <div>
                    <b>{index + 1}</b>
                  </div>

                  <div>
                    <strong>{getSectionTitle(section)}</strong>
                    <span>{getSectionSubtitle(section)}</span>
                  </div>

                  <i />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
